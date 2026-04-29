export type NewLeadForm = {
  visitDatetime: string;
  storeId: string;
  salesId: string;
  source: string;
  customerName: string;
  phone: string;
  lineId: string;
  interestedModelCode: string;
  priceRangeCode: string;
  usageTimingCode: string;
  residenceTypeCode: string;
  customerGroupCode: string;
  ageRangeCode: string;
  customerLocation: string;
  firstQuestion: string;
  customerTypeFlagCode: string;
  interestedProductCategoryCode: string;
  note: string;
};

export type FieldErrors = Partial<Record<keyof NewLeadForm, string>>;
