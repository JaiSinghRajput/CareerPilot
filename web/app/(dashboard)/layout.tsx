import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { Toaster } from "sonner";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="flex flex-col md:flex-row min-h-screen">
        <Sidebar />

        <main className="flex-1 w-full max-w-full overflow-x-hidden">
          {children}
        </main>
      </div>
      <Toaster position="top-center" richColors />
    </div>
  );
}