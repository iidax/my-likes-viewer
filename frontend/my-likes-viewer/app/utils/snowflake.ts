const TWITTER_EPOCH = 1288834974657n;

export function snowflakeToDate(tweetId: string): Date {
  const timestamp = (BigInt(tweetId) >> 22n) + TWITTER_EPOCH;
  return new Date(Number(timestamp));
}
