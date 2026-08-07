-- CreateEnum
CREATE TYPE "AnalyticsSnapshotType" AS ENUM ('PMIX', 'LABOR_TO_SALES');

-- CreateTable
CREATE TABLE "analytics_snapshots" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "type" "AnalyticsSnapshotType" NOT NULL,
    "data" JSONB NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "captured_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "analytics_snapshots_tenant_id_idx" ON "analytics_snapshots"("tenant_id");

-- CreateIndex
CREATE INDEX "analytics_snapshots_tenant_id_type_period_start_idx" ON "analytics_snapshots"("tenant_id", "type", "period_start");

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_snapshots" ADD CONSTRAINT "analytics_snapshots_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
