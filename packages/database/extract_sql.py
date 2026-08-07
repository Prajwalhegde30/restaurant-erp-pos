import sys
import os

with open('all.sql', 'r', encoding='utf-16') as f:
    lines = f.readlines()

output = []
recording = False
for line in lines:
    if 'CREATE TYPE "CustomerStatus"' in line or 'CREATE TYPE "CouponType"' in line or 'CREATE TYPE "CouponStatus"' in line or 'CREATE TYPE "GiftCardStatus"' in line or 'CREATE TYPE "LoyaltyTransactionType"' in line or 'CREATE TYPE "MembershipTier"' in line:
        output.append(line)
    elif line.startswith('CREATE TABLE "customers"') or line.startswith('CREATE TABLE "memberships"') or line.startswith('CREATE TABLE "loyalty_ledgers"') or line.startswith('CREATE TABLE "coupons"') or line.startswith('CREATE TABLE "gift_cards"'):
        recording = True
        output.append(line)
    elif recording:
        output.append(line)
        if line.startswith(');'):
            recording = False
    elif line.startswith('ALTER TABLE "customers"') or line.startswith('ALTER TABLE "memberships"') or line.startswith('ALTER TABLE "loyalty_ledgers"') or line.startswith('ALTER TABLE "coupons"') or line.startswith('ALTER TABLE "gift_cards"'):
        output.append(line)
    elif line.startswith('CREATE INDEX "customers_') or line.startswith('CREATE INDEX "memberships_') or line.startswith('CREATE INDEX "loyalty_ledgers_') or line.startswith('CREATE INDEX "coupons_') or line.startswith('CREATE INDEX "gift_cards_'):
        output.append(line)
    elif 'ADD COLUMN "customer_id"' in line or 'ADD COLUMN "coupon_id"' in line:
        output.append(line)
    elif line.startswith('ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey"') or line.startswith('ALTER TABLE "orders" ADD CONSTRAINT "orders_coupon_id_fkey"') or line.startswith('ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_fkey"'):
        output.append(line)

# Add the manual UNIQUE indexes!
output.append('\n-- Manual Partial Unique Indexes for CRM (Soft Delete Support)\n')
output.append('CREATE UNIQUE INDEX "customers_tenant_id_email_key" ON "customers"("tenant_id", "email") WHERE "is_deleted" = false;\n')
output.append('CREATE UNIQUE INDEX "customers_tenant_id_phone_key" ON "customers"("tenant_id", "phone") WHERE "is_deleted" = false;\n')
output.append('CREATE UNIQUE INDEX "coupons_tenant_id_code_key" ON "coupons"("tenant_id", "code") WHERE "is_deleted" = false;\n')
output.append('CREATE UNIQUE INDEX "gift_cards_tenant_id_code_key" ON "gift_cards"("tenant_id", "code") WHERE "is_deleted" = false;\n')

os.makedirs('prisma/migrations/20260807000000_phase_9_crm_foundation', exist_ok=True)
with open('prisma/migrations/20260807000000_phase_9_crm_foundation/migration.sql', 'w', encoding='utf-8') as f:
    f.writelines(output)
