import { Topbar } from "@/components/layout/topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#050505]">
      {/* Animated background glows */}
      <div className="campus-bg" aria-hidden="true">
        <div className="campus-bg-grid" />
        <div className="campus-bg-orb3" />
      </div>

      {/* Top Header */}
      <Topbar />

      {/* Scrollable Page Content */}
      <main className="relative flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
