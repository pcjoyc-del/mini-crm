import { ReactNode } from 'react';

export function SectionCard({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-[#E3D8C8] bg-white p-4 shadow-sm md:p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A5147]">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
