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

  const [channelMap, setChannelMap] = useState<Record<string, string>>({});

  // 🔃 SORT STATE
  const [sortKey, setSortKey] = useState('visitDatetime');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetch('/api/admin/master-data?domain=channel&active=true')
      .then((r) => r.json())
      .then((json) => {
        const map = (json.data || []).reduce((acc: Record<string, string>, item: any) => {
          acc[item.code] = item.label;
          return acc;
        }, {});
        setChannelMap(map);
      });
  }, []);

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
      <div className="bg-white rounded-2xl p-6 mb-6 shadow flex justify-between items-center">
        <div className="border rounded-xl px-5 py-3 bg-[#f5efe5]">
          <h1 className="text-2xl font-bold">Lead List</h1>
        </div>

        <div className="flex gap-2">
          <button onClick={handleLogout} className="border px-4 py-2 rounded text-sm font-bold">
            Logout
          </button>

          <button
            onClick={() => router.push('/admin')}
            className="border border-[#7b4f2f] text-[#7b4f2f] px-4 py-2 rounded text-sm font-bold"
          >
            Admin
          </button>

          <button
            onClick={() => router.push('/leads/new')}
            className="bg-[#7b4f2f] text-white px-4 py-2 rounded text-sm font-bold"
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
            <option key={c} value={c}>{channelMap[c] || c}</option>
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
        <table className="w-full text-sm">
          <thead className="border-b text-gray-500">
            <tr className="text-sm font-semibold">
              <th className="pb-2 text-left px-3">Lead</th>
              <th className="pb-2 text-left px-3">Store</th>
              <th className="pb-2 text-left px-3">Sales</th>
              <th className="pb-2 text-left px-3">Channel</th>
              <th className="pb-2 text-left px-3">Visits</th>
              <th className="pb-2 text-left px-3">Status</th>
              <th className="pb-2 text-left px-3">Temperature</th>
              <th className="pb-2" />
            </tr>
          </thead>

          <tbody>
            {filteredLeads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-3">{lead.leadName}</td>
                <td className="py-3 px-3">{lead.store?.name}</td>
                <td className="py-3 px-3">{lead.sales?.displayName}</td>
                <td className="py-3 px-3">{channelMap[lead.source] || lead.source}</td>
                <td className="py-3 px-3">{lead.visits?.length || 0}</td>
                <td className="py-3 px-3">{lead.status}</td>
                <td className="py-3 px-3">
                  {lead.status === 'WON'
                    ? <span className="rounded-lg px-2 py-0.5 text-xs font-semibold bg-green-100 text-green-700">{lead.customerName || '—'}</span>
                    : <TemperatureBadge value={lead.followUpTemperature} />
                  }
                </td>
                <td className="py-3 px-3 text-right">
                  <button
                    onClick={() => router.push(`/leads/${lead.id}`)}
                    className="rounded-lg bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-200"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}

const TEMP_BADGE: Record<string, { label: string; cls: string }> = {
  HOT:     { label: '🔥 HOT',  cls: 'bg-red-100 text-red-600' },
  WARM:    { label: '☀️ WARM', cls: 'bg-orange-100 text-orange-600' },
  COLD:    { label: '🧊 COLD', cls: 'bg-blue-100 text-blue-600' },
  UNKNOWN: { label: '-',       cls: 'text-stone-400' },
};

function TemperatureBadge({ value }: { value?: string }) {
  const t = TEMP_BADGE[value ?? 'UNKNOWN'] ?? TEMP_BADGE.UNKNOWN;
  return (
    <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${t.cls}`}>
      {t.label}
    </span>
  );
}