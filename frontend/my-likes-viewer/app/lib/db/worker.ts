import sqlite3InitModule from "@sqlite.org/sqlite-wasm";
import { runMigrations } from "./migrate";

// SQLite WASM はメインスレッドで動かすと UI をブロックするため Web Worker 内で実行する
// メインスレッドとは postMessage / onmessage でやり取りする（client.ts 参照）

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = any;
type BindParam = string | number | null;

let db: DB | null = null;

async function init() {
  const sqlite3 = await sqlite3InitModule();

  // OPFS SAH Pool VFS: Origin Private File System を使ってブラウザに永続保存する仕組み
  // IndexedDB より高速で、ファイルシステムに近いアクセスが可能
  if (typeof sqlite3.installOpfsSAHPoolVfs !== "function") {
    throw new Error("OPFS SAH Pool VFS is unavailable in this browser.");
  }
  const poolUtil = await sqlite3.installOpfsSAHPoolVfs({});
  db = new poolUtil.OpfsSAHPoolDb("/my-likes.db");
  runMigrations(db);

  // 初期化完了をメインスレッドに通知（client.ts の _readyPromise を解決する）
  (self as unknown as Worker).postMessage({ type: "ready" });
}

// メインスレッドからのメッセージを受け取り、SQLite 操作を実行して結果を返す
self.addEventListener("message", (e: Event) => {
  const { id, type, sql, bind, statements } = (e as MessageEvent).data;
  if (!db) {
    (self as unknown as Worker).postMessage({ id, ok: false, error: "DB not initialized" });
    return;
  }
  try {
    if (type === "exec") {
      // INSERT / UPDATE / DELETE など結果を返さない操作
      db.exec({ sql, bind });
      (self as unknown as Worker).postMessage({ id, ok: true });
    } else if (type === "query") {
      // SELECT で複数行を返す操作
      const rows: Record<string, unknown>[] = [];
      db.exec({
        sql,
        bind,
        rowMode: "object",
        callback: (row: Record<string, unknown>) => rows.push({ ...row }),
      });
      (self as unknown as Worker).postMessage({ id, ok: true, rows });
    } else if (type === "queryOne") {
      // SELECT で1行だけ返す操作（COUNT など）
      let row: Record<string, unknown> | undefined;
      db.exec({
        sql,
        bind,
        rowMode: "object",
        callback: (r: Record<string, unknown>) => {
          if (!row) row = { ...r };
        },
      });
      (self as unknown as Worker).postMessage({ id, ok: true, row });
    } else if (type === "clearDb") {
      // 設定画面の「データベースをクリア」から呼ばれる
      // メモリキャッシュ(_memCache / _unavailableCache)は呼び出し元(settings.tsx)で別途クリアする
      db.exec("DELETE FROM oembed_cache");
      db.exec("DELETE FROM media");
      db.exec("DELETE FROM likes");
      (self as unknown as Worker).postMessage({ id, ok: true });
    } else if (type === "batch") {
      // 複数の INSERT を1トランザクションにまとめて実行（likes.js インポート時に使用）
      db.exec("BEGIN");
      try {
        for (const { sql: s, bind: b } of statements as { sql: string; bind?: BindParam[] }[]) {
          db.exec({ sql: s, bind: b });
        }
        db.exec("COMMIT");
        (self as unknown as Worker).postMessage({ id, ok: true });
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }
    }
  } catch (err) {
    (self as unknown as Worker).postMessage({ id, ok: false, error: String(err) });
  }
});

init();
