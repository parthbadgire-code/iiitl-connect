"use client";

import { useEffect, useState } from "react";
import { Ghost, Sparkles, Filter, Send, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";
import { Button } from "@parthbadgire/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@parthbadgire/ui/components/dialog";

type AnonymousPost = {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  anonymousIdentity: {
    avatarSeed: string;
  };
};

const CATEGORIES = [
  { key: "CONFESSIONS", label: "Confessions", color: "#ec4899" },
  { key: "ACADEMICS", label: "Academics", color: "#7c3aed" },
  { key: "HOSTEL", label: "Hostel", color: "#f59e0b" },
  { key: "MEMES", label: "Memes", color: "#06b6d4" },
  { key: "PLACEMENTS", label: "Placements", color: "#10b981" },
];

function SkeletonPost() {
  return (
    <Card className="bg-zinc-950 border-zinc-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="skeleton h-5 w-1/3 rounded-lg" />
          <div className="skeleton h-4 w-16 rounded-full" />
        </div>
        <div className="skeleton h-3 w-1/4 rounded mt-1" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-4 w-5/6 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ConfessionsPage() {
  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("CONFESSIONS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const url = activeCategory 
        ? `http://localhost:3001/social/feed?category=${activeCategory}`
        : "http://localhost:3001/social/feed";
      const res = await fetch(url, { credentials: "include" });
      if (res.ok) setPosts(await res.json());
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("http://localhost:3001/social/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newContent, category: newCategory }),
      });
      if (res.ok) {
        setIsComposeOpen(false);
        setNewContent("");
        fetchFeed(); // Refresh
      } else {
        alert("Failed to post confession.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 animate-fade-in-up">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full" style={{ background: "linear-gradient(90deg, #ec4899, #7c3aed)" }} />
            <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8b8ba7" }}>
              Anonymous Feed
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-none" style={{ color: "#f4f4f8" }}>
            <span className="gradient-text-warm">Confessions</span> Hub
          </h1>
          <p className="text-sm" style={{ color: "#8b8ba7" }}>
            Share what&apos;s on your mind. Your true identity is strictly hidden.
          </p>
        </div>

        {/* Compose Button */}
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <button className="btn-shimmer flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: "linear-gradient(135deg, #ec4899, #db2777)",
                color: "#fff",
                border: "1px solid rgba(236,72,153,0.4)",
                boxShadow: "0 4px 15px rgba(236,72,153,0.25)",
              }}>
              <Sparkles className="h-4 w-4" />
              New Post
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-50">
            <DialogHeader>
              <DialogTitle className="text-xl">Create Anonymous Post</DialogTitle>
              <DialogDescription className="text-zinc-400">
                You will be assigned a random moniker (e.g. &quot;Silent Ninja&quot;). No one will know it&apos;s you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What's happening on campus?"
                className="w-full h-32 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/50 resize-none"
              />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.key}
                      onClick={() => setNewCategory(c.key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: newCategory === c.key ? `${c.color}20` : "transparent",
                        color: newCategory === c.key ? c.color : "#8b8ba7",
                        border: newCategory === c.key ? `1px solid ${c.color}50` : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || !newContent.trim()}
                className="bg-pink-600 hover:bg-pink-700 text-white"
              >
                {isSubmitting ? "Posting..." : "Post Anonymously"}
                {!isSubmitting && <Send className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 animate-fade-in-up delay-100">
        <Filter className="h-4 w-4 mr-1" style={{ color: "#8b8ba7" }} />
        <button
          onClick={() => setActiveCategory(null)}
          className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: activeCategory === null ? "rgba(255,255,255,0.1)" : "rgba(13,13,20,0.8)",
            color: activeCategory === null ? "#f4f4f8" : "#8b8ba7",
            border: activeCategory === null ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.06)",
          }}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: activeCategory === c.key ? `${c.color}20` : "rgba(13,13,20,0.8)",
              color: activeCategory === c.key ? c.color : "#8b8ba7",
              border: activeCategory === c.key ? `1px solid ${c.color}50` : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Feed */}
      <div className="space-y-4">
        {loading ? (
          <>
            <SkeletonPost />
            <SkeletonPost />
            <SkeletonPost />
          </>
        ) : posts.length > 0 ? (
          posts.map((post, i) => {
            const catConf = CATEGORIES.find(c => c.key === post.category) || CATEGORIES[0];
            const timeStr = new Date(post.createdAt).toLocaleDateString("en-IN", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            });
            
            return (
              <Card
                key={post.id}
                className="glass-card bg-zinc-950/80 border-zinc-800 animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: `linear-gradient(135deg, ${catConf.color}, #3b82f6)`, color: "#fff" }}>
                        {post.anonymousIdentity.avatarSeed.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base text-zinc-100 font-semibold">
                          {post.anonymousIdentity.avatarSeed}
                        </CardTitle>
                        <CardDescription className="text-xs text-zinc-500 mt-0.5">
                          {timeStr}
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0"
                      style={{ background: `${catConf.color}15`, color: catConf.color, border: `1px solid ${catConf.color}30` }}>
                      {catConf.label}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 pt-3 border-t border-zinc-800/50">
                    <button className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Reply
                    </button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 animate-float"
              style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.2)" }}>
              <Ghost className="h-8 w-8" style={{ color: "#ec4899" }} />
            </div>
            <p className="text-zinc-100 font-medium">No posts in this category yet</p>
            <p className="text-sm text-zinc-500 mt-1">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
