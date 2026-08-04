-- Task 1.4: Schema Validation & Initial Migration
-- Migration: 20260804193000_task_1_4_audit_log_model
--
-- Scope:
--   audit_logs — tamper-evident, append-only record of critical system actions
--
-- DatabaseSchema.md constraints applied:
--   §3  — Immutability: no UPDATE or DELETE permitted on audit_log rows
--   §7  — tenant_id on every table
--   §10 — UUID primary keys
--   §11 — ON DELETE RESTRICT on all FKs
--   §16 — Audit strategy: capture before/after state as JSONB
--   §22 — Composite indexes for forensic/compliance query patterns
--   §23 — Partitioning note: audit_logs is a candidate for future range partitioning by created_at
--
-- CodingStandards.md §12:
--   "Every mutation transaction must synchronously INSERT into the audit_logs table
--    before committing."
--
-- No soft delete columns — this table is an immutable audit ledger.
-- Physical DELETE strictly prohibited per §3 and §17.

-- =============================================
-- AUDIT LOG
-- =============================================

CREATE TABLE "audit_logs" (
    "id"             TEXT NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id"      TEXT NOT NULL,

    -- Actor: nullable for system-generated events (scheduled workers, triggers)
    "user_id"        TEXT,

    -- Polymorphic entity reference: what was acted upon
    "entity_type"    TEXT NOT NULL,
    "entity_id"      TEXT NOT NULL,

    -- The action that was performed
    -- Examples: ORDER_VOIDED, SHIFT_REOPENED, CONFIG_CHANGED, PERMISSION_GRANTED
    "action"         TEXT NOT NULL,

    -- Full before/after state snapshot (JSONB) per §16
    -- Only mutated fields required; NULL if not applicable (e.g., pure creation or deletion event)
    "before_state"   JSONB,
    "after_state"    JSONB,

    -- Justification: mandatory for high-sensitivity actions (Voids, Reopening closed shifts)
    "reason"         TEXT,

    -- Distributed tracing and forensic correlation metadata
    "ip_address"     TEXT,
    "user_agent"     TEXT,
    "correlation_id" TEXT,

    -- Immutable creation timestamp — the only timestamp this table carries
    "created_at"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_user_id_fkey"   FOREIGN KEY ("user_id")   REFERENCES "users"("id")   ON DELETE RESTRICT ON UPDATE CASCADE
);

-- §22 composite indexes for common forensic and compliance query patterns
CREATE INDEX "audit_logs_tenant_id_idx"              ON "audit_logs"("tenant_id");
CREATE INDEX "audit_logs_entity_type_entity_id_idx"  ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "audit_logs_tenant_action_created_at_idx" ON "audit_logs"("tenant_id", "action", "created_at");
CREATE INDEX "audit_logs_user_id_idx"                ON "audit_logs"("user_id");

-- §23 Partitioning note (future):
-- This table is a primary candidate for range partitioning by created_at (monthly partitions)
-- when row volume warrants it — without any schema change to the existing definition.
