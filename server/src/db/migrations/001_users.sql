CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(150)  NOT NULL,
  email        VARCHAR(255)  UNIQUE NOT NULL,
  password     VARCHAR(255)  NOT NULL,
  role         VARCHAR(20)   NOT NULL DEFAULT 'customer',
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
