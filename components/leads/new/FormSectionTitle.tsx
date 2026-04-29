export function FormSectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A5147]">{title}</h2>
      {subtitle ? <p className="mt-1 text-xs text-[#6D6359]">{subtitle}</p> : null}
    </div>
  );
}
