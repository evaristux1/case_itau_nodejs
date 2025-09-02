/*
  Warnings:

  - You are about to alter the column `customer_id` on the `audit_logs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `customers` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `balance` on the `customers` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `customers` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to drop the column `amount` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `balance_after` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `balance_before` on the `transactions` table. All the data in the column will be lost.
  - You are about to alter the column `customer_id` on the `transactions` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" INTEGER NOT NULL,
    "deltaCents" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "idempotency_key" TEXT,
    "balance_before_cents" INTEGER,
    "balance_after_cents" INTEGER,
    "description" TEXT,
    "metadata" TEXT,
    "transaction_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ledger_entries_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ledger_entries_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" INTEGER,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "user_id" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_audit_logs" ("action", "created_at", "customer_id", "entity", "entity_id", "id", "ip_address", "new_value", "old_value", "user_agent", "user_id") SELECT "action", "created_at", "customer_id", "entity", "entity_id", "id", "ip_address", "new_value", "old_value", "user_agent", "user_id" FROM "audit_logs";
DROP TABLE "audit_logs";
ALTER TABLE "new_audit_logs" RENAME TO "audit_logs";
CREATE INDEX "audit_logs_customer_id_idx" ON "audit_logs"("customer_id");
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");
CREATE TABLE "new_customers" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "password_hash" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    "deleted_at" DATETIME
);
INSERT INTO "new_customers" ("cpf", "created_at", "deleted_at", "email", "id", "name", "password_hash", "status", "updated_at", "version") SELECT "cpf", "created_at", "deleted_at", "email", "id", "name", "password_hash", "status", "updated_at", "version" FROM "customers";
DROP TABLE "customers";
ALTER TABLE "new_customers" RENAME TO "customers";
CREATE UNIQUE INDEX "customers_email_key" ON "customers"("email");
CREATE UNIQUE INDEX "customers_cpf_key" ON "customers"("cpf");
CREATE INDEX "customers_email_idx" ON "customers"("email");
CREATE INDEX "customers_cpf_idx" ON "customers"("cpf");
CREATE UNIQUE INDEX "customers_id_version_key" ON "customers"("id", "version");
CREATE TABLE "new_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customer_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL DEFAULT 0,
    "balance_before_cents" INTEGER NOT NULL DEFAULT 0,
    "balance_after_cents" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "metadata" TEXT,
    "idempotency_key" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "transactions_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_transactions" ("created_at", "customer_id", "description", "id", "idempotency_key", "metadata", "type") SELECT "created_at", "customer_id", "description", "id", "idempotency_key", "metadata", "type" FROM "transactions";
DROP TABLE "transactions";
ALTER TABLE "new_transactions" RENAME TO "transactions";
CREATE UNIQUE INDEX "transactions_idempotency_key_key" ON "transactions"("idempotency_key");
CREATE INDEX "transactions_customer_id_idx" ON "transactions"("customer_id");
CREATE INDEX "transactions_type_idx" ON "transactions"("type");
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "ledger_entries_idempotency_key_key" ON "ledger_entries"("idempotency_key");

-- CreateIndex
CREATE INDEX "ledger_entries_customer_id_idx" ON "ledger_entries"("customer_id");

-- CreateIndex
CREATE INDEX "ledger_entries_transaction_id_idx" ON "ledger_entries"("transaction_id");
