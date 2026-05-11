export interface Like {
  tweetId: string;
  fullText: string;
  expandedUrl: string;
  tweetedAt: number;  // Unix ms (Snowflake ID から算出)
  likeOrder: number;  // likes.js 配列のインデックス (0 = 最も新しくいいねした)
}

export interface Media {
  id: number;
  tweetId: string;
  url: string;
}
