import type { Like } from "../../types";
import { getDb } from "./client";

export interface LikeQueryOptions {
  fromDate?: number; // Unix ms
  page: number;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 10;

export async function hasLikes(): Promise<boolean> {
  const db = await getDb();
  const row = db.selectObject("SELECT COUNT(*) as count FROM likes");
  return row.count > 0;
}

export async function countLikes(fromDate?: number): Promise<number> {
  const db = await getDb();
  if (fromDate != null) {
    const row = db.selectObject(
      "SELECT COUNT(*) as count FROM likes WHERE tweeted_at >= ?",
      [fromDate],
    );
    return row.count as number;
  }
  const row = db.selectObject("SELECT COUNT(*) as count FROM likes");
  return row.count as number;
}

export async function queryLikes(opts: LikeQueryOptions): Promise<Like[]> {
  const db = await getDb();
  const pageSize = opts.pageSize ?? DEFAULT_PAGE_SIZE;
  const offset = opts.page * pageSize;

  const rows: Like[] = [];

  if (opts.fromDate != null) {
    db.exec({
      sql: `SELECT tweet_id, full_text, expanded_url, tweeted_at, like_order
            FROM likes
            WHERE tweeted_at >= ?
            ORDER BY tweeted_at DESC
            LIMIT ? OFFSET ?`,
      bind: [opts.fromDate, pageSize, offset],
      rowMode: "object",
      callback: (row: Record<string, unknown>) => {
        rows.push({
          tweetId: row["tweet_id"] as string,
          fullText: row["full_text"] as string,
          expandedUrl: row["expanded_url"] as string,
          tweetedAt: row["tweeted_at"] as number,
          likeOrder: row["like_order"] as number,
        });
      },
    });
  } else {
    db.exec({
      sql: `SELECT tweet_id, full_text, expanded_url, tweeted_at, like_order
            FROM likes
            ORDER BY tweeted_at DESC
            LIMIT ? OFFSET ?`,
      bind: [pageSize, offset],
      rowMode: "object",
      callback: (row: Record<string, unknown>) => {
        rows.push({
          tweetId: row["tweet_id"] as string,
          fullText: row["full_text"] as string,
          expandedUrl: row["expanded_url"] as string,
          tweetedAt: row["tweeted_at"] as number,
          likeOrder: row["like_order"] as number,
        });
      },
    });
  }

  return rows;
}

export async function insertLikes(likes: Like[]): Promise<void> {
  const db = await getDb();
  db.exec("BEGIN");
  try {
    for (const like of likes) {
      db.exec({
        sql: `INSERT OR IGNORE INTO likes (tweet_id, full_text, expanded_url, tweeted_at, like_order)
              VALUES (?, ?, ?, ?, ?)`,
        bind: [like.tweetId, like.fullText, like.expandedUrl, like.tweetedAt, like.likeOrder],
      });
    }
    db.exec("COMMIT");
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}
