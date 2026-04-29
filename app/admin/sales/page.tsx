'use client';

import { useEffect, useState } from 'react';

type Store = { id: string; name: string };
type SalesUser = { id: string; employeeCode: string; displayName: string; isActive: boolean; store: Store | null };

export default function SalesPage() {
  const [sales, setSales] = useState<SalesUser[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [empCode, setEmpCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [storeId, setStoreId] = useState('');
  const [error, setError] = useState('');

  const loadSales = async () => {
    const res = await fetch('/api/admin/sales');
    const json = await res.json();
    setSales(json.data || []);
  };

  const loadStores = async () => {
    const res = await fetch('/api/admin/stores');
    const json = await res.json();
    setStores(json.data || []);
  };

  useEffect(() => {
    loadSales();
    loadStores();
  }, []);

  const add = async () => {
    if (!empCode || !displayName) {
      setError('Employee Code and Display Name are required');
      return;
    }
    setError('');
    const res = await fetch('/api/admin/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeCode: empCode.trim().toUpperCase(),
        displayName: displayName.trim(),
        storeId: storeId || null,
      }),
    });
    if (res.ok) {
      setEmpCode('');
      setDisplayName('');
      setStoreId('');
      loadSales();
    } else {
      const json = await res.json();
      setError(json.error?.message || 'Failed to add sales user');
    }
  };

  const toggleActive = async (s: SalesUser) => {
    await fetch(`/api/admin/sales/${s.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !s.isActive }),
    });
    loadSales();
  };

  const deleteSales = async (id: string) => {
    if (!confirm('Delete this sales user? This will fail if they have existing leads.')) return;
    const res = await fetch(`/api/admin/sales/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const json = await res.json();
      alert(json.error?.message || 'Cannot delete sales user');
      return;
    }
    loadSales();
  };

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <a href="/admin" className="font-semibold text-[#6f4e37] underline">
            ← Back to Admin
          </a>
          <h1 className="mt-4 text-2xl font-bold text-stone-800">Sales Users</h1>
          <p className="mt-1 text-stone-500">Manage sales staff profiles and store assignments</p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-stone-500">
                <th className="pb-2 pr-4">Employee Code</th>
                <th className="pb-2 pr-4">Display Name</th>
                <th className="pb-2 pr-4">Store</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {sales.map((s) => (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="py-3 pr-4 font-mono text-xs text-stone-600">{s.employeeCode}</td>
                  <td className="py-3 pr-4 font-semibold">{s.displayName}</td>
                  <td className="py-3 pr-4 text-stone-500">{s.store?.name || '-'}</td>
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
                      onClick={() => deleteSales(s.id)}
                      className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {sales.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-stone-400">
                    No sales users yet — add one below
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 border-t pt-5">
            <h3 className="mb-3 font-semibold text-stone-700">Add Sales User</h3>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <input
                value={empCode}
                onChange={(e) => setEmpCode(e.target.value)}
                placeholder="EMP CODE"
                className="w-36 rounded-xl border px-3 py-2 font-mono text-sm uppercase"
              />
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Display Name"
                className="flex-1 rounded-xl border px-3 py-2 text-sm"
              />
              <select
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-48 rounded-xl border px-3 py-2 text-sm"
              >
                <option value="">Select store</option>
                {stores.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
              </select>
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
