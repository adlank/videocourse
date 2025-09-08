import { redirect } from 'next/navigation'

export default function AdminRootPage() {
  // Redirect to login page - users need to authenticate first
  redirect('/admin/login')
}
