export function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-2 gap-2 border-b border-[#F0E7DB] py-2 text-sm last:border-b-0">
      <span className="text-[#6A6056]">{label}</span>
      <span className="text-right font-medium text-[#2E2E2E]">{value || '-'}</span>
    </div>
  );
}
