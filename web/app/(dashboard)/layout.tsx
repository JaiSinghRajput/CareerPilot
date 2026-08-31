import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
          <div className="border-b border-slate-200 p-6">
            <Link href="/" className="text-xl font-bold">
              CareerPilot AI
            </Link>
          </div>

          <nav className="flex-1 space-y-2 p-4">
            <Link
              href="/dashboard"
              className="block rounded-lg px-4 py-3 hover:bg-slate-100"
            >
              Overview
            </Link>

            <Link
              href="/resume"
              className="block rounded-lg px-4 py-3 hover:bg-slate-100"
            >
              Resume Builder
            </Link>

            <Link
              href="#"
              className="block rounded-lg px-4 py-3 hover:bg-slate-100"
            >
              Job Explorer
            </Link>
          </nav>

          <div className="border-t border-slate-200 p-4">
            <UserButton />
          </div>
        </aside>

        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}