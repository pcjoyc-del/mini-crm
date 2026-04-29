# Mini CRM Phase-1 API Contract (Proposed)

Base URL: `/api`
Content-Type: `application/json`

## 1) POST `/api/leads`
Create lead with save-first behavior.

### Request body
```json
{
  "visitDatetime": "2026-04-23T09:30:00.000Z",
  "storeId": "store_cuid",
  "salesId": "sales_user_cuid",
  "customerName": null,
  "phone": "0891234567",
  "lineId": null,
  "source": "WALK_IN",
  "interestedModelCode": "MOD_L_SHAPE",
  "priceRangeCode": "PR_40_70K",
  "usageTimingCode": "USE_3_6M",
  "residenceTypeCode": "RES_HOUSE",
  "customerGroupCode": "CG_FAMILY",
  "ageRangeCode": "AGE_35_44",
  "customerLocation": "Bangkok",
  "firstQuestion": "Do you have stain-resistant fabric?",
  "customerTypeFlagCode": "CTF_REPLACE",
  "interestedProductCategoryCode": "CAT_SOFA_SET",
  "note": "Walk-in quick capture"
}
```

### Response `201`
```json
{
  "id": "lead_cuid",
  "status": "NEW_LEAD",
  "identityStatus": "UNVERIFIED",
  "createdAt": "2026-04-23T09:30:05.000Z",
  "updatedAt": "2026-04-23T09:30:05.000Z"
}
```

## 2) GET `/api/leads`
List leads with filters and pagination.

### Query params
- `page` (default `1`), `pageSize` (default `20`, max `100`)
- `storeId`, `salesId`, `status`, `identityStatus`, `source`
- `phone`, `lineId`, `visitDateFrom`, `visitDateTo`, `createdDateFrom`, `createdDateTo`
- `q` (search over `customerName`, `phone`, `lineId`)

### Response `200`
```json
{
  "data": [{ "id": "lead_cuid", "customerName": null, "phone": "0891234567", "status": "NEW_LEAD" }],
  "pagination": { "page": 1, "pageSize": 20, "total": 128 }
}
```

## 3) GET `/api/leads/:id`
Fetch single lead with history and identity mappings.

### Response `200`
```json
{
  "id": "lead_cuid",
  "visitDatetime": "2026-04-23T09:30:00.000Z",
  "storeId": "store_cuid",
  "salesId": "sales_user_cuid",
  "status": "FOLLOW_UP",
  "identityStatus": "PARTIAL_MATCH",
  "statusHistory": [
    { "fromStatus": "NEW_LEAD", "toStatus": "FOLLOW_UP", "changedAt": "2026-04-23T10:00:00.000Z" }
  ],
  "identityLinks": [
    { "customerId": "customer_cuid", "identityStatus": "PARTIAL_MATCH", "isPrimaryIdentity": true }
  ]
}
```

## 4) PATCH `/api/leads/:id`
Partial update lead fields.

### Request body
```json
{
  "status": "FOLLOW_UP",
  "note": "Sent quotation by LINE",
  "priceRangeCode": "PR_40_70K"
}
```

### Response `200`
```json
{
  "id": "lead_cuid",
  "status": "FOLLOW_UP",
  "updatedAt": "2026-04-23T10:15:00.000Z"
}
```

## 5) POST `/api/duplicates/check`
Run manual duplicate check for a lead.

### Request body
```json
{
  "leadId": "lead_cuid",
  "signals": ["PHONE_EXACT", "LINE_EXACT"]
}
```

### Response `200`
```json
{
  "duplicateCaseId": "dup_case_cuid",
  "status": "OPEN",
  "candidates": [
    { "leadId": "lead_other_cuid", "score": 92.5, "signal": "PHONE_EXACT" }
  ]
}
```

## 6) POST `/api/customers/link`
Manual identity linking between lead and customer.

### Request body
```json
{
  "leadId": "lead_cuid",
  "customerId": "customer_cuid",
  "identityStatus": "VERIFIED",
  "confidenceScore": 98.0,
  "isPrimaryIdentity": true
}
```

### Response `200`
```json
{
  "leadCustomerMapId": "map_cuid",
  "leadId": "lead_cuid",
  "customerId": "customer_cuid",
  "identityStatus": "VERIFIED"
}
```

## 7) POST `/api/orders/link`
Link lead (and optional customer) to an order reference.

### Request body
```json
{
  "leadId": "lead_cuid",
  "customerId": "customer_cuid",
  "orderNumber": "SO-2026-000245",
  "currencyCode": "THB",
  "subtotalAmount": 45900,
  "taxAmount": 3213,
  "totalAmount": 49113,
  "orderedAt": "2026-04-25T07:00:00.000Z"
}
```

### Response `201`
```json
{
  "orderId": "order_cuid",
  "orderNumber": "SO-2026-000245",
  "status": "CONFIRMED"
}
```

## Error shape (all endpoints)
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "status must be one of: NEW_LEAD, FOLLOW_UP, NEGOTIATING, WON, LOST, CLOSED",
    "details": [{ "field": "status", "reason": "invalid_enum" }]
  }
}
```
