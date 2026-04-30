export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#f5efe5] p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <a href="/leads" className="font-semibold text-[#6f4e37] underline">
            ← Back to Leads
          </a>
          <h1 className="mt-4 text-2xl font-bold text-stone-800">Admin Panel</h1>
          <p className="mt-1 text-stone-500">Manage system configuration. ADMIN access only.</p>
        </section>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <a
            href="/admin/master-data"
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="text-2xl">📋</div>
            <h2 className="mt-3 text-lg font-bold text-stone-800">Master Data</h2>
            <p className="mt-1 text-sm text-stone-500">
              Dropdown options: interested model, price range, category, material, and more
            </p>
          </a>

          <a
            href="/admin/stores"
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="text-2xl">🏪</div>
            <h2 className="mt-3 text-lg font-bold text-stone-800">Stores</h2>
            <p className="mt-1 text-sm text-stone-500">
              Add and manage showroom locations
            </p>
          </a>

          <a
            href="/admin/sales"
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="text-2xl">👤</div>
            <h2 className="mt-3 text-lg font-bold text-stone-800">Sales Users</h2>
            <p className="mt-1 text-sm text-stone-500">
              Manage sales staff profiles and store assignments
            </p>
          </a>

          <a
            href="/admin/users"
            className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="text-2xl">🔑</div>
            <h2 className="mt-3 text-lg font-bold text-stone-800">Users</h2>
            <p className="mt-1 text-sm text-stone-500">
              Add and manage login accounts for all staff
            </p>
          </a>
        </div>
      </div>
    </main>
  );
}
