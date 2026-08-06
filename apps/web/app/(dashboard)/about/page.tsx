"use client";

import { motion } from "framer-motion";
import { Sparkles, Code, Users, Rocket, Heart, ArrowRight } from "lucide-react";
import { Card } from "@parthbadgire/ui/components/card";

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pastel-lavender/10 border border-pastel-lavender/20 text-pastel-lavender text-xs font-bold tracking-widest uppercase mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Sparkles className="h-3.5 w-3.5" />
          <span>About The Project</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
          Built for <span className="text-pastel-lavender">IIITL.</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-400 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
          CampusOS is a next-generation digital ecosystem designed to connect, empower, and simplify the lives of students at the Indian Institute of Information Technology, Lucknow.
        </p>
      </section>

      {/* Mission Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
        <Card className="bg-[#0A0A0A]/80 border-white/5 backdrop-blur-md p-8 hover:border-pastel-peach/30 transition-all duration-300 group">
          <div className="h-12 w-12 rounded-2xl bg-pastel-peach/10 flex items-center justify-center text-pastel-peach mb-6 group-hover:scale-110 transition-transform">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Community First</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Breaking down communication barriers across batches and branches to foster a tighter-knit campus community.
          </p>
        </Card>

        <Card className="bg-[#0A0A0A]/80 border-white/5 backdrop-blur-md p-8 hover:border-pastel-blue/30 transition-all duration-300 group">
          <div className="h-12 w-12 rounded-2xl bg-pastel-blue/10 flex items-center justify-center text-pastel-blue mb-6 group-hover:scale-110 transition-transform">
            <Rocket className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Empowering Growth</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Providing centralized access to academic resources, PYQs, and clubs to accelerate student development.
          </p>
        </Card>

        <Card className="bg-[#0A0A0A]/80 border-white/5 backdrop-blur-md p-8 hover:border-pastel-mint/30 transition-all duration-300 group">
          <div className="h-12 w-12 rounded-2xl bg-pastel-mint/10 flex items-center justify-center text-pastel-mint mb-6 group-hover:scale-110 transition-transform">
            <Code className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-3">Open Innovation</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">
            Built by students, for students. A modern, open-source platform that evolves with the needs of the campus.
          </p>
        </Card>
      </section>

      {/* Developer Section */}
      <section className="animate-in fade-in slide-in-from-bottom-12 duration-700 delay-500">
        <div className="bg-gradient-to-br from-[#111111] to-[#050505] border border-white/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {/* Abstract Glow */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-pastel-lavender/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="shrink-0 relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-pastel-lavender to-pastel-blue rounded-full blur-xl opacity-20 animate-pulse" />
              <img 
                src="https://github.com/parthbadgire-code.png" 
                alt="Developer" 
                className="w-32 h-32 rounded-full border-2 border-white/10 object-cover relative z-10"
              />
            </div>
            
            <div className="text-center md:text-left space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 text-pastel-peach text-sm font-bold tracking-widest uppercase">
                <Heart className="h-4 w-4 fill-pastel-peach/20" />
                <span>The Developer</span>
              </div>
              <h2 className="text-3xl font-black text-white">Parth Badgire</h2>
              <p className="text-neutral-400 text-lg leading-relaxed max-w-xl">
                I built CampusOS because I saw a fragmented digital experience on campus. 
                My goal was to create a single, beautiful, and blazing-fast platform that serves as the central nervous system for IIITL.
              </p>
              
              <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <a href="https://github.com/parthbadgire-code" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-colors border border-white/10">
                  <Code className="h-4 w-4" />
                  GitHub Profile
                </a>
                <a href="mailto:parthbadgire@gmail.com" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-sm font-medium">
                  Contact Me <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="text-center pb-8 border-t border-white/5 pt-8 mt-12 animate-in fade-in duration-1000 delay-700">
        <p className="text-neutral-600 text-sm font-medium flex items-center justify-center gap-1">
          Made with <Heart className="h-3.5 w-3.5 text-pastel-peach" /> for IIITL
        </p>
      </footer>
    </div>
  );
}
