CREATE TABLE IF NOT EXISTS "hmrc_oauth_states" (
    "id" TEXT NOT NULL,
    "jti" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hmrc_oauth_states_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hmrc_oauth_states_jti_key" ON "hmrc_oauth_states"("jti");
CREATE INDEX IF NOT EXISTS "hmrc_oauth_states_firmId_idx" ON "hmrc_oauth_states"("firmId");
CREATE INDEX IF NOT EXISTS "hmrc_oauth_states_expiresAt_idx" ON "hmrc_oauth_states"("expiresAt");

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'hmrc_oauth_states_firmId_fkey'
    ) THEN
        ALTER TABLE "hmrc_oauth_states"
        ADD CONSTRAINT "hmrc_oauth_states_firmId_fkey"
        FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;