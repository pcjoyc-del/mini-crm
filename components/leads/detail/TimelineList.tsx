import { LeadDetail } from './types';

export function TimelineList({ items }: { items: LeadDetail['statusHistory'] }) {
  if (!items.length) return <p className="text-sm text-[#6A6056]">No status history yet.</p>;

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.id} className="rounded-xl border border-[#E9DECF] bg-[#FCFAF7] p-3 text-sm">
          <p className="font-medium text-[#2E2E2E]">{item.fromStatus || 'N/A'} → {item.toStatus}</p>
          <p className="mt-1 text-xs text-[#6A6056]">{new Date(item.changedAt).toLocaleString()}</p>
          {item.changeReason ? <p className="mt-1 text-xs text-[#6A6056]">Reason: {item.changeReason}</p> : null}
        </li>
      ))}
    </ul>
  );
}
