# Mini CRM Prisma Schema Notes (Final cleanup pass)

## Changelog (this pass)

- Marked `LeadStatus`, `IdentityStatus`, and `LeadSource` values as canonical v1 values directly in enum comments for stability and clarity.
- Changed `Lead.customerName` to nullable (`String?`) while keeping it non-unique, matching save-first/mobile-first behavior.
- Clarified `User` vs `SalesUser` boundary:
  - `SalesUser` = operational sales-assignment identity
  - `User` = authentication/authorization identity
  - Added optional one-to-one link `SalesUser.userId`.
- Removed duplicated secondary lead storage from `MergeRequest` by deleting `secondaryLeadIds`; `MergeActionSecondaryLead` is now the source of truth.
- Improved `LeadCustomerMap` actor tracking by replacing `mappedById` string with `mappedByUserId` FK relation to `User`.
- Clarified controlled lead qualification fields as **master-data codes** by using code-oriented column names (`...Code` fields).

## Controlled-code domains (expected)

The following lead fields are stored as controlled codes and should be validated in app-layer rules against `MasterDataItem(domain, code)`:

- `interestedModelCode`
- `priceRangeCode`
- `usageTimingCode`
- `residenceTypeCode`
- `customerGroupCode`
- `ageRangeCode`
- `customerTypeFlagCode`
- `interestedProductCategoryCode`

Suggested domains: `interested_model`, `price_range`, `usage_timing`, `residence_type`, `customer_group`, `age_range`, `customer_type_flag`, `interested_product_category`.

## Recommendation for migrations

- **Ready for baseline migration draft** after product owner confirms canonical enum wording from the requirement pack.
- If wording confirmation is delayed, migration can still proceed with the currently marked canonical v1 values and a follow-up enum migration plan.

## Migration risk flags

- Enum labels are now treated as canonical v1 and are used in seed/API examples.
- If PO changes enum wording later, follow-up enum migrations plus API contract updates will be required.
