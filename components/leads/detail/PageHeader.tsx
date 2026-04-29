import Link from 'next/link';
import { IdentityBadge } from '../IdentityBadge';
import { StatusBadge } from '../StatusBadge';
import { IdentityStatus, LeadStatus } from '../types';

export function PageHeader({ id, status, identityStatus }: { id: string; status: LeadStatus; identityStatus: IdentityStatus }) {
  return (
    <header className="rounded-2xl border border-[#E3D8C8] bg-white p-5 shadow-sm">
      <Link href="/leads" className="text-sm font-medium text-[#6B4F3A] underline">
        ← Back to Lead List
      </Link>
      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold text-[#2E2E2E]">Lead #{id}</h1>
        <div className="flex items-center gap-2">
          <StatusBadge status={status} />
          <IdentityBadge status={identityStatus} />
        </div>
      </div>
    </header>
  );
}
