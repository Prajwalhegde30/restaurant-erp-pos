-- Drop global unique indexes
DROP INDEX IF EXISTS "orders_idempotency_key_key";
DROP INDEX IF EXISTS "payments_idempotency_key_key";
DROP INDEX IF EXISTS "refunds_idempotency_key_key";

-- Create tenant-scoped unique indexes
CREATE UNIQUE INDEX "orders_tenant_id_idempotency_key_key" ON "orders"("tenant_id", "idempotency_key");
CREATE UNIQUE INDEX "payments_tenant_id_idempotency_key_key" ON "payments"("tenant_id", "idempotency_key");
CREATE UNIQUE INDEX "refunds_tenant_id_idempotency_key_key" ON "refunds"("tenant_id", "idempotency_key");
