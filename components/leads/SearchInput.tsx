type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search name, phone, or LINE"
      className="min-h-11 w-full rounded-xl border border-[#DCCFBF] bg-white px-3 text-sm text-[#2E2E2E] placeholder:text-[#8A7D6E] focus:border-[#A67B5B] focus:outline-none"
    />
  );
}
