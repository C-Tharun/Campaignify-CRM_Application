import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import Link from "next/link";
import SignOutButton from "@/components/ui/SignOutButton";
import { UserIcon } from '@heroicons/react/24/solid';
import { usePathname } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default async function DashboardLayout({ children }: DashboardLayoutProps) {
  const session = await getServerSession();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  if (!session) {
    redirect("/auth/signin");
  }

  // Helper for active link
  const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/campaigns", label: "Campaigns" },
    { href: "/dashboard/segments", label: "Segments" },
    { href: "/dashboard/customers", label: "Customers" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-gradient-to-r from-blue-800 to-blue-700 shadow-md rounded-b-xl mx-2 mt-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="text-2xl font-extrabold text-white tracking-tight">Campaignify</span>
              </Link>
              <div className="hidden sm:flex sm:space-x-2 ml-8">
                {navLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-blue-300
                      ${pathname === link.href ? 'bg-white text-blue-800 shadow font-bold' : 'text-white hover:bg-blue-600 hover:text-white'}`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="h-10 border-l border-blue-300 mx-2" />
              {session?.user?.name ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full border-2 border-blue-300 bg-white flex items-center justify-center text-blue-800 font-bold text-base shadow-sm">
                    {session.user.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                  </div>
                  <span className="hidden md:inline text-white font-medium">{session.user.name.split(' ')[0]}</span>
                </div>
              ) : (
                <UserIcon className="w-8 h-8 text-white" />
              )}
              <SignOutButton className="ml-2 border border-white text-white bg-transparent hover:bg-white hover:text-blue-800 rounded-full px-4 py-2 font-semibold transition" />
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
} 