/*
  Warnings:

  - You are about to drop the column `cpf` on the `customers` table. All the data in the column will be lost.
  - Added the required column `document` to the `customers` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "password_hash" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME
);
INSERT INTO "new_customers" ("balanceCents", "created_at", "deleted_at", "email", "id", "name", "password_hash", "status", "updated_at", "version") SELECT "balanceCents", "created_at", "deleted_at", "email", "id", "name", "password_hash", "status", "updated_at", "version" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
CREATE UNIQUE INDEX "customers_document_key" ON "customers"("document");
CREATE INDEX "customers_email_idx" ON "customers"("email");
CREATE INDEX "customers_document_idx" ON "customers"("document");
CREATE UNIQUE INDEX "customers_id_version_key" ON "customers"("id", "version");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
