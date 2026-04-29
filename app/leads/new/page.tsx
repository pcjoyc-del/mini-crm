'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type NewLeadForm = {
  leadName: string;
  phone: string;
  lineId: string;
  residentLocation: string;

  interestedModelCode: string;
  categoryCode: string;
  materialCode: string;
  sizeText: string;
  priceRangeCode: string;
  usageTimingCode: string;
  onlySofa: boolean | null;

  visitDatetime: string;
  storeId: string;
  salesId: string;
  source: string;
  visitPurpose: string;
  firstQuestion: string;
  note: string;
};

type Option = { label: string; value: string };


function toLocalDateTimeValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offsetMs);
  return local.toISOString().slice(0, 16);
}

async function fetchOptions(url: string, mapFn: (item: any) => Option): Promise<Option[]> {
  try {
    const res = await fetch(url);
    const json = await res.json();
    return json.data?.map(mapFn) ?? [];
  } catch {
    return [];
  }
}

export default function NewLeadPage() {
  const router = useRouter();

  const [form, setForm] = useState<NewLeadForm>({
    leadName: '',
    phone: '',
    lineId: '',
    residentLocation: '',
    interestedModelCode: '',
    categoryCode: '',
    materialCode: '',
    sizeText: '',
    priceRangeCode: '',
    usageTimingCode: '',
    onlySofa: null,
    visitDatetime: toLocalDateTimeValue(new Date()),
    storeId: '',
    salesId: '',
    source: '',
    visitPurpose: '',
    firstQuestion: '',
    note: '',
  });

  const [storeOptions, setStoreOptions] = useState<Option[]>([{ label: 'Select store', value: '' }]);
  const [salesOptions, setSalesOptions] = useState<Option[]>([{ label: 'Select sales', value: '' }]);
  const [channelOptions, setChannelOptions] = useState<Option[]>([{ label: 'Select channel', value: '' }]);
  const [interestedModelOptions, setInterestedModelOptions] = useState<Option[]>([{ label: 'Select model', value: '' }]);
  const [categoryOptions, setCategoryOptions] = useState<Option[]>([{ label: 'Select category', value: '' }]);
  const [materialOptions, setMaterialOptions] = useState<Option[]>([{ label: 'Select material', value: '' }]);
  const [priceRangeOptions, setPriceRangeOptions] = useState<Option[]>([{ label: 'Select price range', value: '' }]);
  const [usageTimingOptions, setUsageTimingOptions] = useState<Option[]>([{ label: 'Select usage timing', value: '' }]);

  useEffect(() => {
    fetchOptions('/api/admin/stores', (s) => ({ label: s.name, value: s.id }))
      .then((opts) => setStoreOptions([{ label: 'Select store', value: '' }, ...opts]));

    fetchOptions('/api/admin/sales', (s) => ({ label: s.displayName, value: s.id }))
      .then((opts) => setSalesOptions([{ label: 'Select sales', value: '' }, ...opts]));

    fetchOptions('/api/admin/master-data?domain=channel&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setChannelOptions([{ label: 'Select channel', value: '' }, ...opts]));

    fetchOptions('/api/admin/master-data?domain=interested_model&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setInterestedModelOptions([{ label: 'Select model', value: '' }, ...opts]));

    fetchOptions('/api/admin/master-data?domain=category&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setCategoryOptions([{ label: 'Select category', value: '' }, ...opts]));

    fetchOptions('/api/admin/master-data?domain=material&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setMaterialOptions([{ label: 'Select material', value: '' }, ...opts]));

    fetchOptions('/api/admin/master-data?domain=price_range&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setPriceRangeOptions([{ label: 'Select price range', value: '' }, ...opts]));

    fetchOptions('/api/admin/master-data?domain=usage_timing&active=true', (i) => ({ label: i.label, value: i.code }))
      .then((opts) => setUsageTimingOptions([{ label: 'Select usage timing', value: '' }, ...opts]));
  }, []);

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const setField = (key: keyof NewLeadForm, value: string | boolean | null) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.visitDatetime || !form.storeId || !form.salesId || !form.source) {
      setError('Please fill Visit Date, Store, Sales, and Source.');
      return;
    }

    setSaving(true);

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error?.message || 'Failed to save lead');
      }

      const leadId = result?.data?.id;
      if (!leadId) throw new Error('Lead saved but response id was missing');

      router.push(`/leads/${leadId}`);
    } catch (err) {
      setError((err as Error).message || 'Unable to save lead');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <a href="/leads" className="font-semibold text-[#6f4e37] underline">
            ← Back to Lead List
          </a>

          <h1 className="mt-6 text-3xl font-bold text-stone-800">New Lead</h1>
          <p className="mt-2 text-stone-600">
            Record showroom traffic first. Add customer conversion details after the lead becomes WON.
          </p>
        </section>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-stone-700">Identity</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput label="Lead Name / Reference" value={form.leadName} onChange={(v) => setField('leadName', v)} placeholder="เช่น คุณน้ำฝน - สนใจ Jasmine" />
              <TextInput label="Phone" value={form.phone} onChange={(v) => setField('phone', v)} placeholder="เช่น 089-999-9999" />
              <TextInput label="LINE ID" value={form.lineId} onChange={(v) => setField('lineId', v)} />
              <TextInput label="Resident Location" value={form.residentLocation} onChange={(v) => setField('residentLocation', v)} placeholder="เช่น บางนา / รามอินทรา / สมุทรปราการ" />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-stone-700">Visit Info</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput type="datetime-local" label="Visit Date & Time *" value={form.visitDatetime} onChange={(v) => setField('visitDatetime', v)} />
              <SelectInput label="Store *" value={form.storeId} onChange={(v) => setField('storeId', v)} options={storeOptions} />
              <SelectInput label="Sales *" value={form.salesId} onChange={(v) => setField('salesId', v)} options={salesOptions} />
              <SelectInput label="Channel *" value={form.source} onChange={(v) => setField('source', v)} options={channelOptions} />
              <TextInput label="Visit Purpose" value={form.visitPurpose} onChange={(v) => setField('visitPurpose', v)} placeholder="เช่น เดินดูสินค้า / ขอราคา / มาดูซ้ำ / ปิดการขาย" />
              <TextInput label="First Question" value={form.firstQuestion} onChange={(v) => setField('firstQuestion', v)} placeholder="คำถามแรกที่ลูกค้าถาม" />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-stone-700">Qualification</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <SelectInput label="Interested Model" value={form.interestedModelCode} onChange={(v) => setField('interestedModelCode', v)} options={interestedModelOptions} />
              <SelectInput label="Category" value={form.categoryCode} onChange={(v) => setField('categoryCode', v)} options={categoryOptions} />
              <SelectInput label="Material" value={form.materialCode} onChange={(v) => setField('materialCode', v)} options={materialOptions} />
              <TextInput label="Size" value={form.sizeText} onChange={(v) => setField('sizeText', v)} placeholder="เช่น 280 cm / 3 seats / L-shape 300x180" />
              <SelectInput label="Price Range" value={form.priceRangeCode} onChange={(v) => setField('priceRangeCode', v)} options={priceRangeOptions} />
              <SelectInput label="Usage Timing" value={form.usageTimingCode} onChange={(v) => setField('usageTimingCode', v)} options={usageTimingOptions} />

              <div>
                <label className="font-semibold">Only Sofa?</label>
                <div className="mt-3 flex gap-3">
                  <button type="button" onClick={() => setField('onlySofa', true)} className={`rounded-xl border px-4 py-3 ${form.onlySofa === true ? 'bg-[#6f4e37] text-white' : 'bg-white'}`}>
                    Yes
                  </button>
                  <button type="button" onClick={() => setField('onlySofa', false)} className={`rounded-xl border px-4 py-3 ${form.onlySofa === false ? 'bg-[#6f4e37] text-white' : 'bg-white'}`}>
                    No
                  </button>
                  <button type="button" onClick={() => setField('onlySofa', null)} className={`rounded-xl border px-4 py-3 ${form.onlySofa === null ? 'bg-stone-100' : 'bg-white'}`}>
                    Unknown
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-stone-700">Note</h2>

            <textarea
              className="min-h-32 w-full rounded-xl border px-4 py-3"
              placeholder="Any context to help follow-up later"
              value={form.note}
              onChange={(e) => setField('note', e.target.value)}
            />
          </section>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex gap-4">
            <button type="button" onClick={() => router.push('/leads')} className="flex-1 rounded-xl border px-6 py-4 font-bold" disabled={saving}>
              Cancel
            </button>

            <button type="submit" className="flex-1 rounded-xl bg-[#6f4e37] px-6 py-4 font-bold text-white" disabled={saving}>
              {saving ? 'Saving...' : 'Save Lead'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label className="font-semibold">{label}</label>
      <input
        type={type}
        className="mt-2 w-full rounded-xl border px-4 py-3"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}) {
  return (
    <div>
      <label className="font-semibold">{label}</label>
      <select
        className="mt-2 w-full rounded-xl border px-4 py-3"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.label + option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
