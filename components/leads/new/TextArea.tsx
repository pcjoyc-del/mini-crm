type TextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function TextArea({ label, value, onChange, placeholder }: TextAreaProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[#3D3730]">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full rounded-xl border border-[#DCCFBF] bg-white px-3 py-3 text-sm text-[#2E2E2E] placeholder:text-[#8A7D6E] focus:border-[#A67B5B] focus:outline-none"
      />
    </label>
  );
}
