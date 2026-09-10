import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { Sidebar } from "@/components/Sidebar";
import { ModeToggle } from "@/components/ModeToggle";
import { ModeRenderer } from "@/components/ModeRenderer";
import { ChatProvider } from "@/components/chat-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <ChatProvider>
        <div className="flex flex-col md:flex-row min-h-screen">
          <Sidebar />

          <main className="flex-1 w-full max-w-full overflow-x-hidden flex flex-col">
            <header className="h-16 border-b border-border bg-surface flex items-center justify-between px-6 sticky top-0 z-10">
              <div className="flex items-center">
                {/* Optional: Add page title or breadcrumbs here */}
              </div>
              <div className="flex items-center space-x-4">
                <ModeToggle />
                <ThemeToggle />
                <UserButton />
              </div>
            </header>
            <div className="flex-1 flex flex-col h-full">
              <ModeRenderer>
                {children}
              </ModeRenderer>
            </div>
          </main>
        </div>
      </ChatProvider>
    </div>
  );
}