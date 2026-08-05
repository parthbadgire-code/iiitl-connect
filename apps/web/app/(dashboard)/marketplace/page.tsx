"use client";

import { ShoppingBag, Tag } from "lucide-react";

export default function MarketplacePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-fade-in-up">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl animate-float"
        style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}>
        <ShoppingBag className="h-10 w-10" style={{ color: "#10b981" }} />
      </div>

      <div className="text-center max-w-sm space-y-2">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "#f4f4f8" }}>
          Campus{" "}
          <span style={{ color: "#10b981" }}>Marketplace</span>
        </h1>
        <p className="text-sm" style={{ color: "#8b8ba7" }}>
          Buy and sell textbooks, electronics, and anything else — peer-to-peer on campus.
        </p>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
        style={{ background: "rgba(16,185,129,0.1)", color: "#34d399", border: "1px solid rgba(16,185,129,0.2)" }}>
        <Tag className="h-3 w-3" />
        Coming Soon
      </div>
    </div>
  );
}
