import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { checkAdminAccess } from '@/lib/auth/admin-check'

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Check admin access on server side for protected routes
  await checkAdminAccess()

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
