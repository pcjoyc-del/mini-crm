type SelectInputProps = {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
};

export function SelectInput({ value, onChange, options }: SelectInputProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-11 w-full rounded-xl border border-[#DCCFBF] bg-white px-3 text-sm text-[#2E2E2E] focus:border-[#A67B5B] focus:outline-none"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
