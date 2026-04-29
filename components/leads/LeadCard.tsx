import Link from 'next/link';
import { IdentityBadge } from './IdentityBadge';
import { StatusBadge } from './StatusBadge';
import { LeadListItem } from './types';

export function LeadCard({ lead }: { lead: LeadListItem }) {
  return (
    <Link
      href={`/leads/${lead.id}`}
      aria-label={`View detail for ${lead.customerName || 'lead'}`}
      className="block rounded-2xl border border-[#E3D8C8] bg-white p-4 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#2E2E2E]">{lead.customerName || 'Unnamed lead'}</p>
          <p className="mt-1 text-sm text-[#6D6257]">{lead.phone || 'No phone'}</p>
        </div>
        <StatusBadge status={lead.status} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-[#5F5449]">
        <p>Source: {lead.source}</p>
        <p>Store: {lead.storeId}</p>
        <p>Sales: {lead.salesId}</p>
        <p>Visit: {new Date(lead.visitDatetime).toLocaleDateString()}</p>
      </div>
      <div className="mt-3">
        <IdentityBadge status={lead.identityStatus} />
      </div>
      <div className="mt-4 text-right">
        <span className="inline-flex min-h-10 items-center rounded-lg border border-[#D7C6B1] px-3 text-xs font-medium text-[#6B4F3A]">
          View detail →
        </span>
      </div>
    </Link>
  );
}