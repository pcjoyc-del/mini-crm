import { DateInput } from './DateInput';
import { SearchInput } from './SearchInput';
import { SelectInput } from './SelectInput';
import { LeadFilters } from './types';

type FilterBarProps = {
  filters: LeadFilters;
  onChange: (key: keyof LeadFilters, value: string) => void;
  onClear: () => void;
  storeOptions: Array<{ label: string; value: string }>;
  salesOptions: Array<{ label: string; value: string }>;
};

const statusOptions = ['ALL', 'NEW_LEAD', 'FOLLOW_UP', 'NEGOTIATING', 'WON', 'LOST', 'CLOSED'];
const identityOptions = ['ALL', 'UNVERIFIED', 'PARTIAL_MATCH', 'VERIFIED', 'CONFLICT'];
const sourceOptions = ['ALL', 'WALK_IN', 'LINE', 'PHONE_CALL', 'FACEBOOK', 'REFERRAL', 'EVENT', 'OTHER'];

function FilterFields({ filters, onChange, storeOptions, salesOptions }: Omit<FilterBarProps, 'onClear'>) {
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
      <SearchInput value={filters.q} onChange={(v) => onChange('q', v)} />
      <SelectInput value={filters.storeId} onChange={(v) => onChange('storeId', v)} options={storeOptions} />
      <SelectInput value={filters.salesId} onChange={(v) => onChange('salesId', v)} options={salesOptions} />
      <SelectInput
        value={filters.status}
        onChange={(v) => onChange('status', v)}
        options={statusOptions.map((v) => ({ label: v === 'ALL' ? 'All statuses' : v, value: v }))}
      />
      <SelectInput
        value={filters.identityStatus}
        onChange={(v) => onChange('identityStatus', v)}
        options={identityOptions.map((v) => ({ label: v === 'ALL' ? 'All identity' : v, value: v }))}
      />
      <SelectInput
        value={filters.source}
        onChange={(v) => onChange('source', v)}
        options={sourceOptions.map((v) => ({ label: v === 'ALL' ? 'All sources' : v, value: v }))}
      />
      <DateInput value={filters.visitDateFrom} onChange={(v) => onChange('visitDateFrom', v)} />
      <DateInput value={filters.visitDateTo} onChange={(v) => onChange('visitDateTo', v)} />
      <DateInput value={filters.createdDateFrom} onChange={(v) => onChange('createdDateFrom', v)} />
      <DateInput value={filters.createdDateTo} onChange={(v) => onChange('createdDateTo', v)} />
    </div>
  );
}

export function FilterBar(props: FilterBarProps) {
  return (
    <section className="rounded-2xl border border-[#E3D8C8] bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#5A5147]">Filters</h2>
        <button type="button" onClick={props.onClear} className="min-h-10 rounded-lg px-3 text-sm text-[#6B4F3A] underline">
          Clear filters
        </button>
      </div>

      <div className="hidden md:block">
        <FilterFields {...props} />
      </div>

      <details className="md:hidden">
        <summary className="min-h-11 cursor-pointer rounded-xl border border-[#DCCFBF] px-3 py-2 text-sm text-[#3F3831]">Open filters</summary>
        <div className="mt-3">
          <FilterFields {...props} />
        </div>
      </details>
    </section>
  );
}
