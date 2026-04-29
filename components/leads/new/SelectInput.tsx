type SelectInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
};

export function SelectInput({ label, value, onChange, options, required }: SelectInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#3D3730]">{label}{required ? ' *' : ''}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full rounded-xl border border-[#DCCFBF] bg-white px-3 text-sm text-[#2E2E2E] focus:border-[#A67B5B] focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}
