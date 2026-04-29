'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

type VisitForm = {
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

export default function AddVisitPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<VisitForm>({
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/stores')
      .then((r) => r.json())
      .then((json) =>
        setStoreOptions([
          { label: 'Select store', value: '' },
          ...(json.data || []).map((s: any) => ({ label: s.name, value: s.id })),
        ])
      );

    fetch('/api/admin/master-data?domain=channel&active=true')
      .then((r) => r.json())
      .then((json) =>
        setChannelOptions([
          { label: 'Select channel', value: '' },
          ...(json.data || []).map((i: any) => ({ label: i.label, value: i.code })),
        ])
      );

    fetch('/api/admin/sales')
      .then((r) => r.json())
      .then((json) =>
        setSalesOptions([
          { label: 'Select sales', value: '' },
          ...(json.data || []).map((s: any) => ({ label: s.displayName, value: s.id })),
        ])
      );
  }, []);

  const setField = (key: keyof VisitForm, value: string) => {
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
      const response = await fetch(`/api/leads/${id}/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(result?.error?.message || 'Failed to save visit');
      }

      router.push(`/leads/${id}`);
    } catch (err) {
      setError((err as Error).message || 'Unable to save visit');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <a href={`/leads/${id}`} className="font-semibold text-[#6f4e37] underline">
            ← Back to Lead Detail
          </a>

          <h1 className="mt-6 text-3xl font-bold text-stone-800">Add Visit</h1>
          <p className="mt-2 text-stone-600">
            Record another showroom visit for this existing lead.
          </p>
        </section>

        <form onSubmit={onSubmit} className="space-y-6">
          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-stone-700">Visit Info</h2>

            <div className="grid gap-4 md:grid-cols-2">
              <TextInput type="datetime-local" label="Visit Date & Time *" value={form.visitDatetime} onChange={(v) => setField('visitDatetime', v)} />
              <SelectInput label="Store *" value={form.storeId} onChange={(v) => setField('storeId', v)} options={storeOptions} />
              <SelectInput label="Sales *" value={form.salesId} onChange={(v) => setField('salesId', v)} options={salesOptions} />
              <SelectInput label="Channel *" value={form.source} onChange={(v) => setField('source', v)} options={channelOptions} />
              <TextInput label="Visit Purpose" value={form.visitPurpose} onChange={(v) => setField('visitPurpose', v)} placeholder="เช่น มาดูซ้ำ / ขอราคา / ตัดสินใจซื้อ" />
              <TextInput label="First Question" value={form.firstQuestion} onChange={(v) => setField('firstQuestion', v)} placeholder="คำถามแรกที่ลูกค้าถามใน visit นี้" />
            </div>
          </section>

          <section className="rounded-2xl bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-xl font-bold text-stone-700">Note</h2>

            <textarea
              className="min-h-32 w-full rounded-xl border px-4 py-3"
              placeholder="Visit note"
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
            <button type="button" onClick={() => router.push(`/leads/${id}`)} className="flex-1 rounded-xl border px-6 py-4 font-bold" disabled={saving}>
              Cancel
            </button>

            <button type="submit" className="flex-1 rounded-xl bg-[#6f4e37] px-6 py-4 font-bold text-white" disabled={saving}>
              {saving ? 'Saving...' : 'Save Visit'}
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
