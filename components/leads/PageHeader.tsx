import Link from 'next/link';

export function PageHeader() {
  return (
    <header className="flex flex-col gap-3 rounded-2xl border border-[#E3D8C8] bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-[#2E2E2E]">Lead List</h1>
        <p className="mt-1 text-sm text-[#5B5349]">Track showroom leads quickly and keep follow-ups on schedule.</p>
      </div>
      <Link
        href="/leads/new"
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#6B4F3A] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#5e4532]"
      >
        New Lead
      </Link>
    </header>
  );
}
