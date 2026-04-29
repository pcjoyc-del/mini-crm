type DateInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DateInput({ value, onChange }: DateInputProps) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 w-full rounded-xl border border-[#DCCFBF] bg-white px-3 text-sm text-[#2E2E2E] focus:border-[#A67B5B] focus:outline-none"
    />
  );
}
