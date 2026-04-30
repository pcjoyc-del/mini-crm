'use client';

import { useEffect, useState } from 'react';

const DOMAINS = [
  { key: 'channel', label: 'Channel' },
  { key: 'interested_model', label: 'Interested Model' },
  { key: 'category', label: 'Category' },
  { key: 'material', label: 'Material' },
  { key: 'price_range', label: 'Price Range' },
  { key: 'usage_timing', label: 'Usage Timing' },
  { key: 'residence_type', label: 'Residence Type' },
  { key: 'customer_group', label: 'Customer Group' },
  { key: 'age_range', label: 'Age Range' },
  { key: 'customer_type_flag', label: 'Customer Type' },
  { key: 'interested_product_category', label: 'Product Category' },
];

type MasterItem = {
  id: string;
  domain: string;
  code: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
};

export default function MasterDataPage() {
  const [activeDomain, setActiveDomain] = useState(DOMAINS[0].key);
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editSort, setEditSort] = useState('');

  const load = async (domain: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/master-data?domain=${domain}`);
    const json = await res.json();
    setItems(json.data || []);
    setLoading(false);
  };

  useEffect(() => {
    load(activeDomain);
  }, [activeDomain]);

  const addItem = async () => {
    if (!newCode || !newLabel) {
      setError('Code and Label are required');
      return;
    }
    setError('');
    const res = await fetch('/api/admin/master-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain: activeDomain,
        code: newCode.trim().toUpperCase(),
        label: newLabel.trim(),
        sortOrder: items.length + 1,
      }),
    });
    if (res.ok) {
      setNewCode('');
      setNewLabel('');
      load(activeDomain);
    } else {
      const json = await res.json();
      setError(json.error?.message || 'Failed to add item');
    }
  };

  const startEdit = (item: MasterItem) => {
    setEditingId(item.id);
    setEditLabel(item.label);
    setEditSort(String(item.sortOrder));
  };

  const saveEdit = async (id: string) => {
    await fetch(`/api/admin/master-data/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: editLabel.trim(), sortOrder: parseInt(editSort) || 0 }),
    });
    setEditingId(null);
    load(activeDomain);
  };

  const toggleActive = async (item: MasterItem) => {
    await fetch(`/api/admin/master-data/${item.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !item.isActive }),
    });
    load(activeDomain);
  };

  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    const res = await fetch(`/api/admin/master-data/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error?.message || 'Cannot delete item');
      return;
    }
    load(activeDomain);
  };

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <a href="/admin" className="font-semibold text-[#6f4e37] underline">
            ← Back to Admin
          </a>
          <h1 className="mt-4 text-2xl font-bold text-stone-800">Master Data</h1>
          <p className="mt-1 text-stone-500">Manage dropdown options for lead forms</p>
        </section>

        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <button
              key={d.key}
              onClick={() => setActiveDomain(d.key)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                activeDomain === d.key
                  ? 'bg-[#6f4e37] text-white'
                  : 'border border-[#6f4e37] bg-white text-[#6f4e37]'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-stone-700">
            {DOMAINS.find((d) => d.key === activeDomain)?.label}
          </h2>

          {loading ? (
            <p className="text-stone-400">Loading...</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs uppercase text-stone-500">
                  <th className="pb-2 pr-4">Code</th>
                  <th className="pb-2 pr-4">Label</th>
                  <th className="pb-2 pr-4">Sort</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((item) =>
                  editingId === item.id ? (
                    <tr key={item.id} className="border-b bg-amber-50 last:border-0">
                      <td className="py-2 pr-4 font-mono text-xs text-stone-500">{item.code}</td>
                      <td className="py-2 pr-4">
                        <input
                          value={editLabel}
                          onChange={(e) => setEditLabel(e.target.value)}
                          className="w-full rounded-lg border px-2 py-1 text-sm"
                          autoFocus
                        />
                      </td>
                      <td className="py-2 pr-4">
                        <input
                          value={editSort}
                          onChange={(e) => setEditSort(e.target.value)}
                          type="number"
                          className="w-16 rounded-lg border px-2 py-1 text-sm"
                        />
                      </td>
                      <td className="py-2 pr-4" />
                      <td className="py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveEdit(item.id)}
                            className="rounded-lg bg-[#6f4e37] px-3 py-1 text-xs font-semibold text-white"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="rounded-lg border px-3 py-1 text-xs font-semibold text-stone-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={item.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs text-stone-600">{item.code}</td>
                      <td className="py-3 pr-4">{item.label}</td>
                      <td className="py-3 pr-4 text-stone-500">{item.sortOrder}</td>
                      <td className="py-3 pr-4">
                        <button
                          onClick={() => toggleActive(item)}
                          className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                            item.isActive
                              ? 'bg-green-100 text-green-700'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(item)}
                            className="rounded-lg bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteItem(item.id)}
                            className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-stone-400">
                      No items yet — add one below
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          <div className="mt-6 border-t pt-5">
            <h3 className="mb-3 font-semibold text-stone-700">Add Item</h3>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
                placeholder="CODE"
                className="w-36 rounded-xl border px-3 py-2 font-mono text-sm uppercase"
              />
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Display Label"
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
              />
              <button
                onClick={addItem}
                className="rounded-xl bg-[#6f4e37] px-6 py-2 text-sm font-bold text-white"
              >
                Add
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
