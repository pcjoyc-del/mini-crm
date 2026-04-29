import { ReactNode } from 'react';

export function SectionCard({ children }: { children: ReactNode }) {
  return <section className="rounded-2xl border border-[#E3D8C8] bg-white p-4 shadow-sm md:p-5">{children}</section>;
}
