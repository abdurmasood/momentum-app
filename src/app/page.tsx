import { redirect } from 'next/navigation'

/**
 * Root page - redirects to dashboard
 * 
 * Since this is a dashboard-focused application,
 * we redirect users directly to the main dashboard.
 */
export default function RootPage() {
  redirect('/dashboard')
}