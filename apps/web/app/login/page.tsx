"use client";

import { signIn } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { LandingScene } from "@/components/3d/LandingScene";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [showErrorModal, setShowErrorModal] = useState(false);

  useEffect(() => {
    const search = new URLSearchParams(window.location.search);
    if (search.has("error")) {
      setShowErrorModal(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    setMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/academic`,
        errorURL: `${window.location.origin}/login`,
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
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-black">
      {/* BACKGROUND SHADER */}
      <LandingScene />

      {/* ERROR MODAL */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A]/95 border border-red-500/20 w-full max-w-sm rounded-[2rem] overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] text-center p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-6">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
            <p className="text-sm text-neutral-400 mb-8 leading-relaxed">
              CampusOS is an exclusive network. You can only log in using your official <strong className="text-white">@iiitl.ac.in</strong> email address.
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3.5 rounded-xl font-bold text-black bg-white hover:bg-neutral-200 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* CENTERED LOGIN CARD */}
      <div 
        className={`relative z-10 w-full max-w-md rounded-2xl bg-[#111111]/80 p-8 sm:p-12 backdrop-blur-2xl border border-white/5 shadow-2xl transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Logo & Tagline */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-white">
              iiitl<span className="opacity-90">.connect</span>
            </h1>
            <p className="text-sm text-neutral-400 font-medium">
              The digital hub for your academic life.
            </p>
          </div>

          {/* Sign In Button */}
          <div className="w-full pt-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-lg bg-black/60 px-4 py-3.5 text-xs sm:text-sm font-bold tracking-widest text-white border border-white/10 hover:bg-black/80 hover:border-white/20 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              )}
              SIGN IN WITH GOOGLE
            </button>
          </div>

          {/* Guidelines */}
          <div className="space-y-2 pt-2">
            <p className="text-xs text-neutral-500 font-medium">
              Only @iiitl.ac.in emails allowed.
            </p>
            <p className="text-xs text-neutral-500 font-medium">
              Please sign in with your college email ID only.
            </p>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/5 my-2" />

          {/* Footer */}
          <div>
            <p className="text-xs text-neutral-500">
              Don&apos;t have an account? <a href="#" className="font-bold text-neutral-300 hover:text-white transition-colors">Request Access</a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
