'use client';

import { useEffect, useRef, useState } from 'react';
import * as XLSX from 'xlsx';

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

type MasterItem = { id: string; domain: string; code: string; label: string; sortOrder: number; isActive: boolean };
type PreviewRow = { code: string; label: string; isDuplicate: boolean };

export default function MasterDataPage() {
  const [activeDomain, setActiveDomain] = useState(DOMAINS[0].key);
  const [items, setItems] = useState<MasterItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Add form
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [error, setError] = useState('');

  // Inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editSort, setEditSort] = useState('');

  // Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showImport, setShowImport] = useState(false);
  const [importStep, setImportStep] = useState<'upload' | 'mapping' | 'preview'>('upload');
  const [excelColumns, setExcelColumns] = useState<string[]>([]);
  const [excelRows, setExcelRows] = useState<Record<string, string>[]>([]);
  const [codeCol, setCodeCol] = useState('');
  const [labelCol, setLabelCol] = useState('');
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: string[] } | null>(null);

  const load = async (domain: string) => {
    setLoading(true);
    const res = await fetch(`/api/admin/master-data?domain=${domain}`);
    const json = await res.json();
    setItems(json.data || []);
    setLoading(false);
  };

  useEffect(() => { load(activeDomain); }, [activeDomain]);

  const resetImport = () => {
    setImportStep('upload');
    setExcelColumns([]);
    setExcelRows([]);
    setCodeCol('');
    setLabelCol('');
    setPreviewRows([]);
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeImport = () => { setShowImport(false); resetImport(); };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const wb = XLSX.read(data, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (rows.length === 0) { alert('ไฟล์ว่างหรือไม่มีข้อมูล'); return; }
      const cols = Object.keys(rows[0]);
      setExcelColumns(cols);
      setExcelRows(rows);
      const defaultCode = cols.find((c) => /code|id|รหัส/i.test(c)) ?? cols[0];
      const defaultLabel = cols.find((c) => /name|label|ชื่อ|model|display/i.test(c) && c !== defaultCode)
        ?? cols.find((c) => c !== defaultCode)
        ?? cols[0];
      setCodeCol(defaultCode);
      setLabelCol(defaultLabel);
      setImportStep('mapping');
    };
    reader.readAsBinaryString(file);
  };

  const buildPreview = () => {
    const existingCodes = new Set(items.map((i) => i.code.toUpperCase()));
    const seen = new Set<string>();
    const rows: PreviewRow[] = [];
    for (const row of excelRows) {
      const code = String(row[codeCol] ?? '').trim().toUpperCase();
      const label = String(row[labelCol] ?? '').trim();
      if (!code || !label || seen.has(code)) continue;
      seen.add(code);
      rows.push({ code, label, isDuplicate: existingCodes.has(code) });
    }
    setPreviewRows(rows);
    setImportStep('preview');
  };

  const runImport = async () => {
    setImporting(true);
    const toImport = previewRows.filter((r) => !r.isDuplicate);
    const res = await fetch('/api/admin/master-data/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: activeDomain, items: toImport }),
    });
    const json = await res.json();
    setImporting(false);
    if (res.ok) {
      setImportResult(json.data);
      load(activeDomain);
    } else {
      alert(json.error?.message || 'Import failed');
    }
  };

  const addItem = async () => {
    if (!newCode || !newLabel) { setError('Code and Label are required'); return; }
    setError('');
    const res = await fetch('/api/admin/master-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domain: activeDomain, code: newCode.trim().toUpperCase(), label: newLabel.trim(), sortOrder: items.length + 1 }),
    });
    if (res.ok) { setNewCode(''); setNewLabel(''); load(activeDomain); }
    else { const json = await res.json(); setError(json.error?.message || 'Failed to add item'); }
  };

  const startEdit = (item: MasterItem) => { setEditingId(item.id); setEditLabel(item.label); setEditSort(String(item.sortOrder)); };
  const saveEdit = async (id: string) => {
    await fetch(`/api/admin/master-data/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label: editLabel.trim(), sortOrder: parseInt(editSort) || 0 }) });
    setEditingId(null);
    load(activeDomain);
  };
  const toggleActive = async (item: MasterItem) => {
    await fetch(`/api/admin/master-data/${item.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !item.isActive }) });
    load(activeDomain);
  };
  const deleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    const res = await fetch(`/api/admin/master-data/${id}`, { method: 'DELETE' });
    if (!res.ok) { const json = await res.json(); alert(json.error?.message || 'Cannot delete item'); return; }
    load(activeDomain);
  };

  const newCount = previewRows.filter((r) => !r.isDuplicate).length;
  const dupCount = previewRows.filter((r) => r.isDuplicate).length;

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <a href="/admin" className="font-semibold text-[#6f4e37] underline">← Back to Admin</a>
          <h1 className="mt-4 text-2xl font-bold text-stone-800">Master Data</h1>
          <p className="mt-1 text-stone-500">Manage dropdown options for lead forms</p>
        </section>

        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => (
            <button key={d.key} onClick={() => { setActiveDomain(d.key); closeImport(); }}
              className={`rounded-xl px-4 py-2 text-sm font-semibold ${activeDomain === d.key ? 'bg-[#6f4e37] text-white' : 'border border-[#6f4e37] bg-white text-[#6f4e37]'}`}>
              {d.label}
            </button>
          ))}
        </div>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-stone-700">
            {DOMAINS.find((d) => d.key === activeDomain)?.label}
          </h2>

          {loading ? <p className="text-stone-400">Loading...</p> : (
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
                {items.map((item) => editingId === item.id ? (
                  <tr key={item.id} className="border-b bg-amber-50 last:border-0">
                    <td className="py-2 pr-4 font-mono text-xs text-stone-500">{item.code}</td>
                    <td className="py-2 pr-4"><input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} className="w-full rounded-lg border px-2 py-1 text-sm" autoFocus /></td>
                    <td className="py-2 pr-4"><input value={editSort} onChange={(e) => setEditSort(e.target.value)} type="number" className="w-16 rounded-lg border px-2 py-1 text-sm" /></td>
                    <td className="py-2 pr-4" />
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(item.id)} className="rounded-lg bg-[#6f4e37] px-3 py-1 text-xs font-semibold text-white">Save</button>
                        <button onClick={() => setEditingId(null)} className="rounded-lg border px-3 py-1 text-xs font-semibold text-stone-600">Cancel</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-mono text-xs text-stone-600">{item.code}</td>
                    <td className="py-3 pr-4">{item.label}</td>
                    <td className="py-3 pr-4 text-stone-500">{item.sortOrder}</td>
                    <td className="py-3 pr-4">
                      <button onClick={() => toggleActive(item)} className={`rounded-lg px-2 py-1 text-xs font-semibold ${item.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(item)} className="rounded-lg bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-200">Edit</button>
                        <button onClick={() => deleteItem(item.id)} className="rounded-lg bg-red-50 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-100">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="py-6 text-center text-stone-400">No items yet — add one below</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* Add Item */}
          <div className="mt-6 border-t pt-5">
            <h3 className="mb-3 font-semibold text-stone-700">Add Item</h3>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
            <div className="flex flex-wrap gap-3">
              <input value={newCode} onChange={(e) => setNewCode(e.target.value)} placeholder="CODE" className="w-36 rounded-xl border px-3 py-2 font-mono text-sm uppercase" />
              <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Display Label" className="flex-1 rounded-xl border px-3 py-2 text-sm" />
              <button onClick={addItem} className="rounded-xl bg-[#6f4e37] px-6 py-2 text-sm font-bold text-white">Add</button>
            </div>
          </div>

          {/* Import from Excel */}
          <div className="mt-4 border-t pt-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-stone-700">Import from Excel</h3>
              <button
                onClick={() => { setShowImport(!showImport); if (showImport) resetImport(); }}
                className="rounded-xl border border-[#6f4e37] px-4 py-1.5 text-sm font-semibold text-[#6f4e37] hover:bg-[#6f4e37] hover:text-white"
              >
                {showImport ? 'Cancel Import' : 'Import Excel'}
              </button>
            </div>

            {showImport && (
              <div className="mt-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 p-5">

                {/* Step 1: Upload */}
                {importStep === 'upload' && (
                  <div className="text-center">
                    <p className="mb-3 text-sm text-stone-500">รองรับไฟล์ .xlsx, .xls, .csv</p>
                    <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={onFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current?.click()} className="rounded-xl bg-[#6f4e37] px-6 py-2.5 text-sm font-bold text-white">
                      เลือกไฟล์ Excel
                    </button>
                  </div>
                )}

                {/* Step 2: Column Mapping */}
                {importStep === 'mapping' && (
                  <div className="space-y-4">
                    <p className="text-sm font-semibold text-stone-700">
                      พบ {excelRows.length} แถว — เลือก column ที่ต้องการ map
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase text-stone-500">Code (รหัสในระบบ)</label>
                        <select value={codeCol} onChange={(e) => setCodeCol(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm">
                          {excelColumns.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {excelRows[0] && <p className="mt-1 text-xs text-stone-400">ตัวอย่าง: "{String(excelRows[0][codeCol] ?? '')}"</p>}
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase text-stone-500">Model (ชื่อที่แสดง)</label>
                        <select value={labelCol} onChange={(e) => setLabelCol(e.target.value)} className="w-full rounded-xl border px-3 py-2 text-sm">
                          {excelColumns.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {excelRows[0] && <p className="mt-1 text-xs text-stone-400">ตัวอย่าง: "{String(excelRows[0][labelCol] ?? '')}"</p>}
                        {codeCol === labelCol && (
                          <p className="mt-1 text-xs text-amber-600">⚠ ใช้ column เดียวกับ Code — ถ้าไฟล์มีคอลัมน์ชื่อ Model ให้เลือกแทน</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={buildPreview} className="rounded-xl bg-[#6f4e37] px-6 py-2 text-sm font-bold text-white">ดู Preview</button>
                      <button onClick={resetImport} className="rounded-xl border px-4 py-2 text-sm font-semibold text-stone-600">เปลี่ยนไฟล์</button>
                    </div>
                  </div>
                )}

                {/* Step 3: Preview */}
                {importStep === 'preview' && !importResult && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <span className="rounded-lg bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        ✓ {newCount} รายการใหม่
                      </span>
                      {dupCount > 0 && (
                        <span className="rounded-lg bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
                          ⚠ {dupCount} ซ้ำ (จะข้ามไป)
                        </span>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto rounded-xl border">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-stone-100">
                          <tr className="text-left text-xs uppercase text-stone-500">
                            <th className="px-3 py-2">Code</th>
                            <th className="px-3 py-2">Label</th>
                            <th className="px-3 py-2">สถานะ</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewRows.map((row) => (
                            <tr key={row.code} className={`border-t ${row.isDuplicate ? 'bg-amber-50' : ''}`}>
                              <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                              <td className="px-3 py-2">{row.label}</td>
                              <td className="px-3 py-2">
                                {row.isDuplicate
                                  ? <span className="text-xs text-amber-600">ซ้ำ — ข้ามไป</span>
                                  : <span className="text-xs text-green-600">ใหม่</span>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={runImport} disabled={importing || newCount === 0} className="rounded-xl bg-[#6f4e37] px-6 py-2 text-sm font-bold text-white disabled:opacity-40">
                        {importing ? 'กำลัง Import...' : `Import ${newCount} รายการ`}
                      </button>
                      <button onClick={() => setImportStep('mapping')} className="rounded-xl border px-4 py-2 text-sm font-semibold text-stone-600">แก้ Mapping</button>
                    </div>
                  </div>
                )}

                {/* Result */}
                {importResult && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-lg bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                        ✓ Import สำเร็จ {importResult.imported} รายการ
                      </span>
                      {importResult.skipped.length > 0 && (
                        <span className="rounded-lg bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-500">
                          ข้าม {importResult.skipped.length} รายการ (ซ้ำ)
                        </span>
                      )}
                    </div>
                    <button onClick={closeImport} className="rounded-xl bg-[#6f4e37] px-6 py-2 text-sm font-bold text-white">
                      เสร็จสิ้น
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
