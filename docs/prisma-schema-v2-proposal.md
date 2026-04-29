# Mini CRM – Prisma Schema v2 Proposal

## Goal

ปรับระบบจากเดิมที่ Lead = ทั้งคน + การมาแต่ละครั้ง  
ให้แยกเป็น:

- Lead = ตัวตน / opportunity
- LeadVisit = การเข้าร้านแต่ละครั้ง
- Customer = ลูกค้าที่ convert แล้ว

---

## New Enum Proposal

```prisma
enum LeadLifecycleStatus {
  LEAD
  CUSTOMER
  LOST
}

enum FollowUpTemperature {
  HOT
  WARM
  COLD
  UNKNOWN
}