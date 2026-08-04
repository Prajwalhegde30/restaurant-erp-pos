-- Task 1.3: Supply Chain & Finance Database Models
-- Migration: 20260804192000_task_1_3_supply_chain_finance_models
--
-- Scope:
--   Supply Chain: suppliers, ingredients, inventory_items, inventory_batches,
--                 stock_movements, recipes, recipe_ingredients,
--                 purchase_orders, purchase_order_items,
--                 goods_receipts, goods_receipt_items
--   Finance: ledger_accounts, shifts, cash_drawers, daily_closings,
--            invoices, payments, refunds, journals, journal_entries
--
-- DatabaseSchema.md constraints applied:
--   §3  — Immutability for stock_movements, journal_entries (post-posting)
--   §7  — tenant_id on every table
--   §8  — many-to-many via explicit join tables (recipe_ingredients)
--   §10 — UUID primary keys
--   §11 — ON DELETE RESTRICT as default
--   §12 — partial unique indexes WHERE is_deleted = false
--   §13 — idempotency_key unique on payments and refunds
--   §14 — version (OCC) on inventory_items and recipes
--   §16 — audit fields
--   §17 — soft delete (where applicable; stock_movements are append-only/no soft delete)
--   §22 — composite indexes per common query patterns

-- =============================================
-- ENUMS — SUPPLY CHAIN
-- =============================================

CREATE TYPE "SupplierStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED');
CREATE TYPE "IngredientUnit" AS ENUM ('KG', 'G', 'L', 'ML', 'PIECE', 'PORTION', 'BOX', 'PACK');
CREATE TYPE "StockMovementType" AS ENUM ('PURCHASE', 'CONSUMPTION', 'SPOILAGE', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'RETURN');
CREATE TYPE "PurchaseOrderStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED');
CREATE TYPE "GoodsReceiptStatus" AS ENUM ('PENDING', 'COMPLETED', 'REJECTED');

-- =============================================
-- ENUMS — FINANCE
-- =============================================

CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'VOIDED', 'REFUNDED');
CREATE TYPE "PaymentStatus" AS ENUM ('INITIATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'VOIDED', 'REFUNDED');
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'MOBILE', 'GIFT_CARD', 'LOYALTY', 'SPLIT');
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'PROCESSED', 'REJECTED');
CREATE TYPE "JournalEntryType" AS ENUM ('DEBIT', 'CREDIT');
CREATE TYPE "LedgerAccountType" AS ENUM ('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE');
CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'CLOSED');
CREATE TYPE "DailyClosingStatus" AS ENUM ('PENDING', 'RECONCILED', 'LOCKED');

-- =============================================
-- SUPPLY CHAIN — SUPPLIER
-- =============================================

CREATE TABLE "suppliers" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"     TEXT NOT NULL,
    "branch_id"     TEXT,
    "name"          TEXT NOT NULL,
    "code"          TEXT NOT NULL,
    "status"        "SupplierStatus" NOT NULL DEFAULT 'ACTIVE',
    "contact_name"  TEXT,
    "contact_email" TEXT,
    "contact_phone" TEXT,
    "address"       TEXT,
    -- Audit Fields
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    "created_by"    TEXT,
    "updated_by"    TEXT,
    -- Soft Delete
    "is_deleted"    BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"    TIMESTAMP(3),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "suppliers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "suppliers_tenant_id_idx" ON "suppliers"("tenant_id");
CREATE INDEX "suppliers_branch_id_idx" ON "suppliers"("branch_id");
CREATE UNIQUE INDEX "suppliers_tenant_id_code_unique" ON "suppliers"("tenant_id", "code") WHERE "is_deleted" = false;

-- =============================================
-- SUPPLY CHAIN — INGREDIENT
-- Closes the forward-reference from order_item_recipe_snapshots.ingredient_id.
-- =============================================

CREATE TABLE "ingredients" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "unit"        "IngredientUnit" NOT NULL DEFAULT 'KG',
    "unit_cost"   DECIMAL(10, 4) NOT NULL DEFAULT 0,
    -- Audit Fields
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "created_by"  TEXT,
    "updated_by"  TEXT,
    -- Soft Delete
    "is_deleted"  BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"  TIMESTAMP(3),

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ingredients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ingredients_unit_cost_check" CHECK ("unit_cost" >= 0)
);

CREATE INDEX "ingredients_tenant_id_idx" ON "ingredients"("tenant_id");

-- =============================================
-- SUPPLY CHAIN — INVENTORY ITEM
-- Branch-level stock tracker. High-contention — OCC applied (§14).
-- =============================================

CREATE TABLE "inventory_items" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       TEXT NOT NULL,
    "branch_id"       TEXT NOT NULL,
    "ingredient_id"   TEXT NOT NULL,
    "theoretical_qty" DECIMAL(10, 4) NOT NULL DEFAULT 0,
    "actual_qty"      DECIMAL(10, 4) NOT NULL DEFAULT 0,
    "reorder_level"   DECIMAL(10, 4),
    "reorder_qty"     DECIMAL(10, 4),
    -- OCC (§14)
    "version"         INTEGER NOT NULL DEFAULT 1,
    -- Audit Fields
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,
    "created_by"      TEXT,
    "updated_by"      TEXT,
    -- Soft Delete
    "is_deleted"      BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"      TIMESTAMP(3),

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inventory_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_items_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_items_theoretical_qty_check" CHECK ("theoretical_qty" >= 0),
    CONSTRAINT "inventory_items_actual_qty_check" CHECK ("actual_qty" >= 0)
);

CREATE INDEX "inventory_items_tenant_id_idx" ON "inventory_items"("tenant_id");
CREATE INDEX "inventory_items_branch_id_idx" ON "inventory_items"("branch_id");
CREATE INDEX "inventory_items_ingredient_id_idx" ON "inventory_items"("ingredient_id");
CREATE UNIQUE INDEX "inventory_items_branch_id_ingredient_id_unique" ON "inventory_items"("branch_id", "ingredient_id") WHERE "is_deleted" = false;

-- =============================================
-- SUPPLY CHAIN — INVENTORY BATCH (FIFO/FEFO)
-- =============================================

CREATE TABLE "inventory_batches" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"     TEXT NOT NULL,
    "branch_id"     TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "batch_number"  TEXT NOT NULL,
    "received_qty"  DECIMAL(10, 4) NOT NULL,
    "remaining_qty" DECIMAL(10, 4) NOT NULL,
    "unit_cost"     DECIMAL(10, 4) NOT NULL,
    "expires_at"    TIMESTAMP(3),
    "received_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Audit Fields
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    "created_by"    TEXT,
    "updated_by"    TEXT,
    -- Soft Delete
    "is_deleted"    BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"    TIMESTAMP(3),

    CONSTRAINT "inventory_batches_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "inventory_batches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_batches_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_batches_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_batches_received_qty_check" CHECK ("received_qty" > 0),
    CONSTRAINT "inventory_batches_remaining_qty_check" CHECK ("remaining_qty" >= 0),
    CONSTRAINT "inventory_batches_unit_cost_check" CHECK ("unit_cost" >= 0)
);

CREATE INDEX "inventory_batches_tenant_id_idx" ON "inventory_batches"("tenant_id");
CREATE INDEX "inventory_batches_branch_id_idx" ON "inventory_batches"("branch_id");
CREATE INDEX "inventory_batches_ingredient_id_idx" ON "inventory_batches"("ingredient_id");
-- FEFO: order by expires_at for depletion queries
CREATE INDEX "inventory_batches_branch_ingredient_expires_idx" ON "inventory_batches"("branch_id", "ingredient_id", "expires_at");

-- =============================================
-- SUPPLY CHAIN — STOCK MOVEMENT (immutable §3)
-- Append-only. No soft delete columns — physical deletes prohibited (§17).
-- =============================================

CREATE TABLE "stock_movements" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       TEXT NOT NULL,
    "branch_id"       TEXT NOT NULL,
    "ingredient_id"   TEXT NOT NULL,
    "movement_type"   "StockMovementType" NOT NULL,
    "quantity_delta"  DECIMAL(10, 4) NOT NULL,
    "unit_cost"       DECIMAL(10, 4) NOT NULL,
    "reference_id"    TEXT,
    "reference_type"  TEXT,
    "notes"           TEXT,
    -- Audit Fields (createdBy only — immutable after insert)
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by"      TEXT,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "stock_movements_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_movements_unit_cost_check" CHECK ("unit_cost" >= 0)
);

CREATE INDEX "stock_movements_tenant_id_idx" ON "stock_movements"("tenant_id");
CREATE INDEX "stock_movements_branch_id_idx" ON "stock_movements"("branch_id");
CREATE INDEX "stock_movements_ingredient_id_idx" ON "stock_movements"("ingredient_id");
CREATE INDEX "stock_movements_branch_ingredient_created_at_idx" ON "stock_movements"("branch_id", "ingredient_id", "created_at");

-- =============================================
-- SUPPLY CHAIN — RECIPE (OCC §14)
-- =============================================

CREATE TABLE "recipes" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "menu_item_id" TEXT,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    -- OCC (§14)
    "version"     INTEGER NOT NULL DEFAULT 1,
    -- Audit Fields
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "created_by"  TEXT,
    "updated_by"  TEXT,
    -- Soft Delete
    "is_deleted"  BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"  TIMESTAMP(3),

    CONSTRAINT "recipes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "recipes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "recipes_tenant_id_idx" ON "recipes"("tenant_id");
CREATE INDEX "recipes_menu_item_id_idx" ON "recipes"("menu_item_id");

-- Recipe ↔ Ingredient join table with transformation factors (§25.3)
-- branchId nullable for branch-level substitutions (§25.3 documented rule)
CREATE TABLE "recipe_ingredients" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      TEXT NOT NULL,
    "recipe_id"      TEXT NOT NULL,
    "ingredient_id"  TEXT NOT NULL,
    "branch_id"      TEXT,
    "quantity"       DECIMAL(10, 4) NOT NULL,
    "unit"           "IngredientUnit" NOT NULL,
    "yield_loss_pct" DECIMAL(5, 4) NOT NULL DEFAULT 0,
    "spoilage_pct"   DECIMAL(5, 4) NOT NULL DEFAULT 0,
    -- Audit Fields
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    "created_by"     TEXT,
    "updated_by"     TEXT,
    -- Soft Delete
    "is_deleted"     BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"     TIMESTAMP(3),

    CONSTRAINT "recipe_ingredients_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "recipe_ingredients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recipe_ingredients_recipe_id_fkey" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recipe_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "recipe_ingredients_quantity_check" CHECK ("quantity" > 0),
    CONSTRAINT "recipe_ingredients_yield_loss_check" CHECK ("yield_loss_pct" >= 0 AND "yield_loss_pct" <= 1),
    CONSTRAINT "recipe_ingredients_spoilage_check" CHECK ("spoilage_pct" >= 0 AND "spoilage_pct" <= 1)
);

CREATE INDEX "recipe_ingredients_tenant_id_idx" ON "recipe_ingredients"("tenant_id");
CREATE INDEX "recipe_ingredients_recipe_id_idx" ON "recipe_ingredients"("recipe_id");
CREATE INDEX "recipe_ingredients_ingredient_id_idx" ON "recipe_ingredients"("ingredient_id");
-- Branch substitution uniqueness: one active row per recipe+ingredient+branch combination
CREATE UNIQUE INDEX "recipe_ingredients_recipe_ingredient_branch_unique" ON "recipe_ingredients"("recipe_id", "ingredient_id", COALESCE("branch_id", '')) WHERE "is_deleted" = false;

-- =============================================
-- SUPPLY CHAIN — PURCHASE ORDER (Three-Way Match §25.3)
-- =============================================

CREATE TABLE "purchase_orders" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "branch_id"   TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "status"      "PurchaseOrderStatus" NOT NULL DEFAULT 'DRAFT',
    "po_number"   TEXT NOT NULL,
    "subtotal"    DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "tax_amount"  DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "total"       DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "ordered_at"  TIMESTAMP(3),
    "expected_at" TIMESTAMP(3),
    "notes"       TEXT,
    -- Audit Fields
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "created_by"  TEXT,
    "updated_by"  TEXT,
    -- Soft Delete
    "is_deleted"  BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"  TIMESTAMP(3),

    CONSTRAINT "purchase_orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "purchase_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_subtotal_check" CHECK ("subtotal" >= 0),
    CONSTRAINT "purchase_orders_total_check" CHECK ("total" >= 0)
);

CREATE INDEX "purchase_orders_tenant_id_idx" ON "purchase_orders"("tenant_id");
CREATE INDEX "purchase_orders_branch_id_idx" ON "purchase_orders"("branch_id");
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders"("supplier_id");
CREATE INDEX "purchase_orders_tenant_id_status_idx" ON "purchase_orders"("tenant_id", "status");
CREATE UNIQUE INDEX "purchase_orders_tenant_id_po_number_unique" ON "purchase_orders"("tenant_id", "po_number") WHERE "is_deleted" = false;

-- Purchase Order constituent line items
CREATE TABLE "purchase_order_items" (
    "id"                TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "ingredient_id"     TEXT NOT NULL,
    "ordered_qty"       DECIMAL(10, 4) NOT NULL,
    "unit"              "IngredientUnit" NOT NULL,
    "unit_cost"         DECIMAL(10, 4) NOT NULL,
    "total_cost"        DECIMAL(10, 2) NOT NULL,
    -- Audit Fields
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL,
    "created_by"        TEXT,
    "updated_by"        TEXT,
    -- Soft Delete
    "is_deleted"        BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"        TIMESTAMP(3),

    CONSTRAINT "purchase_order_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_order_items_ordered_qty_check" CHECK ("ordered_qty" > 0),
    CONSTRAINT "purchase_order_items_unit_cost_check" CHECK ("unit_cost" >= 0),
    CONSTRAINT "purchase_order_items_total_cost_check" CHECK ("total_cost" >= 0)
);

CREATE INDEX "purchase_order_items_tenant_id_idx" ON "purchase_order_items"("tenant_id");
CREATE INDEX "purchase_order_items_purchase_order_id_idx" ON "purchase_order_items"("purchase_order_id");

-- =============================================
-- SUPPLY CHAIN — GOODS RECEIPT (Three-Way Match §25.3)
-- =============================================

CREATE TABLE "goods_receipts" (
    "id"                TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         TEXT NOT NULL,
    "branch_id"         TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "status"            "GoodsReceiptStatus" NOT NULL DEFAULT 'PENDING',
    "grn_number"        TEXT NOT NULL,
    "received_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes"             TEXT,
    -- Audit Fields
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL,
    "created_by"        TEXT,
    "updated_by"        TEXT,
    -- Soft Delete
    "is_deleted"        BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"        TIMESTAMP(3),

    CONSTRAINT "goods_receipts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "goods_receipts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goods_receipts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goods_receipts_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "goods_receipts_tenant_id_idx" ON "goods_receipts"("tenant_id");
CREATE INDEX "goods_receipts_branch_id_idx" ON "goods_receipts"("branch_id");
CREATE INDEX "goods_receipts_purchase_order_id_idx" ON "goods_receipts"("purchase_order_id");

-- Goods Receipt constituent line items (Three-Way Match line level)
CREATE TABLE "goods_receipt_items" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       TEXT NOT NULL,
    "goods_receipt_id" TEXT NOT NULL,
    "ingredient_id"   TEXT NOT NULL,
    "received_qty"    DECIMAL(10, 4) NOT NULL,
    "accepted_qty"    DECIMAL(10, 4) NOT NULL,
    "rejected_qty"    DECIMAL(10, 4) NOT NULL DEFAULT 0,
    "unit"            "IngredientUnit" NOT NULL,
    "unit_cost"       DECIMAL(10, 4) NOT NULL,
    "notes"           TEXT,
    -- Audit Fields
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,
    "created_by"      TEXT,
    "updated_by"      TEXT,
    -- Soft Delete
    "is_deleted"      BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"      TIMESTAMP(3),

    CONSTRAINT "goods_receipt_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "goods_receipt_items_goods_receipt_id_fkey" FOREIGN KEY ("goods_receipt_id") REFERENCES "goods_receipts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goods_receipt_items_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goods_receipt_items_received_qty_check" CHECK ("received_qty" >= 0),
    CONSTRAINT "goods_receipt_items_accepted_qty_check" CHECK ("accepted_qty" >= 0),
    CONSTRAINT "goods_receipt_items_rejected_qty_check" CHECK ("rejected_qty" >= 0)
);

CREATE INDEX "goods_receipt_items_tenant_id_idx" ON "goods_receipt_items"("tenant_id");
CREATE INDEX "goods_receipt_items_goods_receipt_id_idx" ON "goods_receipt_items"("goods_receipt_id");
CREATE INDEX "goods_receipt_items_ingredient_id_idx" ON "goods_receipt_items"("ingredient_id");

-- =============================================
-- FINANCE — LEDGER ACCOUNT (Chart of Accounts, hierarchical)
-- =============================================

CREATE TABLE "ledger_accounts" (
    "id"        TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" TEXT NOT NULL,
    "parent_id" TEXT,
    "code"      TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "type"      "LedgerAccountType" NOT NULL,
    -- Audit Fields
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    -- Soft Delete
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "ledger_accounts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ledger_accounts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ledger_accounts_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "ledger_accounts_tenant_id_idx" ON "ledger_accounts"("tenant_id");
CREATE INDEX "ledger_accounts_parent_id_idx" ON "ledger_accounts"("parent_id");
CREATE UNIQUE INDEX "ledger_accounts_tenant_id_code_unique" ON "ledger_accounts"("tenant_id", "code") WHERE "is_deleted" = false;

-- =============================================
-- FINANCE — SHIFT (operational session boundary §25.6)
-- A Branch cannot sell without an open Shift.
-- =============================================

CREATE TABLE "shifts" (
    "id"            TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"     TEXT NOT NULL,
    "branch_id"     TEXT NOT NULL,
    "user_id"       TEXT NOT NULL,
    "status"        "ShiftStatus" NOT NULL DEFAULT 'OPEN',
    "opened_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at"     TIMESTAMP(3),
    "opening_float" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "closing_float" DECIMAL(10, 2),
    -- Audit Fields
    "created_at"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"    TIMESTAMP(3) NOT NULL,
    "created_by"    TEXT,
    "updated_by"    TEXT,
    -- Soft Delete
    "is_deleted"    BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"    TIMESTAMP(3),

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "shifts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shifts_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "shifts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "shifts_tenant_id_idx" ON "shifts"("tenant_id");
CREATE INDEX "shifts_branch_id_idx" ON "shifts"("branch_id");
CREATE INDEX "shifts_branch_id_status_idx" ON "shifts"("branch_id", "status");

-- =============================================
-- FINANCE — CASH DRAWER (physical till §25.6)
-- =============================================

CREATE TABLE "cash_drawers" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       TEXT NOT NULL,
    "branch_id"       TEXT NOT NULL,
    "shift_id"        TEXT NOT NULL,
    "name"            TEXT NOT NULL,
    "opening_balance" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "closing_balance" DECIMAL(10, 2),
    "is_open"         BOOLEAN NOT NULL DEFAULT true,
    -- Audit Fields
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,
    "created_by"      TEXT,
    "updated_by"      TEXT,
    -- Soft Delete
    "is_deleted"      BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"      TIMESTAMP(3),

    CONSTRAINT "cash_drawers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "cash_drawers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cash_drawers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "cash_drawers_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "cash_drawers_tenant_id_idx" ON "cash_drawers"("tenant_id");
CREATE INDEX "cash_drawers_branch_id_idx" ON "cash_drawers"("branch_id");
CREATE INDEX "cash_drawers_shift_id_idx" ON "cash_drawers"("shift_id");

-- =============================================
-- FINANCE — DAILY CLOSING (period lockdown §25.6)
-- Status LOCKED = immutable period per §3.
-- Reopening requires elevated Controller permission (§25.6).
-- =============================================

CREATE TABLE "daily_closings" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"    TEXT NOT NULL,
    "branch_id"    TEXT NOT NULL,
    "closing_date" DATE NOT NULL,
    "status"       "DailyClosingStatus" NOT NULL DEFAULT 'PENDING',
    "expected_cash" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "actual_cash"  DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "variance"     DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "total_revenue" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "notes"        TEXT,
    "locked_at"    TIMESTAMP(3),
    "locked_by"    TEXT,
    -- Audit Fields
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,
    "created_by"   TEXT,
    "updated_by"   TEXT,
    -- Soft Delete
    "is_deleted"   BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"   TIMESTAMP(3),

    CONSTRAINT "daily_closings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "daily_closings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "daily_closings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "daily_closings_tenant_id_idx" ON "daily_closings"("tenant_id");
CREATE INDEX "daily_closings_branch_id_idx" ON "daily_closings"("branch_id");
CREATE INDEX "daily_closings_branch_id_closing_date_idx" ON "daily_closings"("branch_id", "closing_date");
CREATE UNIQUE INDEX "daily_closings_branch_id_closing_date_unique" ON "daily_closings"("branch_id", "closing_date") WHERE "is_deleted" = false;

-- =============================================
-- FINANCE — INVOICE (immutable once PAID §3)
-- =============================================

CREATE TABLE "invoices" (
    "id"         TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"  TEXT NOT NULL,
    "branch_id"  TEXT NOT NULL,
    "order_id"   TEXT NOT NULL,
    "status"     "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal"   DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "total"      DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "issued_at"  TIMESTAMP(3),
    "due_at"     TIMESTAMP(3),
    "notes"      TEXT,
    -- Audit Fields
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "updated_by" TEXT,
    -- Soft Delete
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_subtotal_check" CHECK ("subtotal" >= 0),
    CONSTRAINT "invoices_total_check" CHECK ("total" >= 0)
);

CREATE INDEX "invoices_tenant_id_idx" ON "invoices"("tenant_id");
CREATE INDEX "invoices_branch_id_idx" ON "invoices"("branch_id");
CREATE INDEX "invoices_order_id_idx" ON "invoices"("order_id");
CREATE INDEX "invoices_tenant_id_status_idx" ON "invoices"("tenant_id", "status");

-- =============================================
-- FINANCE — PAYMENT (Initiated → Authorized → Captured §25.6)
-- =============================================

CREATE TABLE "payments" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      TEXT NOT NULL,
    "invoice_id"     TEXT NOT NULL,
    "status"         "PaymentStatus" NOT NULL DEFAULT 'INITIATED',
    "method"         "PaymentMethod" NOT NULL,
    "amount"         DECIMAL(10, 2) NOT NULL,
    "reference_code" TEXT,
    -- JSONB gateway payload — must NOT contain PAN/CVV (§20 security)
    "gateway_payload" JSONB,
    -- §13 idempotency key for payment gateway retries
    "idempotency_key" TEXT NOT NULL,
    "captured_at"    TIMESTAMP(3),
    "notes"          TEXT,
    -- Audit Fields
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    "created_by"     TEXT,
    "updated_by"     TEXT,
    -- Soft Delete
    "is_deleted"     BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"     TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_idempotency_key_key" UNIQUE ("idempotency_key"),
    CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_amount_check" CHECK ("amount" > 0)
);

CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");
CREATE INDEX "payments_invoice_id_idx" ON "payments"("invoice_id");
CREATE INDEX "payments_tenant_id_status_idx" ON "payments"("tenant_id", "status");

-- =============================================
-- FINANCE — REFUND (counter-transaction §3; never mutates Payment)
-- =============================================

CREATE TABLE "refunds" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      TEXT NOT NULL,
    "invoice_id"     TEXT NOT NULL,
    "payment_id"     TEXT NOT NULL,
    "status"         "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "amount"         DECIMAL(10, 2) NOT NULL,
    "reason"         TEXT NOT NULL,
    "notes"          TEXT,
    -- Elevated permission required for closed-period refunds (§25.6)
    "approved_by"    TEXT,
    "approved_at"    TIMESTAMP(3),
    -- §13 idempotency key
    "idempotency_key" TEXT NOT NULL,
    -- Audit Fields
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    "created_by"     TEXT,
    "updated_by"     TEXT,
    -- Soft Delete
    "is_deleted"     BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"     TIMESTAMP(3),

    CONSTRAINT "refunds_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refunds_idempotency_key_key" UNIQUE ("idempotency_key"),
    CONSTRAINT "refunds_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "refunds_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "refunds_amount_check" CHECK ("amount" > 0)
);

CREATE INDEX "refunds_tenant_id_idx" ON "refunds"("tenant_id");
CREATE INDEX "refunds_invoice_id_idx" ON "refunds"("invoice_id");
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");

-- =============================================
-- FINANCE — JOURNAL (double-entry §25.6)
-- Immutable once is_posted = true. Corrections via counter-journals.
-- =============================================

CREATE TABLE "journals" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      TEXT NOT NULL,
    "shift_id"       TEXT,
    "description"    TEXT NOT NULL,
    "reference_id"   TEXT,
    "reference_type" TEXT,
    "is_posted"      BOOLEAN NOT NULL DEFAULT false,
    "posted_at"      TIMESTAMP(3),
    -- Audit Fields
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    "created_by"     TEXT,
    "updated_by"     TEXT,
    -- Soft Delete (only permitted before posting)
    "is_deleted"     BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"     TIMESTAMP(3),

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "journals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "journals_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "journals_tenant_id_idx" ON "journals"("tenant_id");
CREATE INDEX "journals_shift_id_idx" ON "journals"("shift_id");
CREATE INDEX "journals_tenant_id_is_posted_idx" ON "journals"("tenant_id", "is_posted");

-- =============================================
-- FINANCE — JOURNAL ENTRY (individual debit/credit lines; immutable once journal posted)
-- =============================================

CREATE TABLE "journal_entries" (
    "id"                TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         TEXT NOT NULL,
    "journal_id"        TEXT NOT NULL,
    "ledger_account_id" TEXT NOT NULL,
    "entry_type"        "JournalEntryType" NOT NULL,
    "amount"            DECIMAL(10, 2) NOT NULL,
    "description"       TEXT,
    -- Audit Fields (created only — immutable after journal is posted)
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by"        TEXT,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "journal_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "journal_entries_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journals"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "journal_entries_ledger_account_id_fkey" FOREIGN KEY ("ledger_account_id") REFERENCES "ledger_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "journal_entries_amount_check" CHECK ("amount" > 0)
);

CREATE INDEX "journal_entries_tenant_id_idx" ON "journal_entries"("tenant_id");
CREATE INDEX "journal_entries_journal_id_idx" ON "journal_entries"("journal_id");
CREATE INDEX "journal_entries_ledger_account_id_idx" ON "journal_entries"("ledger_account_id");
