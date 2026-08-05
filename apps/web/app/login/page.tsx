"use client";

import { signIn } from "@/lib/auth-client";
import { useState, useEffect } from "react";

const STATS = [
  { value: "1,200+", label: "Students" },
  { value: "45+", label: "Clubs" },
  { value: "800+", label: "Resources" },
  { value: "120+", label: "Events/yr" },
];

const FLOATING_CARDS = [
  { icon: "📚", title: "DSA PYQ — CS101", sub: "Uploaded 2h ago", color: "from-violet-500/20 to-violet-500/5" },
  { icon: "🎉", title: "Tech Fest 2025 RSVP", sub: "143 going", color: "from-cyan-500/20 to-cyan-500/5" },
  { icon: "🔒", title: "Anonymous Confession", sub: "42 reactions", color: "from-pink-500/20 to-pink-500/5" },
  { icon: "💼", title: "Microsoft SDE Offer", sub: "₹28L CTC", color: "from-emerald-500/20 to-emerald-500/5" },
];

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/academic",
      });
      if (error) {
        alert("Sign in error: " + (error.message || error.statusText));
      }
    } catch (err: unknown) {
      if (err instanceof Error) alert("Network error: " + err.message);
      else alert("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden" style={{ background: "#050508" }}>

      {/* === ANIMATED BACKGROUND === */}
      <div className="campus-bg" aria-hidden="true">
        <div className="campus-bg-grid" />
        <div className="campus-bg-orb3" />
      </div>

      {/* === LEFT PANEL — Hero === */}
      <div className="relative hidden lg:flex lg:w-[55%] flex-col justify-between p-12 xl:p-16">

        {/* Top brand */}
        <div className={`flex items-center gap-3 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
          <div className="relative flex h-10 w-10 items-center justify-center">
            {/* Hex icon */}
            <svg viewBox="0 0 40 40" className="h-10 w-10 animate-spin-slow">
              <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="none" stroke="url(#hexGrad)" strokeWidth="1.5"/>
              <defs>
                <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="absolute text-xs font-black gradient-text">II</span>
            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border border-violet-500/30 scale-150 animate-ping" style={{ animationDuration: "3s" }} />
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: "#f4f4f8" }}>IIITL Connect</span>
        </div>

        {/* Main hero text */}
        <div className="space-y-8">
          <div className={`space-y-4 transition-all duration-700 delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium"
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", color: "#a855f7" }}>
              <span className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-pulse" />
              CampusOS for IIIT Lucknow
            </div>
            <h1 className="text-5xl xl:text-6xl font-black leading-tight tracking-tight" style={{ color: "#f4f4f8" }}>
              Your campus,{" "}
              <span className="gradient-text block">all in one place.</span>
            </h1>
            <p className="text-lg max-w-md" style={{ color: "#8b8ba7" }}>
              Academic resources, anonymous confessions, clubs, placements, marketplace — built exclusively for IIITL students.
            </p>
          </div>

          {/* Stats row */}
          <div className={`grid grid-cols-4 gap-4 transition-all duration-700 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {STATS.map((stat, i) => (
              <div key={i} className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-black gradient-text">{stat.value}</div>
                <div className="text-xs mt-1" style={{ color: "#8b8ba7" }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Floating activity cards */}
        <div className={`relative h-52 transition-all duration-700 delay-500 ${mounted ? "opacity-100" : "opacity-0"}`}>
          {FLOATING_CARDS.map((card, i) => (
            <div
              key={i}
              className={`absolute glass-card rounded-xl p-3 flex items-center gap-3 animate-float`}
              style={{
                left: `${i % 2 === 0 ? i * 22 : i * 18 + 5}%`,
                top: `${i < 2 ? 0 : 55}%`,
                animationDelay: `${i * 0.7}s`,
                minWidth: "180px",
                background: `linear-gradient(135deg, ${card.color.replace("from-", "").replace(" to-", ", ")})`,
              }}
            >
              <span className="text-xl">{card.icon}</span>
              <div>
                <div className="text-xs font-semibold" style={{ color: "#f4f4f8" }}>{card.title}</div>
                <div className="text-xs" style={{ color: "#8b8ba7" }}>{card.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === RIGHT PANEL — Auth card === */}
      <div className="relative flex w-full lg:w-[45%] items-center justify-center p-6">

        {/* Decorative side border on desktop */}
        <div className="hidden lg:block absolute left-0 top-[10%] bottom-[10%] w-px"
          style={{ background: "linear-gradient(180deg, transparent, rgba(124,58,237,0.4), rgba(6,182,212,0.3), transparent)" }} />

        <div className={`w-full max-w-md transition-all duration-700 delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>

          {/* Card */}
          <div className="relative rounded-2xl p-8 space-y-8"
            style={{
              background: "rgba(13, 13, 20, 0.85)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(255,255,255,0.07)",
              boxShadow: "0 0 0 1px rgba(124,58,237,0.15), 0 24px 80px rgba(0,0,0,0.8)"
            }}>

            {/* Gradient border glow at top */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-2/3 rounded-full"
              style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(6,182,212,0.4), transparent)" }} />

            {/* Header */}
            <div className="text-center space-y-3">
              {/* Logo */}
              <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full animate-glow-pulse"
                  style={{ background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.3)" }} />
                <div className="absolute inset-0 rounded-full animate-ring-pulse"
                  style={{ border: "1px solid rgba(124,58,237,0.2)" }} />
                <svg viewBox="0 0 40 40" className="h-8 w-8">
                  <polygon points="20,2 37,11 37,29 20,38 3,29 3,11" fill="none" stroke="url(#hexGrad2)" strokeWidth="1.5" />
                  <text x="50%" y="56%" textAnchor="middle" fontSize="11" fontWeight="900" fill="url(#hexGrad2)">II</text>
                  <defs>
                    <linearGradient id="hexGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              <h2 className="text-2xl font-black tracking-tight" style={{ color: "#f4f4f8" }}>
                Welcome back
              </h2>
              <p className="text-sm" style={{ color: "#8b8ba7" }}>
                Sign in to your IIITL Connect account
              </p>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />

            {/* Google Sign In Button */}
            <div className="space-y-4">
              <button
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn-shimmer relative w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  color: "#fff",
                  border: "1px solid rgba(124,58,237,0.4)",
                  boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(124,58,237,0.5), 0 4px 15px rgba(124,58,237,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 15px rgba(124,58,237,0.3)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                }}
              >
                {loading ? (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4" viewBox="0 0 488 512" aria-hidden="true">
                    <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z" />
                  </svg>
                )}
                {loading ? "Signing in..." : "Continue with Google"}
              </button>

              {/* Restriction notice */}
              <div className="flex items-center gap-2 justify-center">
                <svg className="h-3 w-3 shrink-0" style={{ color: "#8b8ba7" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p className="text-xs" style={{ color: "#8b8ba7" }}>
                  Restricted to{" "}
                  <span style={{ color: "#a855f7" }}>@iiitl.ac.in</span>
                  {" "}domain only
                </p>
              </div>
            </div>

            {/* Features list */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {[
                { icon: "📚", text: "Study Resources" },
                { icon: "🎭", text: "Anonymous Posts" },
                { icon: "🏢", text: "Campus Events" },
                { icon: "💼", text: "Placements" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <span className="text-sm">{f.icon}</span>
                  <span className="text-xs font-medium" style={{ color: "#8b8ba7" }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#4a4a6a" }}>
            By signing in, you agree to our{" "}
            <span className="cursor-pointer hover:text-violet-400 transition-colors" style={{ color: "#8b8ba7" }}>Terms</span>
            {" & "}
            <span className="cursor-pointer hover:text-violet-400 transition-colors" style={{ color: "#8b8ba7" }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
