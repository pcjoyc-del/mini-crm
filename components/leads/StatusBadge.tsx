import { LeadStatus } from './types';

const statusStyles: Record<LeadStatus, string> = {
  NEW_LEAD: 'bg-[#EFE7DD] text-[#6B4F3A]',
  FOLLOW_UP: 'bg-[#E9F2E6] text-[#44603D]',
  NEGOTIATING: 'bg-[#F4E8D7] text-[#7A5B3F]',
  WON: 'bg-[#DDEFD8] text-[#2E5D34]',
  LOST: 'bg-[#F1DFDF] text-[#7A4343]',
  CLOSED: 'bg-[#E5E5E5] text-[#4E4E4E]'
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>;
}
