-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "branch_id" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_tenant_id_branch_id_idx" ON "AuditLog"("tenant_id", "branch_id");

-- CreateIndex
CREATE INDEX "AuditLog_tenant_id_branch_id_action_created_at_idx" ON "AuditLog"("tenant_id", "branch_id", "action", "created_at");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
