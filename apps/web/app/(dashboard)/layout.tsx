import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: "#050508" }}>
      {/* Animated background glows */}
      <div className="campus-bg" aria-hidden="true">
        <div className="campus-bg-grid" />
        <div className="campus-bg-orb3" />
      </div>

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="relative flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <Topbar />

        {/* Scrollable Page Content */}
        <main className="relative flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
