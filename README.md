# Sofa Production Planning Prototype

Prototype web app (no backend) to validate **Production Planning** requirements for a sofa factory.

## Quick start (local preview)

1. Run local static server from project root:
   ```bash
   python3 -m http.server 8080
   ```
2. Open browser at:
   ```
   http://localhost:8080
   ```

### UI entry point

- Main entry HTML: `index.html`
- Main app boot file: `src/app.js`

## What you should see on each page

- **Sales Order Items**
  - planner-focused queue grouped by status: Pending Planning, Confirmed, Released, Completed
  - filters, import (mock only), and action to create weekly plan
  - visual overdue/late emphasis
- **Weekly Plans**
  - weekly production plan summary by `plan_week`, line count, releasable items, capacity rule status
- **Release**
  - latest plan release control and generated production orders
- **Delay Analysis**
  - list of late/overdue items for plan-vs-actual discussion

## Import scope

- File import in this prototype is **mock data only**.
- Real Excel import from ERP Vector is **future scope**.

## Data model notes

- `SalesOrderHeader`
- `SalesOrderDetails` (includes mock `detail_line_no`)
- `MergedPlanningRow` (derived in service layer)
  - includes `planning_status`, `can_release`, `customer_req_week`, `plan_week`, `is_late`, `is_overdue`

---

## Mini CRM Prisma quickstart (baseline draft)

### Environment variables

Set in `.env` (or deployment env):

```bash
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>?schema=public"
```

### Prisma commands

```bash
# Generate Prisma Client
npx prisma generate

# Apply migrations in local/dev
npx prisma migrate dev

# Seed baseline showroom data
npx prisma db seed
```

> Migration risk note: enum wording (`LeadStatus`, `IdentityStatus`, `LeadSource`) is marked as canonical v1 in schema, but should still be PO-confirmed before production lock.
