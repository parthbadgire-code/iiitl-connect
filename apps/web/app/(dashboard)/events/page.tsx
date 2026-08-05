"use client";

import { Calendar, Sparkles } from "lucide-react";

export default function EventsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 animate-fade-in-up">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl animate-float"
        style={{ background: "rgba(6,182,212,0.1)", border: "1px solid rgba(6,182,212,0.2)" }}>
        <Calendar className="h-10 w-10" style={{ color: "#06b6d4" }} />
      </div>

      <div className="text-center max-w-sm space-y-2">
        <h1 className="text-3xl font-black tracking-tight" style={{ color: "#f4f4f8" }}>
          Campus{" "}
          <span className="neon-text-cyan">Events</span>
        </h1>
        <p className="text-sm" style={{ color: "#8b8ba7" }}>
          Club events, hackathons, workshops and fests — RSVP and never miss out on campus life.
        </p>
      </div>

      <div className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold"
        style={{ background: "rgba(6,182,212,0.1)", color: "#22d3ee", border: "1px solid rgba(6,182,212,0.2)" }}>
        <Sparkles className="h-3 w-3" />
        Coming Soon
      </div>
    </div>
  );
}
