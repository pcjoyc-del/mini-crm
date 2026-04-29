import Link from 'next/link';

export function PageHeader() {
  return (
    <header className="rounded-2xl border border-[#E3D8C8] bg-white p-5 shadow-sm">
      <Link href="/leads" className="text-sm font-medium text-[#6B4F3A] underline">
        ← Back to Lead List
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-[#2E2E2E]">New Lead</h1>
      <p className="mt-1 text-sm text-[#5B5349]">Save quickly with only visit info first. Add customer details anytime after.</p>
    </header>
  );
}
