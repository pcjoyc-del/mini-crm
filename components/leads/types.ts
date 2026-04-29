export type LeadStatus =
  | 'NEW_LEAD'
  | 'FOLLOW_UP'
  | 'NEGOTIATING'
  | 'WON'
  | 'LOST'
  | 'CLOSED';

export type IdentityStatus = 'UNVERIFIED' | 'PARTIAL_MATCH' | 'VERIFIED' | 'CONFLICT';

export type LeadSource = 'WALK_IN' | 'LINE' | 'PHONE_CALL' | 'FACEBOOK' | 'REFERRAL' | 'EVENT' | 'OTHER';

export type LeadListItem = {
  id: string;
  visitDatetime: string;
  storeId: string;
  salesId: string;
  customerName: string | null;
  phone: string | null;
  lineId: string | null;
  source: LeadSource;
  status: LeadStatus;
  identityStatus: IdentityStatus;
  createdAt: string;
  updatedAt: string;
  store?: {
    id: string;
    name: string;
  };
  sales?: {
    id: string;
    displayName: string;
  };
};

export type LeadListResponse = {
  data: LeadListItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
};

export type LeadFilters = {
  q: string;
  storeId: string;
  salesId: string;
  status: string;
  identityStatus: string;
  source: string;
  visitDateFrom: string;
  visitDateTo: string;
  createdDateFrom: string;
  createdDateTo: string;
};