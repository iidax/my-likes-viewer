import { getOembedCache, setOembedCache } from "../lib/db/oembed";

const _memCache = new Map<string, string>();

export function clearOembedMemCache(): void {
  _memCache.clear();
}

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

export async function fetchOembed(tweetId: string): Promise<string | null> {
  if (_memCache.has(tweetId)) return _memCache.get(tweetId)!;

  const cached = await getOembedCache(tweetId);
  if (cached) {
    _memCache.set(tweetId, cached);
    return cached;
  }

  await acquireSlot();
  try {
    const url = `https://publish.twitter.com/oembed?url=https://twitter.com/i/status/${tweetId}&omit_script=true`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = (await res.json()) as { html?: string };
    if (!data.html) return null;
    await setOembedCache(tweetId, data.html);
    _memCache.set(tweetId, data.html);
    return data.html;
  } catch {
    return null;
  } finally {
    releaseSlot();
  }
}
