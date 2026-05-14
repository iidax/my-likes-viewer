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
  if (start === -1 || end === 0) throw new Error("like.js の形式が不正です");

  let raw: RawLike[];
  try {
    raw = JSON.parse(content.slice(start, end));
  } catch {
    throw new Error(
      "like.js の JSON 解析に失敗しました。ファイルが壊れていないか確認してください。",
    );
  }

  try {
    return raw.map(({ like }, index) => ({
      tweetId: like.tweetId,
      fullText: like.fullText,
      expandedUrl: like.expandedUrl,
      tweetedAt: snowflakeToDate(like.tweetId).getTime(),
      likeOrder: index,
    }));
  } catch {
    throw new Error(
      "like.js の構造が想定と異なります。X のデータアーカイブに含まれる data/like.js を選択してください。",
    );
  }
}
