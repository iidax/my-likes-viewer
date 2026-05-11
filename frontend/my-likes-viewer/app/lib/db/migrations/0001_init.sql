CREATE TABLE IF NOT EXISTS likes (
  tweet_id     TEXT    PRIMARY KEY,
  full_text    TEXT    NOT NULL,
  expanded_url TEXT    NOT NULL,
  tweeted_at   INTEGER NOT NULL,
  like_order   INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS media (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  tweet_id TEXT    NOT NULL REFERENCES likes(tweet_id),
  url      TEXT    NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
