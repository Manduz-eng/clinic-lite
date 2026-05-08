-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logo_url" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "license_no" TEXT,
    "mpesa_shortcode" TEXT,
    "mpesa_passkey" TEXT,
    "mpesa_consumer_key" TEXT,
    "mpesa_consumer_secret" TEXT,
    "settings" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "roles_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    PRIMARY KEY ("role_id", "permission_id"),
    CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT,
    "employee_no" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" DATETIME,
    "refresh_token" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "patients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "patient_no" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "national_id" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "emergency_contact_name" TEXT,
    "emergency_contact_phone" TEXT,
    "blood_group" TEXT,
    "allergies" TEXT,
    "insurance_provider" TEXT,
    "insurance_no" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "patients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "visit_no" TEXT NOT NULL,
    "visit_date" DATETIME NOT NULL,
    "visit_type" TEXT NOT NULL DEFAULT 'new_visit',
    "status" TEXT NOT NULL DEFAULT 'queued',
    "queue_number" INTEGER NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "chief_complaint" TEXT,
    "registered_by" TEXT NOT NULL,
    "assigned_doctor" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "visits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "visits_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "visits_registered_by_fkey" FOREIGN KEY ("registered_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "visits_assigned_doctor_fkey" FOREIGN KEY ("assigned_doctor") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "vitals" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "systolic_bp" INTEGER,
    "diastolic_bp" INTEGER,
    "heart_rate" INTEGER,
    "temperature" REAL,
    "weight" REAL,
    "height" REAL,
    "bmi" REAL,
    "respiratory_rate" INTEGER,
    "oxygen_saturation" REAL,
    "notes" TEXT,
    "recorded_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "vitals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vitals_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "vitals_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "nursing_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "note_type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "treatment_room" TEXT,
    "recorded_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "nursing_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "nursing_notes_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "nursing_notes_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "clinical_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "history_of_illness" TEXT,
    "examination_findings" TEXT,
    "assessment" TEXT,
    "plan" TEXT,
    "follow_up_date" DATETIME,
    "doctor_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "clinical_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "clinical_notes_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "clinical_notes_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "clinical_note_id" TEXT NOT NULL,
    "icd_code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "diagnosis_type" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "diagnoses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "diagnoses_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "diagnoses_clinical_note_id_fkey" FOREIGN KEY ("clinical_note_id") REFERENCES "clinical_notes" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prescriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "doctor_id" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "prescriptions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "prescriptions_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "prescriptions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "prescription_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prescription_id" TEXT NOT NULL,
    "drug_id" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "route" TEXT,
    "instructions" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "prescription_items_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "prescription_items_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lab_test_catalog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "category" TEXT,
    "price" REAL NOT NULL,
    "turnaround_time" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "lab_test_catalog_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lab_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "clinical_info" TEXT,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lab_requests_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_requests_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_requests_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "lab_test_catalog" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_requests_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "lab_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "lab_request_id" TEXT NOT NULL,
    "result_value" TEXT NOT NULL,
    "unit" TEXT,
    "reference_range" TEXT,
    "is_abnormal" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "performed_by" TEXT NOT NULL,
    "verified_by" TEXT,
    "result_date" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "lab_results_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_results_lab_request_id_fkey" FOREIGN KEY ("lab_request_id") REFERENCES "lab_requests" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_results_performed_by_fkey" FOREIGN KEY ("performed_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "lab_results_verified_by_fkey" FOREIGN KEY ("verified_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drugs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand_name" TEXT,
    "code" TEXT NOT NULL,
    "category" TEXT,
    "form" TEXT,
    "strength" TEXT,
    "unit" TEXT,
    "unit_price" REAL NOT NULL,
    "reorder_level" INTEGER NOT NULL DEFAULT 10,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "drugs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "drug_stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "drug_id" TEXT NOT NULL,
    "batch_number" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "cost_price" REAL NOT NULL,
    "expiry_date" DATETIME NOT NULL,
    "received_date" DATETIME NOT NULL,
    "grn_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "drug_stock_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "drug_stock_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "drug_stock_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "goods_received_notes" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dispensing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "prescription_id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "dispensed_by" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "dispensing_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dispensing_prescription_id_fkey" FOREIGN KEY ("prescription_id") REFERENCES "prescriptions" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dispensing_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dispensing_dispensed_by_fkey" FOREIGN KEY ("dispensed_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "dispensing_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dispensing_id" TEXT NOT NULL,
    "prescription_item_id" TEXT NOT NULL,
    "drug_stock_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "dispensing_items_dispensing_id_fkey" FOREIGN KEY ("dispensing_id") REFERENCES "dispensing" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dispensing_items_prescription_item_id_fkey" FOREIGN KEY ("prescription_item_id") REFERENCES "prescription_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "dispensing_items_drug_stock_id_fkey" FOREIGN KEY ("drug_stock_id") REFERENCES "drug_stock" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "visit_id" TEXT NOT NULL,
    "patient_id" TEXT NOT NULL,
    "invoice_no" TEXT NOT NULL,
    "subtotal" REAL NOT NULL,
    "tax_amount" REAL NOT NULL DEFAULT 0,
    "discount" REAL NOT NULL DEFAULT 0,
    "total_amount" REAL NOT NULL,
    "paid_amount" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "due_date" DATETIME,
    "generated_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_visit_id_fkey" FOREIGN KEY ("visit_id") REFERENCES "visits" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "invoices_generated_by_fkey" FOREIGN KEY ("generated_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "invoice_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "reference_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_price" REAL NOT NULL,
    "total_price" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "payment_method" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "reference_no" TEXT,
    "payment_date" DATETIME NOT NULL,
    "received_by" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "payments_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "mpesa_transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "payment_id" TEXT,
    "merchant_request_id" TEXT NOT NULL,
    "checkout_request_id" TEXT NOT NULL,
    "phone_number" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "mpesa_receipt" TEXT,
    "result_code" INTEGER,
    "result_desc" TEXT,
    "status" TEXT NOT NULL DEFAULT 'initiated',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "mpesa_transactions_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "mpesa_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_person" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "tax_pin" TEXT,
    "payment_terms" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchase_orders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "po_number" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "total_amount" REAL NOT NULL,
    "notes" TEXT,
    "requested_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "order_date" DATETIME NOT NULL,
    "expected_date" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "purchase_orders_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_requested_by_fkey" FOREIGN KEY ("requested_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "purchase_orders_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "purchase_order_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "purchase_order_id" TEXT NOT NULL,
    "drug_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_cost" REAL NOT NULL,
    "total_cost" REAL NOT NULL,
    "received_qty" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "purchase_order_items_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "purchase_order_items_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "goods_received_notes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "grn_number" TEXT NOT NULL,
    "purchase_order_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "received_by" TEXT NOT NULL,
    "received_date" DATETIME NOT NULL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "goods_received_notes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goods_received_notes_purchase_order_id_fkey" FOREIGN KEY ("purchase_order_id") REFERENCES "purchase_orders" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goods_received_notes_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "goods_received_notes_received_by_fkey" FOREIGN KEY ("received_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "grn_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "grn_id" TEXT NOT NULL,
    "po_item_id" TEXT NOT NULL,
    "drug_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "batch_number" TEXT NOT NULL,
    "expiry_date" DATETIME NOT NULL,
    "cost_price" REAL NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "grn_items_grn_id_fkey" FOREIGN KEY ("grn_id") REFERENCES "goods_received_notes" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "grn_items_po_item_id_fkey" FOREIGN KEY ("po_item_id") REFERENCES "purchase_order_items" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "grn_items_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "stock_alerts" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "drug_id" TEXT NOT NULL,
    "alert_type" TEXT NOT NULL,
    "current_stock" INTEGER NOT NULL,
    "reorder_level" INTEGER NOT NULL,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "stock_alerts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "stock_alerts_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "expense_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "description" TEXT NOT NULL,
    "reference_no" TEXT,
    "expense_date" DATETIME NOT NULL,
    "payment_method" TEXT NOT NULL,
    "receipt_url" TEXT,
    "recorded_by" TEXT NOT NULL,
    "approved_by" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "expenses_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "expenses_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "expenses_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ledger_entries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "entry_date" DATETIME NOT NULL,
    "entry_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "debit" REAL NOT NULL DEFAULT 0,
    "credit" REAL NOT NULL DEFAULT 0,
    "balance" REAL NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "recorded_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ledger_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ledger_entries_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_values" TEXT,
    "new_values" TEXT,
    "ip_address" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tenant_id" TEXT NOT NULL,
    "user_id" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "roles_tenant_id_name_key" ON "roles"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_module_action_key" ON "permissions"("module", "action");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "patients_tenant_id_patient_no_key" ON "patients"("tenant_id", "patient_no");

-- CreateIndex
CREATE INDEX "visits_tenant_id_visit_date_status_idx" ON "visits"("tenant_id", "visit_date", "status");

-- CreateIndex
CREATE UNIQUE INDEX "vitals_visit_id_key" ON "vitals"("visit_id");

-- CreateIndex
CREATE UNIQUE INDEX "clinical_notes_visit_id_key" ON "clinical_notes"("visit_id");

-- CreateIndex
CREATE INDEX "diagnoses_tenant_id_icd_code_idx" ON "diagnoses"("tenant_id", "icd_code");

-- CreateIndex
CREATE UNIQUE INDEX "lab_test_catalog_tenant_id_code_key" ON "lab_test_catalog"("tenant_id", "code");

-- CreateIndex
CREATE UNIQUE INDEX "lab_results_lab_request_id_key" ON "lab_results"("lab_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "drugs_tenant_id_code_key" ON "drugs"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "drug_stock_tenant_id_drug_id_expiry_date_idx" ON "drug_stock"("tenant_id", "drug_id", "expiry_date");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenant_id_invoice_no_key" ON "invoices"("tenant_id", "invoice_no");

-- CreateIndex
CREATE UNIQUE INDEX "mpesa_transactions_payment_id_key" ON "mpesa_transactions"("payment_id");

-- CreateIndex
CREATE INDEX "mpesa_transactions_checkout_request_id_idx" ON "mpesa_transactions"("checkout_request_id");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_tenant_id_name_key" ON "suppliers"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_orders_tenant_id_po_number_key" ON "purchase_orders"("tenant_id", "po_number");

-- CreateIndex
CREATE UNIQUE INDEX "goods_received_notes_tenant_id_grn_number_key" ON "goods_received_notes"("tenant_id", "grn_number");

-- CreateIndex
CREATE INDEX "stock_alerts_tenant_id_is_resolved_idx" ON "stock_alerts"("tenant_id", "is_resolved");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_tenant_id_name_key" ON "expense_categories"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "expenses_tenant_id_expense_date_idx" ON "expenses"("tenant_id", "expense_date");

-- CreateIndex
CREATE INDEX "ledger_entries_tenant_id_entry_date_entry_type_idx" ON "ledger_entries"("tenant_id", "entry_date", "entry_type");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_module_created_at_idx" ON "audit_logs"("tenant_id", "module", "created_at");

-- CreateIndex
CREATE INDEX "notifications_tenant_id_user_id_is_read_idx" ON "notifications"("tenant_id", "user_id", "is_read");
