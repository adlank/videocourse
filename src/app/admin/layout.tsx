export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Basic layout for all admin routes (including login)
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  )
}
