CREATE TABLE IF NOT EXISTS order_items (
  id             SERIAL PRIMARY KEY,
  order_id       UUID          REFERENCES orders(id) ON DELETE CASCADE,
  product_id     INT           REFERENCES products(id),
  product_name   VARCHAR(255)  NOT NULL,
  product_image  VARCHAR(500),
  unit_price     NUMERIC(10,2) NOT NULL,
  quantity       INT           NOT NULL,
  size           VARCHAR(10),
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
