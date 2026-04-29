import { IdentityStatus } from './types';

const styles: Record<IdentityStatus, string> = {
  UNVERIFIED: 'bg-[#EEE7DE] text-[#6B4F3A]',
  PARTIAL_MATCH: 'bg-[#F2E8DA] text-[#7B5C41]',
  VERIFIED: 'bg-[#DDEFD8] text-[#2E5D34]',
  CONFLICT: 'bg-[#F1DFDF] text-[#7A4343]'
};

export function IdentityBadge({ status }: { status: IdentityStatus }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status]}`}>{status}</span>;
}
