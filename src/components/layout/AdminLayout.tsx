import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <main className="flex-1 ml-64">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
