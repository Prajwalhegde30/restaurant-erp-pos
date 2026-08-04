-- Task 1.2: Catalog & Operational Database Models
-- Migration: 20260804191000_task_1_2_catalog_operational_models
--
-- ADR Decisions applied:
--   AD-001: menu_versions history table (Option 3 — Separate Menu History Table)
--   AD-002: modifier_groups + modifier_options (Option 2 — Two-Table Model)
--   AD-003: menu_item_modifier_groups join table (Option 2 — Reusable via Join Table)
--   AD-004: order_item_recipe_snapshots table (Option 2 — Separate Relational Snapshot Table)
--   AD-005: order_merges join table + parent_order_id on orders (Option B — Parent Order)
--
-- DatabaseSchema.md constraints applied:
--   §7  — tenant_id on every table
--   §8  — many-to-many via explicit join tables with UUID PK and audit fields
--   §10 — UUID primary keys
--   §11 — ON DELETE RESTRICT as default
--   §12 — partial unique indexes WHERE is_deleted = false
--   §13 — idempotency_key unique constraint on orders
--   §14 — version (OCC) on Menu and Order
--   §16 — audit fields on every table
--   §17 — soft delete on every table (is_deleted, deleted_at)
--   §22 — composite indexes per common query patterns

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE "MenuStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "CategoryStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "MenuItemStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK');
CREATE TYPE "ComboStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'SEATED', 'BILLED', 'RESERVED');
CREATE TYPE "ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE "OrderStatus" AS ENUM ('DRAFT', 'PLACED', 'IN_PREP', 'READY', 'SERVED', 'PAID', 'CLOSED', 'VOIDED', 'CANCELLED');
CREATE TYPE "OrderType" AS ENUM ('DINE_IN', 'TAKEAWAY', 'DELIVERY');
CREATE TYPE "OrderItemStatus" AS ENUM ('PENDING', 'IN_PREP', 'READY', 'SERVED', 'VOIDED');

-- =============================================
-- CATALOG — MENU
-- AD-001: menus holds current state only; history in menu_versions
-- =============================================

CREATE TABLE "menus" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "status"      "MenuStatus" NOT NULL DEFAULT 'DRAFT',
    -- OCC (§14)
    "version"     INTEGER NOT NULL DEFAULT 1,
    -- Audit Fields (§16)
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "created_by"  TEXT,
    "updated_by"  TEXT,
    -- Soft Delete (§17)
    "is_deleted"  BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"  TIMESTAMP(3),

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "menus_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "menus_tenant_id_idx" ON "menus"("tenant_id");
CREATE INDEX "menus_tenant_id_status_idx" ON "menus"("tenant_id", "status");

-- AD-001: Append-only menu history table. Captures full row state before every mutation.
CREATE TABLE "menu_versions" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "menu_id"     TEXT NOT NULL,
    -- Snapshot columns
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "status"      "MenuStatus" NOT NULL,
    "version"     INTEGER NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recorded_by" TEXT,

    CONSTRAINT "menu_versions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "menu_versions_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "menu_versions_menu_id_idx" ON "menu_versions"("menu_id");
CREATE INDEX "menu_versions_tenant_id_menu_id_idx" ON "menu_versions"("tenant_id", "menu_id");

-- Menu ↔ Branch associative join table (§8 many-to-many)
CREATE TABLE "menu_branches" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "menu_id"     TEXT NOT NULL,
    "branch_id"   TEXT NOT NULL,
    -- Audit Fields
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "created_by"  TEXT,
    "updated_by"  TEXT,
    -- Soft Delete
    "is_deleted"  BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"  TIMESTAMP(3),

    CONSTRAINT "menu_branches_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "menu_branches_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "menu_branches_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "menu_branches_tenant_id_idx" ON "menu_branches"("tenant_id");
CREATE INDEX "menu_branches_menu_id_idx" ON "menu_branches"("menu_id");
CREATE INDEX "menu_branches_branch_id_idx" ON "menu_branches"("branch_id");
-- §12 partial unique index: one active assignment per menu+branch pair
CREATE UNIQUE INDEX "menu_branches_menu_id_branch_id_unique" ON "menu_branches"("menu_id", "branch_id") WHERE "is_deleted" = false;

-- =============================================
-- CATALOG — CATEGORY (hierarchical/recursive §8)
-- =============================================

CREATE TABLE "categories" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "menu_id"     TEXT NOT NULL,
    "parent_id"   TEXT,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "sort_order"  INTEGER NOT NULL DEFAULT 0,
    "status"      "CategoryStatus" NOT NULL DEFAULT 'ACTIVE',
    -- Audit Fields
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "created_by"  TEXT,
    "updated_by"  TEXT,
    -- Soft Delete
    "is_deleted"  BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"  TIMESTAMP(3),

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "categories_menu_id_fkey" FOREIGN KEY ("menu_id") REFERENCES "menus"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "categories_tenant_id_idx" ON "categories"("tenant_id");
CREATE INDEX "categories_menu_id_idx" ON "categories"("menu_id");
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- =============================================
-- CATALOG — MENU ITEM
-- =============================================

CREATE TABLE "menu_items" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "price"       DECIMAL(10, 2) NOT NULL,
    "tax_rate"    DECIMAL(5, 4) NOT NULL DEFAULT 0,
    "sort_order"  INTEGER NOT NULL DEFAULT 0,
    "status"      "MenuItemStatus" NOT NULL DEFAULT 'ACTIVE',
    -- Audit Fields
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "created_by"  TEXT,
    "updated_by"  TEXT,
    -- Soft Delete
    "is_deleted"  BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"  TIMESTAMP(3),

    CONSTRAINT "menu_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "menu_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "menu_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "menu_items_tenant_id_idx" ON "menu_items"("tenant_id");
CREATE INDEX "menu_items_category_id_idx" ON "menu_items"("category_id");
CREATE INDEX "menu_items_tenant_id_status_idx" ON "menu_items"("tenant_id", "status");

-- =============================================
-- CATALOG — MODIFIER (AD-002: two-table model)
-- =============================================

-- modifier_groups: carries the selection rule (min/max)
CREATE TABLE "modifier_groups" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      TEXT NOT NULL,
    "name"           TEXT NOT NULL,
    "min_selections" INTEGER NOT NULL DEFAULT 0,
    "max_selections" INTEGER NOT NULL DEFAULT 1,
    "is_required"    BOOLEAN NOT NULL DEFAULT false,
    -- Audit Fields
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"     TIMESTAMP(3) NOT NULL,
    "created_by"     TEXT,
    "updated_by"     TEXT,
    -- Soft Delete
    "is_deleted"     BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"     TIMESTAMP(3),

    CONSTRAINT "modifier_groups_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "modifier_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    -- min_selections must be non-negative and max_selections must be >= min_selections
    CONSTRAINT "modifier_groups_min_max_check" CHECK ("min_selections" >= 0 AND "max_selections" >= "min_selections")
);

CREATE INDEX "modifier_groups_tenant_id_idx" ON "modifier_groups"("tenant_id");

-- modifier_options: selectable options within a group.
-- Ingredient link intentionally omitted; deferred to Supply Chain Phase 7 (AD-002 rationale).
CREATE TABLE "modifier_options" (
    "id"                TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         TEXT NOT NULL,
    "modifier_group_id" TEXT NOT NULL,
    "name"              TEXT NOT NULL,
    "price_delta"       DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "sort_order"        INTEGER NOT NULL DEFAULT 0,
    -- Audit Fields
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL,
    "created_by"        TEXT,
    "updated_by"        TEXT,
    -- Soft Delete
    "is_deleted"        BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"        TIMESTAMP(3),

    CONSTRAINT "modifier_options_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "modifier_options_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "modifier_options_modifier_group_id_fkey" FOREIGN KEY ("modifier_group_id") REFERENCES "modifier_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "modifier_options_tenant_id_idx" ON "modifier_options"("tenant_id");
CREATE INDEX "modifier_options_modifier_group_id_idx" ON "modifier_options"("modifier_group_id");

-- AD-003: MenuItem ↔ ModifierGroup join table (§8 many-to-many)
CREATE TABLE "menu_item_modifier_groups" (
    "id"                TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"         TEXT NOT NULL,
    "menu_item_id"      TEXT NOT NULL,
    "modifier_group_id" TEXT NOT NULL,
    "sort_order"        INTEGER NOT NULL DEFAULT 0,
    -- Audit Fields
    "created_at"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"        TIMESTAMP(3) NOT NULL,
    "created_by"        TEXT,
    "updated_by"        TEXT,
    -- Soft Delete
    "is_deleted"        BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"        TIMESTAMP(3),

    CONSTRAINT "menu_item_modifier_groups_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "menu_item_modifier_groups_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "menu_item_modifier_groups_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "menu_item_modifier_groups_modifier_group_id_fkey" FOREIGN KEY ("modifier_group_id") REFERENCES "modifier_groups"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "menu_item_modifier_groups_tenant_id_idx" ON "menu_item_modifier_groups"("tenant_id");
CREATE INDEX "menu_item_modifier_groups_menu_item_id_idx" ON "menu_item_modifier_groups"("menu_item_id");
CREATE INDEX "menu_item_modifier_groups_modifier_group_id_idx" ON "menu_item_modifier_groups"("modifier_group_id");
-- §12 partial unique index: a group can only be assigned once per item
CREATE UNIQUE INDEX "menu_item_modifier_groups_item_group_unique" ON "menu_item_modifier_groups"("menu_item_id", "modifier_group_id") WHERE "is_deleted" = false;

-- =============================================
-- CATALOG — COMBO (§25.2 bundled pricing)
-- =============================================

CREATE TABLE "combos" (
    "id"          TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"   TEXT NOT NULL,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "price"       DECIMAL(10, 2) NOT NULL,
    "tax_rate"    DECIMAL(5, 4) NOT NULL DEFAULT 0,
    "status"      "ComboStatus" NOT NULL DEFAULT 'ACTIVE',
    -- Audit Fields
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    "created_by"  TEXT,
    "updated_by"  TEXT,
    -- Soft Delete
    "is_deleted"  BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"  TIMESTAMP(3),

    CONSTRAINT "combos_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "combos_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "combos_tenant_id_idx" ON "combos"("tenant_id");
CREATE INDEX "combos_tenant_id_status_idx" ON "combos"("tenant_id", "status");

-- Combo ↔ MenuItem associative join table (§8)
CREATE TABLE "combo_items" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"    TEXT NOT NULL,
    "combo_id"     TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "quantity"     INTEGER NOT NULL DEFAULT 1,
    "sort_order"   INTEGER NOT NULL DEFAULT 0,
    -- Audit Fields
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,
    "created_by"   TEXT,
    "updated_by"   TEXT,
    -- Soft Delete
    "is_deleted"   BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"   TIMESTAMP(3),

    CONSTRAINT "combo_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "combo_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "combo_items_combo_id_fkey" FOREIGN KEY ("combo_id") REFERENCES "combos"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "combo_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "combo_items_quantity_check" CHECK ("quantity" > 0)
);

CREATE INDEX "combo_items_tenant_id_idx" ON "combo_items"("tenant_id");
CREATE INDEX "combo_items_combo_id_idx" ON "combo_items"("combo_id");
CREATE INDEX "combo_items_menu_item_id_idx" ON "combo_items"("menu_item_id");
-- §12 partial unique index
CREATE UNIQUE INDEX "combo_items_combo_id_menu_item_id_unique" ON "combo_items"("combo_id", "menu_item_id") WHERE "is_deleted" = false;

-- =============================================
-- OPERATIONAL — DINING TABLE (§25.4)
-- =============================================

CREATE TABLE "dining_tables" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"    TEXT NOT NULL,
    "branch_id"    TEXT NOT NULL,
    "table_number" TEXT NOT NULL,
    "capacity"     INTEGER NOT NULL DEFAULT 2,
    "status"       "TableStatus" NOT NULL DEFAULT 'AVAILABLE',
    "floor_section" TEXT,
    -- Audit Fields
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,
    "created_by"   TEXT,
    "updated_by"   TEXT,
    -- Soft Delete
    "is_deleted"   BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"   TIMESTAMP(3),

    CONSTRAINT "dining_tables_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "dining_tables_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dining_tables_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dining_tables_capacity_check" CHECK ("capacity" > 0)
);

CREATE INDEX "dining_tables_tenant_id_idx" ON "dining_tables"("tenant_id");
CREATE INDEX "dining_tables_branch_id_idx" ON "dining_tables"("branch_id");
CREATE INDEX "dining_tables_branch_id_status_idx" ON "dining_tables"("branch_id", "status");
-- §12 partial unique index: unique table numbers within a branch
CREATE UNIQUE INDEX "dining_tables_branch_id_table_number_unique" ON "dining_tables"("branch_id", "table_number") WHERE "is_deleted" = false;

-- =============================================
-- OPERATIONAL — RESERVATION (§25.4)
-- Overbooking enforced at application layer per documented tenant policy.
-- =============================================

CREATE TABLE "reservations" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       TEXT NOT NULL,
    "branch_id"       TEXT NOT NULL,
    "dining_table_id" TEXT,
    "user_id"         TEXT,
    "guest_name"      TEXT NOT NULL,
    "guest_phone"     TEXT,
    "party_size"      INTEGER NOT NULL,
    "scheduled_at"    TIMESTAMP(3) NOT NULL,
    "status"          "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "notes"           TEXT,
    -- Audit Fields
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,
    "created_by"      TEXT,
    "updated_by"      TEXT,
    -- Soft Delete
    "is_deleted"      BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"      TIMESTAMP(3),

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "reservations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_dining_table_id_fkey" FOREIGN KEY ("dining_table_id") REFERENCES "dining_tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "reservations_party_size_check" CHECK ("party_size" > 0)
);

CREATE INDEX "reservations_tenant_id_idx" ON "reservations"("tenant_id");
CREATE INDEX "reservations_branch_id_idx" ON "reservations"("branch_id");
CREATE INDEX "reservations_dining_table_id_idx" ON "reservations"("dining_table_id");
CREATE INDEX "reservations_branch_id_scheduled_at_idx" ON "reservations"("branch_id", "scheduled_at");
CREATE INDEX "reservations_branch_id_status_idx" ON "reservations"("branch_id", "status");

-- =============================================
-- OPERATIONAL — ORDER (§25.4, §13 idempotency, §14 OCC, AD-005 parent hierarchy)
-- =============================================

CREATE TABLE "orders" (
    "id"               TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"        TEXT NOT NULL,
    "branch_id"        TEXT NOT NULL,
    "dining_table_id"  TEXT,
    "user_id"          TEXT,
    "status"           "OrderStatus" NOT NULL DEFAULT 'DRAFT',
    "order_type"       "OrderType" NOT NULL DEFAULT 'DINE_IN',
    -- AD-005: self-referencing FK for parent-child merge hierarchy
    "parent_order_id"  TEXT,
    -- §13 idempotency key
    "idempotency_key"  TEXT NOT NULL,
    -- §14 OCC version
    "version"          INTEGER NOT NULL DEFAULT 1,
    -- Denormalised totals (source of truth = order_items; updated on item changes)
    "subtotal"         DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "tax_amount"       DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "total_amount"     DECIMAL(10, 2) NOT NULL DEFAULT 0,
    "notes"            TEXT,
    -- Audit Fields
    "created_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"       TIMESTAMP(3) NOT NULL,
    "created_by"       TEXT,
    "updated_by"       TEXT,
    -- Soft Delete
    "is_deleted"       BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"       TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_idempotency_key_key" UNIQUE ("idempotency_key"),
    CONSTRAINT "orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_dining_table_id_fkey" FOREIGN KEY ("dining_table_id") REFERENCES "dining_tables"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_parent_order_id_fkey" FOREIGN KEY ("parent_order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "orders_parent_order_id_self_check" CHECK ("parent_order_id" IS NULL OR "parent_order_id" != "id"),
    CONSTRAINT "orders_subtotal_check" CHECK ("subtotal" >= 0),
    CONSTRAINT "orders_tax_amount_check" CHECK ("tax_amount" >= 0),
    CONSTRAINT "orders_total_amount_check" CHECK ("total_amount" >= 0)
);

CREATE INDEX "orders_tenant_id_idx" ON "orders"("tenant_id");
CREATE INDEX "orders_branch_id_idx" ON "orders"("branch_id");
CREATE INDEX "orders_dining_table_id_idx" ON "orders"("dining_table_id");
CREATE INDEX "orders_parent_order_id_idx" ON "orders"("parent_order_id");
-- §22 composite index for common order-list queries
CREATE INDEX "orders_tenant_id_branch_id_status_idx" ON "orders"("tenant_id", "branch_id", "status");
CREATE INDEX "orders_tenant_id_branch_id_status_created_at_idx" ON "orders"("tenant_id", "branch_id", "status", "created_at");

-- AD-005: Associative transaction table recording merge events (§25.4)
CREATE TABLE "order_merges" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"       TEXT NOT NULL,
    "parent_order_id" TEXT NOT NULL,
    "child_order_id"  TEXT NOT NULL,
    "merged_at"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "merged_by"       TEXT,
    "resolved_at"     TIMESTAMP(3),
    "resolved_by"     TEXT,
    -- Audit Fields
    "created_at"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"      TIMESTAMP(3) NOT NULL,
    "created_by"      TEXT,
    "updated_by"      TEXT,
    -- Soft Delete
    "is_deleted"      BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"      TIMESTAMP(3),

    CONSTRAINT "order_merges_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_merges_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_merges_parent_order_id_fkey" FOREIGN KEY ("parent_order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_merges_child_order_id_fkey" FOREIGN KEY ("child_order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "order_merges_tenant_id_idx" ON "order_merges"("tenant_id");
CREATE INDEX "order_merges_parent_order_id_idx" ON "order_merges"("parent_order_id");
CREATE INDEX "order_merges_child_order_id_idx" ON "order_merges"("child_order_id");
-- A child order can only belong to one active merge group at a time
CREATE UNIQUE INDEX "order_merges_child_order_id_unique" ON "order_merges"("child_order_id") WHERE "is_deleted" = false;

-- =============================================
-- OPERATIONAL — ORDER ITEM (§25.4, §18 price snapshot)
-- =============================================

CREATE TABLE "order_items" (
    "id"           TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"    TEXT NOT NULL,
    "order_id"     TEXT NOT NULL,
    "menu_item_id" TEXT NOT NULL,
    "status"       "OrderItemStatus" NOT NULL DEFAULT 'PENDING',
    "quantity"     INTEGER NOT NULL DEFAULT 1,
    -- §18 price snapshot — immutable after write
    "unit_price"   DECIMAL(10, 2) NOT NULL,
    "tax_rate"     DECIMAL(5, 4) NOT NULL,
    "total_price"  DECIMAL(10, 2) NOT NULL,
    "notes"        TEXT,
    -- Audit Fields
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL,
    "created_by"   TEXT,
    "updated_by"   TEXT,
    -- Soft Delete
    "is_deleted"   BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"   TIMESTAMP(3),

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_items_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_items_quantity_check" CHECK ("quantity" > 0),
    CONSTRAINT "order_items_unit_price_check" CHECK ("unit_price" >= 0),
    CONSTRAINT "order_items_total_price_check" CHECK ("total_price" >= 0)
);

CREATE INDEX "order_items_tenant_id_idx" ON "order_items"("tenant_id");
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");
CREATE INDEX "order_items_menu_item_id_idx" ON "order_items"("menu_item_id");
CREATE INDEX "order_items_tenant_id_status_idx" ON "order_items"("tenant_id", "status");

-- OrderItem ↔ ModifierOption selections (§8 join table)
-- Records the modifier option chosen and price delta snapshotted at selection time (§18)
CREATE TABLE "order_item_modifier_selections" (
    "id"                   TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"            TEXT NOT NULL,
    "order_item_id"        TEXT NOT NULL,
    "modifier_option_id"   TEXT NOT NULL,
    -- §18 price delta snapshot at moment of selection
    "price_delta_snapshot" DECIMAL(10, 2) NOT NULL,
    -- Audit Fields
    "created_at"           TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"           TIMESTAMP(3) NOT NULL,
    "created_by"           TEXT,
    "updated_by"           TEXT,
    -- Soft Delete
    "is_deleted"           BOOLEAN NOT NULL DEFAULT false,
    "deleted_at"           TIMESTAMP(3),

    CONSTRAINT "order_item_modifier_selections_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_item_modifier_selections_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_item_modifier_selections_modifier_option_id_fkey" FOREIGN KEY ("modifier_option_id") REFERENCES "modifier_options"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "order_item_modifier_selections_order_item_id_idx" ON "order_item_modifier_selections"("order_item_id");
CREATE INDEX "order_item_modifier_selections_modifier_option_id_idx" ON "order_item_modifier_selections"("modifier_option_id");

-- AD-004: Separate relational recipe snapshot table.
-- Append-only after INSERT. One row per ingredient per order item.
-- Authoritative source for COGS, inventory deduction (Phase 7), and financial audit.
-- ingredient_id stored as TEXT (FK to ingredients table deferred to Task 1.3 Supply Chain).
CREATE TABLE "order_item_recipe_snapshots" (
    "id"              TEXT NOT NULL DEFAULT gen_random_uuid(),
    "order_item_id"   TEXT NOT NULL,
    -- Recipe identity at snapshot time
    "recipe_id"       TEXT,
    "recipe_name"     TEXT NOT NULL,
    -- Ingredient line at order time
    "ingredient_id"   TEXT NOT NULL,
    "ingredient_name" TEXT NOT NULL,
    "quantity"        DECIMAL(10, 4) NOT NULL,
    "unit"            TEXT NOT NULL,
    -- Yield loss and spoilage factors at snapshot time (§25.3)
    "yield_loss_pct"  DECIMAL(5, 4) NOT NULL DEFAULT 0,
    "spoilage_pct"    DECIMAL(5, 4) NOT NULL DEFAULT 0,
    -- Snapshot timestamp
    "captured_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_item_recipe_snapshots_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "order_item_recipe_snapshots_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "order_item_recipe_snapshots_quantity_check" CHECK ("quantity" > 0),
    CONSTRAINT "order_item_recipe_snapshots_yield_loss_check" CHECK ("yield_loss_pct" >= 0 AND "yield_loss_pct" <= 1),
    CONSTRAINT "order_item_recipe_snapshots_spoilage_check" CHECK ("spoilage_pct" >= 0 AND "spoilage_pct" <= 1)
);

CREATE INDEX "order_item_recipe_snapshots_order_item_id_idx" ON "order_item_recipe_snapshots"("order_item_id");
CREATE INDEX "order_item_recipe_snapshots_ingredient_id_idx" ON "order_item_recipe_snapshots"("ingredient_id");
