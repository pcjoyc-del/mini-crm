# 🧠 Mini CRM – Project Status

## 📌 Overview

Mini CRM system for showroom lead management.
Focus on capturing, tracking, and converting walk-in / online leads.

---

## 🏗️ Tech Stack

* Frontend: Next.js (App Router)
* Backend: Next.js API Routes
* Database: PostgreSQL
* ORM: Prisma
* Styling: Tailwind CSS

---

## 🗂️ Core Modules

### 1. Lead Management

* Create lead (API ready)
* List leads (UI + API)
* Filter & search
* Pagination

### 2. Master Data

* Store
* SalesUser
* User

### 3. Audit System

* AuditEvent logging for actions

---

## 🧩 Database Design (Simplified)

Lead

* id
* visitDatetime
* storeId → Store
* salesId → SalesUser
* status
* identityStatus

Store

* id
* name

SalesUser

* id
* displayName
* userId → User

---

## 🔌 API Status

### GET /api/leads

✅ Pagination
✅ Filtering
✅ Search (q)
✅ Include relations:

* store.name
* sales.displayName

---

### POST /api/leads

✅ Validation
✅ Create lead
✅ Audit log

---

## 🖥️ UI Status

### /leads

* Lead List (Table + Card)
* Filters
* Pagination
* Status Badge
* Identity Badge

✅ Store name shown
✅ Sales name shown
✅ Responsive UI

---

## ⚠️ Known Gaps

* No Lead Detail Page
* No Create Lead UI
* Cannot update status from UI
* No authentication
* No dashboard

---

## 📊 Current Capability

The system can:

* Store real leads
* Filter & search leads
* Display enriched data (store + sales)
* Handle basic CRM workflow (view only)

---

## 🎯 Next Milestone

Move from:

> “Data Viewer”

To:

> “Actionable CRM System”

---
