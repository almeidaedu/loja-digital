-- Frete calculado no servidor. Pedidos anteriores não cobravam frete, então o
-- subtotal deles é o próprio total. A coluna entra anulável, é preenchida e só
-- depois vira NOT NULL: adicionar direto como obrigatória falha com pedidos na
-- tabela.

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "shipping_cost" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "subtotal" DECIMAL(10,2);

UPDATE "orders" SET "subtotal" = "total_amount";

ALTER TABLE "orders" ALTER COLUMN "subtotal" SET NOT NULL;

-- CreateTable
-- Uma linha só: o CHECK impede no banco o que o `@default(1)` só sugere.
-- Prisma não modela CHECK e o ignora na comparação de schema, então não gera drift.
CREATE TABLE "store_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "data" JSONB NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "store_settings_single_row" CHECK ("id" = 1)
);
