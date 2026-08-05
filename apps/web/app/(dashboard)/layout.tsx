import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-50 overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Topbar />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto bg-zinc-950 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
