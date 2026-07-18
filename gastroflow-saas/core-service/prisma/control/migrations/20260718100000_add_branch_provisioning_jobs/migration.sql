CREATE TYPE "ProvisioningJobStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TABLE "branch_provisioning_jobs" (
  "id" UUID NOT NULL, "restaurantId" UUID NOT NULL, "branchId" UUID NOT NULL,
  "templateBranchId" UUID, "requestedByUserId" UUID NOT NULL,
  "idempotencyKey" TEXT NOT NULL, "requestHash" TEXT NOT NULL,
  "status" "ProvisioningJobStatus" NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0, "maxAttempts" INTEGER NOT NULL DEFAULT 3,
  "startedAt" TIMESTAMP(3), "completedAt" TIMESTAMP(3), "nextRetryAt" TIMESTAMP(3),
  "lastErrorCode" TEXT, "lastErrorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "branch_provisioning_jobs_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "branch_provisioning_jobs_branchId_key" ON "branch_provisioning_jobs"("branchId");
CREATE UNIQUE INDEX "branch_provisioning_jobs_restaurantId_idempotencyKey_key" ON "branch_provisioning_jobs"("restaurantId", "idempotencyKey");
CREATE INDEX "branch_provisioning_jobs_status_nextRetryAt_idx" ON "branch_provisioning_jobs"("status", "nextRetryAt");
ALTER TABLE "branch_provisioning_jobs" ADD CONSTRAINT "branch_provisioning_jobs_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "branch_provisioning_jobs" ADD CONSTRAINT "branch_provisioning_jobs_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "branch_provisioning_jobs" ADD CONSTRAINT "branch_provisioning_jobs_templateBranchId_fkey" FOREIGN KEY ("templateBranchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "branch_provisioning_jobs" ADD CONSTRAINT "branch_provisioning_jobs_requestedByUserId_fkey" FOREIGN KEY ("requestedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
