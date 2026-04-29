# Mini CRM – Data Model v2

## Core Principle

Separate 3 concepts:

1. Lead = prospect / opportunity
2. LeadVisit = each showroom visit / traffic
3. Customer = converted buyer

---

## Model: Lead

Represents one prospect or sales opportunity.

### Purpose

Track who the lead is, what they are interested in, and follow-up status.

### Suggested Fields

- id
- displayName
- customerName
- phone
- lineId
- identityStatus
- lifecycleStatus
- followUpTemperature
- interestedModelCode
- priceRangeCode
- usageTimingCode
- residenceTypeCode
- customerGroupCode
- ageRangeCode
- customerLocation
- customerTypeFlagCode
- interestedProductCategoryCode
- note
- convertedCustomerId
- createdAt
- updatedAt

### Example

Khun Namfon  
Interested in Jasmine  
Usage timing: 6 months  
Temperature: WARM  
Lifecycle status: LEAD

---

## Model: LeadVisit

Represents one physical or online interaction / visit.

### Purpose

Track traffic count and sales touchpoint.

### Suggested Fields

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

### Example

Visit 1:
- Store: Bangna
- Sales: Sales A
- Source: Walk-in
- No phone yet

Visit 2:
- Store: Bangna
- Sales: Sales B
- Source: Walk-in
- Customer gives phone

Result:
- Lead = 1
- LeadVisit = 2

---

## Model: Customer

Represents buyer after conversion.

### Purpose

Store customer identity after purchase.

### Suggested Fields

- id
- leadId
- customerName
- phone
- lineId
- createdAt
- updatedAt

---

## Status Design

### lifecycleStatus

Business stage:

- LEAD
- CUSTOMER
- LOST

### followUpTemperature

Sales follow-up priority:

- HOT
- WARM
- COLD

---

## Relationship

Lead 1 → many LeadVisit

Lead 1 → optional Customer

Store 1 → many LeadVisit

SalesUser 1 → many LeadVisit

---

## Important Metrics Enabled

### Traffic

Count LeadVisit records.

### Lead Count

Count Lead records.

### Repeat Visit

Count visits per lead.

### Conversion

Lead converted to Customer.

### Sales Attribution

Possible rules:
- First-touch sales
- Last-touch sales
- Closing sales
- Shared attribution

---

## Migration Direction

Current Lead table already contains mixed data.

Recommended approach:

### Short term

Keep current Lead table working.

Add LeadVisit table.

When creating a new lead:
- create Lead
- create first LeadVisit

When same lead returns:
- create another LeadVisit linked to existing Lead

### Later

Move visit-specific fields from Lead to LeadVisit.

---

## MVP Demo Goal

Before Thursday:

1. Create Lead with first visit
2. Edit Lead identity later
3. Add another visit to same Lead
4. Show Lead Detail with visit history