CREATE TABLE IF NOT EXISTS products (
  id             SERIAL PRIMARY KEY,
  category_id    INT           REFERENCES categories(id) ON DELETE SET NULL,
  name           VARCHAR(255)  NOT NULL,
  slug           VARCHAR(255)  UNIQUE NOT NULL,
  description    TEXT,
  price          NUMERIC(10,2) NOT NULL,
  original_price NUMERIC(10,2),
  stock          INT           NOT NULL DEFAULT 0,
  image_url      VARCHAR(500),
  badge          VARCHAR(30),
  rating         NUMERIC(3,2)  NOT NULL DEFAULT 5.00,
  review_count   INT           NOT NULL DEFAULT 0,
  active         BOOLEAN       NOT NULL DEFAULT TRUE,
  featured       BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
