ALTER TABLE "hmrc_connections"
  ADD COLUMN "lastSyncError" TEXT,
  ADD COLUMN "lastSyncErrorCode" TEXT,
  ADD COLUMN "lastSyncErrorAt" TIMESTAMP(3);

DROP TABLE IF EXISTS "xero_connections";