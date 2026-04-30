'use client';

import { useEffect, useState } from 'react';

type SalesProfile = { id: string; employeeCode: string; displayName: string };
type User = {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'SUPERVISOR' | 'SALES';
  isActive: boolean;
  createdAt: string;
  salesProfile: SalesProfile | null;
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  SUPERVISOR: 'Supervisor',
  SALES: 'Sales',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPERVISOR: 'bg-blue-100 text-blue-700',
  SALES: 'bg-stone-100 text-stone-600',
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'SUPERVISOR' | 'SALES'>('SALES');
  const [employeeCode, setEmployeeCode] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [resetTargetId, setResetTargetId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState('');

  const load = async () => {
    const res = await fetch('/api/admin/users');
    const json = await res.json();
    setUsers(json.data || []);
  };

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!fullName || !email || !password) {
      setError('Full name, email, and password are required');
      return;
    }
    if (role === 'SALES' && !employeeCode) {
      setError('Employee code is required for Sales role');
      return;
    }
    setError('');
    setSaving(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fullName, email, password, role, employeeCode }),
    });
    setSaving(false);
    if (res.ok) {
      setFullName('');
      setEmail('');
      setPassword('');
      setRole('SALES');
      setEmployeeCode('');
      load();
    } else {
      const json = await res.json();
      setError(json.error?.message || 'Failed to create user');
    }
  };

  const toggleActive = async (user: User) => {
    await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !user.isActive }),
    });
    load();
  };

  const saveResetPassword = async (id: string) => {
    if (!resetPassword) return;
    await fetch(`/api/admin/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword: resetPassword }),
    });
    setResetTargetId(null);
    setResetPassword('');
  };

  return (
    <main className="min-h-screen bg-[#f5efe5] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <a href="/admin" className="font-semibold text-[#6f4e37] underline">
            ← Back to Admin
          </a>
          <h1 className="mt-4 text-2xl font-bold text-stone-800">Users</h1>
          <p className="mt-1 text-stone-500">Manage login accounts for all staff</p>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-stone-500">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Email</th>
                <th className="pb-2 pr-4">Role</th>
                <th className="pb-2 pr-4">Emp Code</th>
                <th className="pb-2 pr-4">Status</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <>
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-semibold">{u.fullName}</td>
                    <td className="py-3 pr-4 text-stone-500">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${ROLE_COLORS[u.role]}`}>
                        {ROLE_LABELS[u.role]}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-mono text-xs text-stone-500">
                      {u.salesProfile?.employeeCode || '-'}
                    </td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => toggleActive(u)}
                        className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                          u.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => {
                          setResetTargetId(resetTargetId === u.id ? null : u.id);
                          setResetPassword('');
                        }}
                        className="rounded-lg bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-200"
                      >
                        Reset Password
                      </button>
                    </td>
                  </tr>
                  {resetTargetId === u.id && (
                    <tr key={`${u.id}-reset`} className="border-b bg-amber-50">
                      <td colSpan={6} className="px-2 py-3">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-stone-500">New password for {u.fullName}:</span>
                          <input
                            type="text"
                            value={resetPassword}
                            onChange={(e) => setResetPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="rounded-lg border px-3 py-1.5 text-sm"
                            autoFocus
                          />
                          <button
                            onClick={() => saveResetPassword(u.id)}
                            disabled={!resetPassword}
                            className="rounded-lg bg-[#6f4e37] px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setResetTargetId(null); setResetPassword(''); }}
                            className="rounded-lg border px-4 py-1.5 text-xs font-semibold text-stone-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-stone-400">
                    No users yet — add one below
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="mt-6 border-t pt-5">
            <h3 className="mb-4 font-semibold text-stone-700">Add User</h3>
            {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

            <div className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Full Name"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  type="email"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Initial Password"
                  type="text"
                  className="rounded-xl border px-3 py-2 text-sm"
                />
                {role === 'SALES' && (
                  <input
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                    placeholder="Employee Code (e.g. EMP001)"
                    className="rounded-xl border px-3 py-2 font-mono text-sm uppercase"
                  />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <span className="text-sm font-semibold text-stone-600">Role</span>
                {(['SALES', 'SUPERVISOR', 'ADMIN'] as const).map((r) => (
                  <label key={r} className="flex cursor-pointer items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="role"
                      checked={role === r}
                      onChange={() => setRole(r)}
                      className="accent-[#6f4e37]"
                    />
                    {ROLE_LABELS[r]}
                  </label>
                ))}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={add}
                  disabled={saving}
                  className="rounded-xl bg-[#6f4e37] px-6 py-2 text-sm font-bold text-white disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Add User'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
