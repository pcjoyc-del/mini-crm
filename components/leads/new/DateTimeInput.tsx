type DateTimeInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

export function DateTimeInput({ label, value, onChange, required }: DateTimeInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#3D3730]">{label}{required ? ' *' : ''}</span>
      <input
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 w-full rounded-xl border border-[#DCCFBF] bg-white px-3 text-sm text-[#2E2E2E] focus:border-[#A67B5B] focus:outline-none"
      />
    </label>
  );
}
