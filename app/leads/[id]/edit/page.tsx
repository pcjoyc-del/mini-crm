'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function EditLeadPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/leads/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setLead(data.data);
        setLoading(false);
      });
  }, [params.id]);

  async function handleSave() {
    await fetch(`/api/leads/${params.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    });

    router.push(`/leads/${params.id}`);
  }

  if (loading || !lead) {
    return <div className="p-6">Loading...</div>;
  }

  const isWon = lead.status === 'WON';

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* HEADER */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <a href={`/leads/${lead.id}`} className="underline text-[#6f4e37]">
            ← Back
          </a>

          <div className="mt-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Edit Lead</h1>

            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/leads/${lead.id}`)}
                className="rounded-xl border px-4 py-2"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="rounded-xl bg-[#6f4e37] text-white px-4 py-2"
              >
                Save
              </button>
            </div>
          </div>
        </section>

        {/* FORM */}
        <section className="rounded-2xl bg-white p-6 shadow-sm space-y-4">
          {/* Lead Name */}
          <Input
            label="Lead Name"
            value={lead.leadName || ''}
            onChange={(v) => setLead({ ...lead, leadName: v })}
          />

          {/* Phone */}
          <Input
            label="Phone"
            value={lead.phone || ''}
            onChange={(v) => setLead({ ...lead, phone: v })}
          />

          {/* STATUS (สำคัญ) */}
          <div>
            <label className="block mb-1 font-semibold">Status</label>
            <select
              value={lead.status}
              onChange={(e) =>
                setLead({ ...lead, status: e.target.value })
              }
              className="w-full border rounded p-2"
            >
              <option value="NEW_LEAD">NEW_LEAD</option>
              <option value="FOLLOW_UP">FOLLOW_UP</option>
              <option value="NEGOTIATING">NEGOTIATING</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>
          </div>

          {/* 🔥 CONDITIONAL FIELD */}
          {isWon && (
            <>
              <Input
                label="Customer Name"
                value={lead.customerName || ''}
                onChange={(v) =>
                  setLead({ ...lead, customerName: v })
                }
              />

              <Input
                label="Sales Order No."
                value={lead.salesOrderNo || ''}
                onChange={(v) =>
                  setLead({ ...lead, salesOrderNo: v })
                }
              />
            </>
          )}

          {/* Note */}
          <Input
            label="Note"
            value={lead.note || ''}
            onChange={(v) => setLead({ ...lead, note: v })}
          />
        </section>
      </div>
    </main>
  );
}

/* ---------- reusable ---------- */
function Input({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="block mb-1 font-semibold">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border rounded p-2"
      />
    </div>
  );
}