CREATE TABLE IF NOT EXISTS oembed_cache (
  tweet_id   TEXT    PRIMARY KEY,
  html       TEXT    NOT NULL,
  fetched_at INTEGER NOT NULL
);
