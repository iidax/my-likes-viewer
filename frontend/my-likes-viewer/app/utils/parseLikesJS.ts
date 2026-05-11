import type { Like } from "../types";
import { snowflakeToDate } from "./snowflake";

interface RawLike {
  like: {
    tweetId: string;
    fullText: string;
    expandedUrl: string;
  };
}

export function parseLikesJS(content: string): Like[] {
  const start = content.indexOf("[");
  const end = content.lastIndexOf("]") + 1;
  if (start === -1 || end === 0) throw new Error("likes.js の形式が不正です");

  const raw: RawLike[] = JSON.parse(content.slice(start, end));
  return raw.map(({ like }, index) => ({
    tweetId: like.tweetId,
    fullText: like.fullText,
    expandedUrl: like.expandedUrl,
    tweetedAt: snowflakeToDate(like.tweetId).getTime(),
    likeOrder: index,
  }));
}
