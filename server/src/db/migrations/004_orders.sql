CREATE TABLE IF NOT EXISTS orders (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID          REFERENCES users(id),
  status                VARCHAR(30)   NOT NULL DEFAULT 'pending',
  total_amount          NUMERIC(10,2) NOT NULL,
  payment_method        VARCHAR(30),
  payment_id            VARCHAR(100),
  mp_preference_id      VARCHAR(100),
  mp_merchant_order_id  VARCHAR(100),
  pix_qr_code           TEXT,
  pix_qr_code_base64    TEXT,
  pix_expiration        TIMESTAMPTZ,
  shipping_address      JSONB,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
