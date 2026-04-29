# Mini CRM – Business Workflow v2

## Core Concept

The system must separate:

- Visit / Traffic = each time a visitor comes to the showroom
- Lead = a sales opportunity or identifiable prospect
- Customer = a converted lead who purchased

Current important rule:

> One person may visit multiple times before becoming a customer.

---

## Business Flow

### 1. Visitor enters showroom

Sales records a visit as quickly as possible.

Required:
- Visit date/time
- Store
- Sales person
- Channel / Source

Optional:
- Name / nickname
- Phone
- LINE ID
- Interested model
- Budget
- Usage timing
- First question
- Note

---

### 2. Create or match Lead

When saving a visit, system should support:

#### Case A: New unknown visitor
Create:
- New Lead
- New Visit

#### Case B: Existing lead returns
Create:
- New Visit linked to existing Lead

#### Case C: Visitor later provides phone / LINE
Update Lead identity:
- phone
- lineId
- identity status

---

## Lead Status Logic

Lead should have two separate concepts:

### 1. Lifecycle Status
Where the lead is in business process.

Examples:
- LEAD
- CUSTOMER
- LOST

### 2. Follow-up Temperature
How interested / urgent the lead is.

Examples:
- HOT
- WARM
- COLD

Example:
- Khun Namfon
- Interested in Jasmine
- Usage timing: 6 months
- Follow-up temperature: WARM
- Lifecycle status: LEAD

---

## Visit Logic

Every showroom visit must be recorded.

Example:

Khun Namfon visits 3 times before buying.

Result:
- Lead = 1
- Visits = 3
- Customer = 1 after conversion

---

## Sales Attribution Example

Scenario:
- Visit 1: Sales A welcomes visitor, no phone / LINE
- Visit 2: Sales B welcomes same visitor, customer gives phone
- Later converts to customer

Business result:
- Traffic count = 2
- Lead count = 1
- Customer count = 1
- Sales attribution requires business rule later

Possible attribution rules:
- First-touch sales
- Last-touch sales
- Closing sales
- Shared contribution

---

## Required Data Model Direction

Current Lead table mixes:
- lead identity
- visit event
- follow-up info

Need to review into:

### Lead
Represents prospect / opportunity.

Suggested fields:
- id
- displayName
- phone
- lineId
- lifecycleStatus
- followUpTemperature
- interestedModelCode
- usageTimingCode
- priceRangeCode
- customerTypeFlagCode
- note
- convertedCustomerId
- createdAt
- updatedAt

### LeadVisit
Represents each showroom visit / traffic.

Suggested fields:
- id
- leadId
- visitDatetime
- storeId
- salesId
- source
- firstQuestion
- note
- createdAt
- updatedAt

---

## UI Direction

Need 2 views:

### Lead List
Focus on people / opportunities.

Columns:
- Lead Name / Reference
- Phone / LINE
- Interested Model
- Temperature
- Lifecycle Status
- Last Visit
- Next Action

### Visit Log
Focus on showroom traffic.

Columns:
- Visit Date
- Store
- Sales
- Source
- Lead Reference
- Note

---

## MVP Test Goal

Before Thursday demo, test this simplified flow:

1. Create unknown visit
2. Edit lead later with name / phone
3. Add another visit for same lead
4. See that lead = 1 but visits = 2
5. Convert lead to customer later