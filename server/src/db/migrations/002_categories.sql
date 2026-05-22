CREATE TABLE IF NOT EXISTS categories (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100)  NOT NULL,
  slug         VARCHAR(100)  UNIQUE NOT NULL,
  flag_emoji   VARCHAR(10),
  sort_order   INT           NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
