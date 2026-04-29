import { LeadDetail } from './types';

export function IdentityLinkCard({ item }: { item: LeadDetail['identityLinks'][number] }) {
  return (
    <div className="rounded-xl border border-[#E9DECF] bg-[#FCFAF7] p-3 text-sm">
      <p className="font-medium text-[#2E2E2E]">Customer: {item.customerId}</p>
      <p className="text-[#6A6056]">Identity: {item.identityStatus}</p>
      <p className="text-[#6A6056]">Primary: {item.isPrimaryIdentity ? 'Yes' : 'No'}</p>
      {item.confidenceScore ? <p className="text-[#6A6056]">Confidence: {item.confidenceScore}</p> : null}
      {item.mappedAt ? <p className="text-[#6A6056]">Mapped: {new Date(item.mappedAt).toLocaleString()}</p> : null}
    </div>
  );
}
