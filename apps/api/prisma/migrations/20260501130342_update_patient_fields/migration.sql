/*
  Warnings:

  - You are about to drop the column `allergies` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `blood_group` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_contact_name` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `emergency_contact_phone` on the `patients` table. All the data in the column will be lost.
  - You are about to drop the column `national_id` on the `patients` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "patient_no" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "id_type" TEXT,
    "id_number" TEXT,
    "phone" TEXT,
    "phone_2" TEXT,
    "email" TEXT,
    "address" TEXT,
    "occupation" TEXT,
    "town" TEXT,
    "nationality" TEXT DEFAULT 'Kenyan',
    "next_of_kin" TEXT,
    "relationship" TEXT,
    "nok_phone" TEXT,
    "postal_address" TEXT,
    "postal_code" TEXT,
    "insurance_provider" TEXT,
    "insurance_no" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "patients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_patients" ("address", "created_at", "date_of_birth", "email", "first_name", "gender", "id", "insurance_no", "insurance_provider", "is_active", "last_name", "patient_no", "phone", "tenant_id", "updated_at") SELECT "address", "created_at", "date_of_birth", "email", "first_name", "gender", "id", "insurance_no", "insurance_provider", "is_active", "last_name", "patient_no", "phone", "tenant_id", "updated_at" FROM "patients";
DROP TABLE "patients";
ALTER TABLE "new_patients" RENAME TO "patients";
CREATE UNIQUE INDEX "patients_tenant_id_patient_no_key" ON "patients"("tenant_id", "patient_no");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
