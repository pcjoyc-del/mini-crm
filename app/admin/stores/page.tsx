'use client';

import { useEffect, useState } from 'react';

type Store = { id: string; code: string; name: string; region: string | null; isActive: boolean };

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const res = await fetch('/api/admin/stores');
    const json = await res.json();
    setStores(json.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!code || !name) {
      setError('Code and Name are required');
      return;
    }
    setError('');
    const res = await fetch('/api/admin/stores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: code.trim().toUpperCase(),
        name: name.trim(),
        region: region.trim() || null,
      }),
    });
    if (res.ok) {
      setCode('');
      setName('');
      setRegion('');
      load();
    } else {
      const json = await res.json();
      setError(json.error?.message || 'Failed to add store');
    }
  };

  const toggleActive = async (store: Store) => {
    await fetch(`/api/admin/stores/${store.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !store.isActive }),
    });
    load();
  };

  const deleteStore = async (id: string) => {
    if (!confirm('Delete this store? This will fail if the store has existing leads.')) return;
    const res = await fetch(`/api/admin/stores/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error?.message || 'Cannot delete store');
      return;
    }
    load();
  };

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <a href="/admin" className="font-semibold text-[#6f4e37] underline">
            ← Back to Admin
          </a>
          <h1 className="mt-4 text-2xl font-bold text-stone-800">Stores</h1>
          <p className="mt-1 text-stone-500">Manage showroom locations</p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-stone-500">
                <th className="pb-2 pr-4">Code</th>
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Region</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs text-stone-600">{s.code}</td>
                  <td className="py-3 pr-4 font-semibold">{s.name}</td>
                  <td className="py-3 pr-4 text-stone-500">{s.region || '-'}</td>
                  <td className="py-3 pr-4">
                    <button
                      onClick={() => toggleActive(s)}
                      className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                        s.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => deleteStore(s.id)}
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {stores.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-stone-400">
                    No stores yet — add one below
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 border-t pt-5">
            <h3 className="mb-3 font-semibold text-stone-700">Add Store</h3>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Store Code"
                className="w-44 rounded-xl border px-3 py-2 font-mono text-sm uppercase"
              />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Store Name"
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
              />
              <input
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                placeholder="Region"
                className="w-36 rounded-xl border px-3 py-2 text-sm"
              />
              <button
                onClick={add}
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
