-- Additive migration: preserve only relationships authorized by the previous
-- implementation: a user's primary firm, plus ADMIN users with a qualifying
-- FIRM_CREATED/FIRM_REGISTERED audit record for that specific firm.
CREATE TABLE "firm_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "firmId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "firm_memberships_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "firm_memberships_userId_firmId_key" ON "firm_memberships"("userId", "firmId");
CREATE INDEX "firm_memberships_firmId_idx" ON "firm_memberships"("firmId");

INSERT INTO "firm_memberships" ("id", "userId", "firmId", "role", "createdAt", "updatedAt")
SELECT md5("id" || "firmId"), "id", "firmId", "role", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "users"
WHERE "firmId" IS NOT NULL
UNION ALL
SELECT md5(a."userId" || a."firmId"), a."userId", a."firmId", 'ADMIN'::"Role", CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "audit_logs" a
INNER JOIN "users" u ON u."id" = a."userId"
INNER JOIN "firms" f ON f."id" = a."firmId"
WHERE u."role" = 'ADMIN'::"Role"
  AND a."userId" IS NOT NULL
  AND a."action" IN ('FIRM_CREATED', 'FIRM_REGISTERED')
ON CONFLICT ("userId", "firmId") DO NOTHING;

ALTER TABLE "users" ALTER COLUMN "firmId" DROP NOT NULL;
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_firmId_fkey";
ALTER TABLE "users" ADD CONSTRAINT "users_firmId_fkey"
  FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "firm_memberships" ADD CONSTRAINT "firm_memberships_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "firm_memberships" ADD CONSTRAINT "firm_memberships_firmId_fkey"
  FOREIGN KEY ("firmId") REFERENCES "firms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
