import type { Like } from "../../types";
import { getDb } from "./client";

export interface LikeQueryOptions {
  fromDate?: number; // Unix ms
  untilDate?: number; // Unix ms
  page: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

export async function getOldestTweetDate(): Promise<number | null> {
  const db = await getDb();
  const row = await db.selectObject("SELECT MIN(tweeted_at) as min_at FROM likes");
  const val = row?.min_at;
  return val != null ? (val as number) : null;
}

export async function hasLikes(): Promise<boolean> {
  const db = await getDb();
  const row = await db.selectObject("SELECT COUNT(*) as count FROM likes");
  return ((row?.count ?? 0) as number) > 0;
}

export async function countLikes(fromDate?: number, untilDate?: number): Promise<number> {
  const db = await getDb();
  const conditions: string[] = [];
  const params: number[] = [];
  if (fromDate != null) {
    conditions.push("tweeted_at >= ?");
    params.push(fromDate);
  }
  if (untilDate != null) {
    conditions.push("tweeted_at <= ?");
    params.push(untilDate);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const row = await db.selectObject(
    `SELECT COUNT(*) as count FROM likes ${where}`,
    params.length ? params : undefined,
  );
  return (row?.count ?? 0) as number;
}

export async function queryLikes(opts: LikeQueryOptions): Promise<Like[]> {
  const db = await getDb();
  const pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  const offset = opts.page * pageSize;

  const conditions: string[] = [];
  const params: (number | string)[] = [];
  if (opts.fromDate != null) {
    conditions.push("tweeted_at >= ?");
    params.push(opts.fromDate);
  }
  if (opts.untilDate != null) {
    conditions.push("tweeted_at <= ?");
    params.push(opts.untilDate);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const rows = await db.selectObjects(
    `SELECT tweet_id, full_text, expanded_url, tweeted_at, like_order
     FROM likes
     ${where}
     ORDER BY tweeted_at DESC
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset],
  );

  return rows.map((row) => ({
    tweetId: row["tweet_id"] as string,
    fullText: row["full_text"] as string,
    expandedUrl: row["expanded_url"] as string,
    tweetedAt: row["tweeted_at"] as number,
    likeOrder: row["like_order"] as number,
  }));
}

export async function getTweetDatesAtOffsets(
  offsets: number[],
  fromDate?: number,
  untilDate?: number,
): Promise<(number | null)[]> {
  const db = await getDb();
  const conditions: string[] = [];
  const params: number[] = [];
  if (fromDate != null) {
    conditions.push("tweeted_at >= ?");
    params.push(fromDate);
  }
  if (untilDate != null) {
    conditions.push("tweeted_at <= ?");
    params.push(untilDate);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const results = await Promise.all(
    offsets.map((offset) =>
      db.selectObject(
        `SELECT tweeted_at FROM likes ${where} ORDER BY tweeted_at DESC LIMIT 1 OFFSET ?`,
        [...params, offset],
      ),
    ),
  );
  return results.map((row) => (row?.tweeted_at != null ? (row.tweeted_at as number) : null));
}

export async function insertLikes(likes: Like[]): Promise<void> {
  const db = await getDb();
  await db.batch(
    likes.map((like) => ({
      sql: `INSERT OR IGNORE INTO likes (tweet_id, full_text, expanded_url, tweeted_at, like_order)
            VALUES (?, ?, ?, ?, ?)`,
      bind: [like.tweetId, like.fullText, like.expandedUrl, like.tweetedAt, like.likeOrder],
    })),
  );
}
