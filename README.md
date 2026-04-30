# Clinic-Lite HMIS

A modular, multi-tenant Hospital Management Information System built with Node.js, Next.js, and PostgreSQL.

## Tech Stack

- **Backend**: Express.js + TypeScript + Prisma ORM
- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **Database**: PostgreSQL 16
- **Auth**: JWT (access + refresh tokens) + Role-Based Access Control (RBAC)
- **Payments**: M-Pesa Daraja API (STK Push)
- **Monorepo**: npm workspaces

## Modules

1. **Reception** — Patient registration and visit queuing
2. **Triage** — Vital signs capture (BP, Weight, Temp, HR, SpO2)
3. **Nursing Station** — Treatment room logs and primary care notes
4. **OPD (Doctor's Desk)** — Clinical notes, ICD-10 diagnosis, digital prescriptions
5. **Laboratory** — Test requests, result entry, status tracking
6. **Pharmacy** — Dispensing workflow, stock lookup, inventory deduction
7. **Billing** — Automatic invoice generation, payments, M-Pesa integration
8. **Procurement & Inventory** — Supplier management, LPOs, GRN, stock alerts
9. **Accounts** — Daily revenue reports, expense tracking, general ledger

## Multi-Tenancy

Row-level tenant isolation — every table includes a `tenantId` foreign key. Each clinic operates in complete data isolation.

## RBAC Roles

| Role | Modules |
|---|---|
| Admin | All modules |
| Doctor | Reception (R), Triage (R), Nursing (R), OPD (CRUD), Lab (CR), Pharmacy (R), Billing (R) |
| Nurse | Reception (R), Triage (CRUD), Nursing (CRUD), OPD (R), Lab (R) |
| Lab Technician | Reception (R), OPD (R), Lab (CRUD) |
| Pharmacist | Reception (R), OPD (R), Pharmacy (CRUD), Billing (R) |
| Receptionist | Reception (CRUD), Triage (R), Billing (CRUD) |
| Accountant | Billing (CRUD+A), Procurement (R), Accounts (CRUD+A) |
| Procurement Officer | Pharmacy (R), Procurement (CRUD), Inventory (CRUD) |

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 16 (or use Docker)
- npm 9+

### Setup

```bash
# Clone the repo
git clone <repo-url>
cd clinic-lite

# Start PostgreSQL via Docker
docker-compose up -d

# Install dependencies
cd apps/api && npm install
cd ../web && npm install

# Set up the API
cd ../api
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push

# Seed demo data
npx prisma db seed

# Start the API
npm run dev
```

```bash
# In another terminal — start the frontend
cd apps/web
npm run dev
```

### Demo Credentials

| Role | Email | Password | Tenant Slug |
|---|---|---|---|
| Admin | admin@democlinic.co.ke | admin123 | demo-clinic |
| Doctor | doctor@democlinic.co.ke | doctor123 | demo-clinic |

## Project Structure

```
clinic-lite/
├── apps/
│   ├── api/                    # Express.js backend
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # 30+ models
│   │   │   └── seed.ts         # Demo data seeder
│   │   └── src/
│   │       ├── config/         # env, database, mpesa
│   │       ├── middleware/     # auth, rbac, tenant, validate, error
│   │       ├── modules/       # Feature modules
│   │       │   ├── auth/
│   │       │   ├── patients/
│   │       │   ├── visits/
│   │       │   ├── triage/
│   │       │   ├── nursing/
│   │       │   ├── opd/
│   │       │   ├── laboratory/
│   │       │   ├── pharmacy/
│   │       │   ├── billing/
│   │       │   ├── mpesa/
│   │       │   ├── procurement/
│   │       │   ├── inventory/
│   │       │   └── accounts/
│   │       └── shared/        # utils, types, constants
│   └── web/                   # Next.js 14 frontend
│       └── src/
│           ├── app/
│           │   ├── (auth)/    # Login & Register
│           │   └── (dashboard)/ # All module pages
│           ├── components/    # Reusable UI components
│           ├── lib/           # API client, utilities
│           └── store/         # Zustand auth store
├── docker-compose.yml         # PostgreSQL + pgAdmin
└── README.md
```

## API Endpoints

All endpoints are prefixed with `/api`.

| Module | Endpoint | Description |
|---|---|---|
| Auth | POST /auth/register | Register new clinic |
| Auth | POST /auth/login | Login |
| Auth | POST /auth/refresh | Refresh tokens |
| Patients | GET/POST /patients | List / register patients |
| Visits | GET/POST /visits | List / create visits |
| Visits | GET /visits/queue | Today's patient queue |
| Triage | POST /vitals | Record vital signs |
| Nursing | GET/POST /nursing-notes | Nursing notes |
| OPD | POST /opd/clinical-notes | Create clinical note |
| OPD | POST /opd/prescriptions | Create prescription |
| Lab | GET/POST /laboratory/requests | Lab test requests |
| Lab | POST /laboratory/results | Enter lab results |
| Pharmacy | GET/POST /pharmacy/drugs | Drug catalog |
| Pharmacy | POST /pharmacy/dispense | Dispense prescription |
| Billing | POST /billing/invoices | Generate invoice |
| Billing | POST /billing/payments | Record payment |
| M-Pesa | POST /mpesa/stk-push | Initiate STK Push |
| Procurement | GET/POST /procurement/purchase-orders | LPOs |
| Procurement | POST /procurement/grn | Goods received notes |
| Inventory | GET /inventory/stock-summary | Stock levels |
| Inventory | GET /inventory/alerts | Stock alerts |
| Accounts | GET /accounts/reports/daily-revenue | Daily report |
| Accounts | GET /accounts/ledger | General ledger |

## Print Support

All views include `print.css` optimized for HP LaserJet and standard A4 printers. Use `Ctrl+P` from any page.

## Deployment

### Vercel

The API includes a `vercel.json` for serverless deployment. The Next.js frontend deploys natively on Vercel.

## License

MIT
