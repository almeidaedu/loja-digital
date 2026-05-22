CREATE TABLE IF NOT EXISTS cart_items (
  id           SERIAL PRIMARY KEY,
  user_id      UUID    REFERENCES users(id) ON DELETE CASCADE,
  product_id   INT     REFERENCES products(id) ON DELETE CASCADE,
  quantity     INT     NOT NULL DEFAULT 1,
  size         VARCHAR(10),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, product_id, size)
);
