import { getDb } from "./client";

export async function getOembedCache(tweetId: string): Promise<string | null> {
  const db = await getDb();
  const row = await db.selectObject(
    "SELECT html FROM oembed_cache WHERE tweet_id = ?",
    [tweetId],
  );
  return (row?.html as string) ?? null;
}

export async function setOembedCache(tweetId: string, html: string): Promise<void> {
  const db = await getDb();
  await db.exec(
    "INSERT OR REPLACE INTO oembed_cache (tweet_id, html, fetched_at) VALUES (?, ?, ?)",
    [tweetId, html, Date.now()],
  );
}
