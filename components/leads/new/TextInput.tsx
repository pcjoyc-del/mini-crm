type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

export function TextInput({ label, value, onChange, placeholder, required }: TextInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#3D3730]">{label}{required ? ' *' : ''}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-12 w-full rounded-xl border border-[#DCCFBF] bg-white px-3 text-sm text-[#2E2E2E] placeholder:text-[#8A7D6E] focus:border-[#A67B5B] focus:outline-none"
      />
    </label>
  );
}
