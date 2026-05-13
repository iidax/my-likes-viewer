import { getOembedCache, setOembedCache } from "../lib/db/oembed";

export type OembedResult =
  | { html: string; reason: "ok" }
  | { html: null; reason: "unavailable" | "error" };

// 第1層: メモリキャッシュ（ページリロードで消える）
// SQLite への非同期アクセスを省いて即時返却するための高速レイヤー
const _memCache = new Map<string, string>();

// 第2層: 取得失敗キャッシュ（ページリロードで消える・永続化しない方針）
// 404/403 だったツイートを記録し、同セッション内での再リクエストを防ぐ
const _unavailableCache = new Set<string>();

// 第3層: SQLite（OPFS に永続化）
// ブラウザを閉じても残る。getOembedCache / setOembedCache を通じてアクセスする

// 「データベースをクリア」実行時にメモリ上のキャッシュも合わせて破棄する
export function clearOembedMemCache(): void {
  _memCache.clear();
  _unavailableCache.clear();
}

// Twitter oEmbed API への同時リクエスト数を制限するセマフォ
// レート制限への配慮と、大量ツイートを一括表示する際の負荷軽減が目的
let _active = 0;
const MAX_CONCURRENT = 3;
const _queue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (_active < MAX_CONCURRENT) {
    _active++;
    return Promise.resolve();
  }
  return new Promise((resolve) => _queue.push(resolve));
}

function releaseSlot(): void {
  const next = _queue.shift();
  if (next) {
    next();
  } else {
    _active--;
  }
}

export async function fetchOembed(tweetId: string): Promise<OembedResult> {
  // メモリキャッシュにあれば即返却（SQLite アクセス不要）
  if (_memCache.has(tweetId)) return { html: _memCache.get(tweetId)!, reason: "ok" };

  // 同セッション内で既に失敗と判明しているツイートは再リクエストしない
  if (_unavailableCache.has(tweetId)) return { html: null, reason: "unavailable" };

  // SQLite キャッシュを確認（ブラウザを閉じても残る永続レイヤー）
  const cached = await getOembedCache(tweetId);
  if (cached) {
    _memCache.set(tweetId, cached); // 次回以降はメモリから返すよう昇格
    return { html: cached, reason: "ok" };
  }

  // キャッシュ未ヒット: Twitter oEmbed API を実際に叩く
  await acquireSlot();
  try {
    const url = `https://publish.twitter.com/oembed?url=https://twitter.com/i/status/${tweetId}&omit_script=true`;
    const res = await fetch(url);

    // 404/403: 削除済み・非公開・凍結アカウント等でツイートが取得不可
    // → 失敗キャッシュに記録（永続化はしない）
    if (res.status === 404 || res.status === 403) {
      _unavailableCache.add(tweetId);
      return { html: null, reason: "unavailable" };
    }

    // その他の HTTP エラー: 一時的な障害の可能性があるためキャッシュしない
    if (!res.ok) return { html: null, reason: "error" };

    const data = (await res.json()) as { html?: string };
    if (!data.html) return { html: null, reason: "error" };

    // 取得成功: SQLite とメモリの両方に保存
    await setOembedCache(tweetId, data.html);
    _memCache.set(tweetId, data.html);
    return { html: data.html, reason: "ok" };
  } catch {
    // CORS ブロックを含むネットワークエラー。同セッション内で再試行しないようキャッシュする
    _unavailableCache.add(tweetId);
    return { html: null, reason: "error" };
  } finally {
    releaseSlot();
  }
}
