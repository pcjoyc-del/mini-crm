'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';

type Option = { label: string; value: string };

const statusOptions: Option[] = [
  { label: 'NEW_LEAD', value: 'NEW_LEAD' },
  { label: 'FOLLOW_UP', value: 'FOLLOW_UP' },
  { label: 'NEGOTIATING', value: 'NEGOTIATING' },
  { label: 'WON', value: 'WON' },
  { label: 'LOST', value: 'LOST' },
];

const identityStatusOptions: Option[] = [
  { label: 'UNVERIFIED', value: 'UNVERIFIED' },
  { label: 'PARTIAL', value: 'PARTIAL' },
  { label: 'VERIFIED', value: 'VERIFIED' },
];

async function fetchOptions(url: string, mapFn: (item: any) => Option): Promise<Option[]> {
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.data?.map(mapFn) ?? [];
  } catch {
    return [];
  }
}

function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 10);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 2)}-${digits.slice(2)}`;

  return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6)}`;
}

export default function LeadDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [lead, setLead] = useState<any>(null);
  const [form, setForm] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const conversionRef = useRef<HTMLElement>(null);
  const prevStatusRef = useRef<string | null>(null);

  const [interestedModelOptions, setInterestedModelOptions] = useState<Option[] | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<Option[] | null>(null);
  const [materialOptions, setMaterialOptions] = useState<Option[] | null>(null);
  const [priceRangeOptions, setPriceRangeOptions] = useState<Option[]>([{ label: 'Select price range', value: '' }]);
  const [usageTimingOptions, setUsageTimingOptions] = useState<Option[]>([{ label: 'Select usage timing', value: '' }]);

  function mapLeadToForm(lead: any) {
    return {
      ...lead,
      interestedModelCodes: lead.interestedModels?.map((m: any) => m.code) ?? [],
      categoryCodes: lead.categories?.map((c: any) => c.code) ?? [],
      materialCodes: lead.materials?.map((m: any) => m.code) ?? [],
    };
  }

  useEffect(() => {
    if (
      form?.status === 'WON' &&
      prevStatusRef.current !== null &&
      prevStatusRef.current !== 'WON'
    ) {
      conversionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    prevStatusRef.current = form?.status ?? null;
  }, [form?.status]);

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((res) => res.json())
      .then((json) => {
        setLead(json.data);
        setForm(mapLeadToForm(json.data));
      });

    fetchOptions('/api/admin/master-data?domain=interested_model&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setInterestedModelOptions(opts));

    fetchOptions('/api/admin/master-data?domain=category&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setCategoryOptions(opts));

    fetchOptions('/api/admin/master-data?domain=material&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setMaterialOptions(opts));

    fetchOptions('/api/admin/master-data?domain=price_range&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setPriceRangeOptions([{ label: 'Select price range', value: '' }, ...opts]));

    fetchOptions('/api/admin/master-data?domain=usage_timing&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setUsageTimingOptions([{ label: 'Select usage timing', value: '' }, ...opts]));
  }, [id]);

  if (!lead || !form) {
    return <main className="min-h-screen bg-[#f5efe5] p-6 text-sm">Loading...</main>;
  }

  const isWon = form.status === 'WON';

  const setField = (key: string, value: any) => {
    setForm((prev: any) => ({ ...prev, [key]: value }));
  };

  const save = async () => {
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json?.error?.message || 'Failed to save lead');
      }

      setLead(json.data);
      setForm(mapLeadToForm(json.data));
      setEditing(false);
    } catch (err) {
      setError((err as Error).message || 'Failed to save lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6 text-sm">
      <div className="mx-auto max-w-5xl space-y-5">
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <a
                href="/leads"
                className="inline-block rounded-xl border border-[#6f4e37] px-4 py-2 text-sm font-bold text-[#6f4e37] hover:bg-[#6f4e37] hover:text-white"
              >
                ← Back to Lead List
              </a>

              <h1 className="mt-5 text-2xl font-bold text-stone-800">
                {lead.leadName || lead.customerName || 'Untitled Lead'}
              </h1>
              <p className="mt-1 text-sm text-stone-600">
                Lead detail, follow-up context, and visit information.
              </p>
            </div>

            <div className="flex gap-3">
              {editing ? (
                <>
                  <button
                    onClick={() => {
                      setForm(mapLeadToForm(lead));
                      setEditing(false);
                    }}
                    className="rounded-xl border border-[#6f4e37] px-5 py-3 text-sm font-bold text-[#6f4e37]"
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    onClick={save}
                    className="rounded-xl bg-[#6f4e37] px-5 py-3 text-sm font-bold text-white"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-xl bg-[#6f4e37] px-5 py-3 text-sm font-bold text-white"
                  >
                    Edit
                  </button>

                  <a
                    href={`/leads/${lead.id}/add-visit`}
                    className="rounded-xl border border-[#6f4e37] px-5 py-3 text-sm font-bold text-[#6f4e37]"
                  >
                    Add Visit
                  </a>
                </>
              )}
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-stone-700">Identity</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <TextField label="Lead Name" value={form.leadName || ''} editing={editing} onChange={(v) => setField('leadName', v)} />

            <TextField
              label="Phone"
              value={formatPhone(form.phone || '')}
              editing={editing}
              onChange={(v) => setField('phone', formatPhone(v))}
              placeholder="08-8888-8888"
            />

            <TextField label="LINE ID" value={form.lineId || ''} editing={editing} onChange={(v) => setField('lineId', v)} />
            <TextField label="Resident Location" value={form.residentLocation || ''} editing={editing} onChange={(v) => setField('residentLocation', v)} />

            <SelectField
              label="Status"
              value={form.status || 'NEW_LEAD'}
              editing={editing}
              onChange={(v) => setField('status', v)}
              options={statusOptions}
            />

            <SelectField
              label="Identity Status"
              value={form.identityStatus || 'UNVERIFIED'}
              editing={editing}
              onChange={(v) => setField('identityStatus', v)}
              options={identityStatusOptions}
            />
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-stone-700">Qualification</h2>

          <div className="space-y-4">
            <ModelPickerField label="Interested Model" values={form.interestedModelCodes ?? []} editing={editing} onChange={(v) => setField('interestedModelCodes', v)} options={interestedModelOptions} />
            <ModelPickerField label="Category" values={form.categoryCodes ?? []} editing={editing} onChange={(v) => setField('categoryCodes', v)} options={categoryOptions} />
            <ModelPickerField label="Material" values={form.materialCodes ?? []} editing={editing} onChange={(v) => setField('materialCodes', v)} options={materialOptions} />
            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Size" value={form.sizeText || ''} editing={editing} onChange={(v) => setField('sizeText', v)} />
              <SelectField label="Price Range" value={form.priceRangeCode || ''} editing={editing} onChange={(v) => setField('priceRangeCode', v)} options={priceRangeOptions} />
              <SelectField label="Usage Timing" value={form.usageTimingCode || ''} editing={editing} onChange={(v) => setField('usageTimingCode', v)} options={usageTimingOptions} />
            </div>
            <TemperatureField value={form.followUpTemperature || 'UNKNOWN'} editing={editing} onChange={(v) => setField('followUpTemperature', v)} />
            <TextField label="Note" value={form.note || ''} editing={editing} onChange={(v) => setField('note', v)} textarea />
          </div>
        </section>

        {isWon ? (
          <section ref={conversionRef} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-bold text-stone-700">Conversion</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <TextField label="Customer Name" value={form.customerName || ''} editing={editing} onChange={(v) => setField('customerName', v)} />
              <TextField label="Sales Order No." value={form.salesOrderNo || ''} editing={editing} onChange={(v) => setField('salesOrderNo', v)} />
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-stone-700">
            Visit History ({lead.visits?.length ?? 0})
          </h2>

          <div className="space-y-3">
            {lead.visits?.map((visit: any) => (
              <div key={visit.id} className="rounded-xl border p-4 text-sm">
                <div className="font-semibold">
                  {new Date(visit.visitDatetime).toLocaleString('th-TH')}
                </div>
                <div className="text-stone-600">Store: {visit.store?.name || '-'}</div>
                <div className="text-stone-600">Sales: {visit.sales?.displayName || '-'}</div>
                <div className="text-stone-600">Source: {visit.source || '-'}</div>
                <div className="text-stone-600">Visit Purpose: {visit.visitPurpose || '-'}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function TextField({
  label,
  value,
  editing,
  onChange,
  textarea = false,
  placeholder,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="rounded-xl border bg-stone-50 p-4">
      <div className="text-xs font-semibold uppercase text-stone-500">{label}</div>

      {editing ? (
        textarea ? (
          <textarea
            className="mt-2 min-h-24 w-full rounded-lg border px-3 py-2 text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        ) : (
          <input
            className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
        )
      ) : (
        <div className="mt-1 text-sm text-stone-900">{value || '-'}</div>
      )}
    </div>
  );
}

function SelectField({
  label,
  value,
  editing,
  onChange,
  options,
}: {
  label: string;
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
  options: Option[];
}) {
  const display = options.find((option) => option.value === value)?.label || value || '-';

  return (
    <div className="rounded-xl border bg-stone-50 p-4">
      <div className="text-xs font-semibold uppercase text-stone-500">{label}</div>

      {editing ? (
        <select
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((option) => (
            <option key={option.label + option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="mt-1 text-sm text-stone-900">{display}</div>
      )}
    </div>
  );
}


function ModelPickerField({
  label,
  values,
  editing,
  onChange,
  options,
  max = 5,
}: {
  label: string;
  values: string[];
  editing: boolean;
  onChange: (values: string[]) => void;
  options: Option[] | null;
  max?: number;
}) {
  const selected = values
    .map((v) => options?.find((o) => o.value === v))
    .filter(Boolean) as Option[];
  const available = (options ?? []).filter((o) => !values.includes(o.value));
  const canAdd = values.length < max;

  const add = (code: string) => {
    if (code && !values.includes(code) && values.length < max) {
      onChange([...values, code]);
    }
  };

  const remove = (code: string) => {
    onChange(values.filter((v) => v !== code));
  };

  const displayLabels = selected.map((o) => o.label).join(', ');

  return (
    <div className="rounded-xl border bg-stone-50 p-4">
      <div className="text-xs font-semibold uppercase text-stone-500">
        {label}
        {editing && <span className="ml-1 font-normal normal-case text-stone-400">(สูงสุด {max} รายการ)</span>}
      </div>

      {editing ? (
        <>
          {selected.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selected.map((opt) => (
                <span
                  key={opt.value}
                  className="flex items-center gap-1.5 rounded-xl bg-[#6f4e37] px-3 py-1.5 text-sm font-medium text-white"
                >
                  {opt.label}
                  <button
                    type="button"
                    onClick={() => remove(opt.value)}
                    className="opacity-70 hover:opacity-100"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          {canAdd && (
            <select
              className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm text-stone-500"
              value=""
              onChange={(e) => add(e.target.value)}
              disabled={options === null}
            >
              <option value="">
                {options === null
                  ? 'Loading...'
                  : available.length === 0
                  ? 'ไม่มีรายการเพิ่มเติม'
                  : `+ เลือก ${label}...`}
              </option>
              {available.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          )}

          {!canAdd && (
            <p className="mt-1 text-xs text-stone-400">เลือกครบ {max} รายการแล้ว</p>
          )}
        </>
      ) : (
        <div className="mt-1 text-sm text-stone-900">{displayLabels || '-'}</div>
      )}
    </div>
  );
}

const TEMP_OPTIONS = [
  { value: 'HOT',     label: '🔥 HOT',     active: 'border-red-400 bg-red-500 text-white',       badge: 'bg-red-100 text-red-600' },
  { value: 'WARM',    label: '☀️ WARM',    active: 'border-orange-400 bg-orange-400 text-white',  badge: 'bg-orange-100 text-orange-600' },
  { value: 'COLD',    label: '🧊 COLD',    active: 'border-blue-400 bg-blue-500 text-white',      badge: 'bg-blue-100 text-blue-600' },
  { value: 'UNKNOWN', label: 'Unknown',    active: 'border-stone-300 bg-stone-100 text-stone-500', badge: 'bg-stone-100 text-stone-500' },
] as const;

function TemperatureField({
  value,
  editing,
  onChange,
}: {
  value: string;
  editing: boolean;
  onChange: (value: string) => void;
}) {
  const current = TEMP_OPTIONS.find((t) => t.value === value) ?? TEMP_OPTIONS[3];

  return (
    <div className="rounded-xl border bg-stone-50 p-4">
      <div className="text-xs font-semibold uppercase text-stone-500">
        Buying Temperature
        <span className="ml-1 font-normal normal-case text-stone-400">ความร้อน / โอกาสซื้อ</span>
      </div>

      {editing ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {TEMP_OPTIONS.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onChange(t.value)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                value === t.value ? t.active : 'border-stone-200 bg-white text-stone-400 hover:border-stone-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-2">
          <span className={`rounded-lg px-3 py-1 text-sm font-semibold ${current.badge}`}>
            {current.label}
          </span>
        </div>
      )}
    </div>
  );
}
