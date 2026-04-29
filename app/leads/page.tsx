'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LeadListPage() {
  const router = useRouter();

  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔍 FILTER STATE
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [channel, setChannel] = useState('');
  const [sales, setSales] = useState('');

  // 🔃 SORT STATE
  const [sortKey, setSortKey] = useState('visitDatetime');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => {
        if (res.status === 401) {
          window.location.href = '/login';
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.data) setLeads(data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  // 🎯 FILTER + SORT
  const filteredLeads = useMemo(() => {
    let result = [...leads];

    // FILTER
    if (search) {
      result = result.filter((l) =>
        (l.leadName || '').toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status) {
      result = result.filter((l) => l.status === status);
    }

    if (channel) {
      result = result.filter((l) => l.source === channel);
    }

    if (sales) {
      result = result.filter((l) => l.sales?.displayName === sales);
    }

    // SORT
    result.sort((a, b) => {
      const aVal = a[sortKey] || '';
      const bVal = b[sortKey] || '';

      if (sortDir === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return result;
  }, [leads, search, status, channel, sales, sortKey, sortDir]);

  const uniqueSales = [...new Set(leads.map((l) => l.sales?.displayName).filter(Boolean))];
  const uniqueChannel = [...new Set(leads.map((l) => l.source).filter(Boolean))];

  if (loading) return <main className="p-6">Loading...</main>;

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6 text-sm">
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-6 mb-6 shadow flex justify-between">
        <div>
          <h1 className="text-lg font-semibold">Lead List</h1>
        </div>

        <div className="flex gap-2">
          <button onClick={handleLogout} className="border px-4 py-2 rounded text-xs">
            Logout
          </button>

          <button
            onClick={() => router.push('/leads/new')}
            className="bg-[#7b4f2f] text-white px-4 py-2 rounded text-xs"
          >
            New Lead
          </button>
        </div>
      </div>

      {/* 🔍 FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl shadow mb-4 flex gap-2 flex-wrap">
        <input
          placeholder="Search Lead Name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded text-xs"
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-2 rounded text-xs"
        >
          <option value="">All Status</option>
          <option value="NEW_LEAD">NEW_LEAD</option>
          <option value="FOLLOW_UP">FOLLOW_UP</option>
          <option value="NEGOTIATING">NEGOTIATING</option>
          <option value="WON">WON</option>
          <option value="LOST">LOST</option>
        </select>

        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="border px-3 py-2 rounded text-xs"
        >
          <option value="">All Channel</option>
          {uniqueChannel.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select
          value={sales}
          onChange={(e) => setSales(e.target.value)}
          className="border px-3 py-2 rounded text-xs"
        >
          <option value="">All Sales</option>
          {uniqueSales.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>

        <button
          onClick={() => {
            setSearch('');
            setStatus('');
            setChannel('');
            setSales('');
          }}
          className="px-3 py-2 border rounded text-xs"
        >
          Reset
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl p-4 shadow">
        <table className="w-full text-xs">
          <thead className="border-b text-gray-500">
            <tr>
              <th>Lead</th>
              <th>Store</th>
              <th>Sales</th>
              <th>Channel</th>
              <th>Visits</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {filteredLeads.map((lead) => (
              <tr
                key={lead.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => router.push(`/leads/${lead.id}`)}
              >
                <td>{lead.leadName}</td>
                <td>{lead.store?.name}</td>
                <td>{lead.sales?.displayName}</td>
                <td>{lead.source}</td>
                <td>{lead.visits?.length || 0}</td>
                <td>{lead.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}