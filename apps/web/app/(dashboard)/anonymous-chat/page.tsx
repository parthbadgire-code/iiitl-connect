"use client";

import { useEffect, useState, useRef } from "react";
import { Ghost, Sparkles, Filter, Send, ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, Loader2, Trash2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@parthbadgire/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@parthbadgire/ui/components/dialog";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type AnonymousPost = {
  id: string;
  content: string;
  category: string;
  createdAt: string;
  anonymousIdentity: { id: string; avatarSeed: string };
  likes: number;
  dislikes: number;
  replyCount: number;
  myReaction: "LIKE" | "DISLIKE" | null;
  isMine: boolean;
};

type PostReply = {
  id: string;
  content: string;
  createdAt: string;
  anonymousIdentity: { avatarSeed: string };
  isMine: boolean;
};

const CATEGORIES = [
  { key: "CONFESSIONS", label: "Anonymous Chat", color: "#ec4899" },
  { key: "ACADEMICS", label: "Academics", color: "#7c3aed" },
  { key: "HOSTEL", label: "Hostel", color: "#f59e0b" },
  { key: "MEMES", label: "Memes", color: "#06b6d4" },
  { key: "PLACEMENTS", label: "Placements", color: "#10b981" },
];

function SkeletonPost() {
  return (
    <Card className="bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4">
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

function PostCard({
  post,
  onReact,
  isAdmin,
  onDelete,
  onDeleteReply,
}: {
  post: AnonymousPost;
  onReact: (postId: string, type: "LIKE" | "DISLIKE") => void;
  isAdmin: boolean;
  onDelete: (postId: string) => void;
  onDeleteReply: (replyId: string) => void;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState<PostReply[]>([]);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [localReplyCount, setLocalReplyCount] = useState(post.replyCount);
  const replyInputRef = useRef<HTMLTextAreaElement>(null);

  const catConf = CATEGORIES.find((c) => c.key === post.category) || CATEGORIES[0];
  const timeStr = new Date(post.createdAt).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const fetchReplies = async () => {
    setLoadingReplies(true);
    try {
      const res = await fetch(`${API}/social/feed/${post.id}/replies`, {
        credentials: "include",
      });
      if (res.ok) setReplies(await res.json());
    } finally {
      setLoadingReplies(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies) fetchReplies();
    setShowReplies((v) => !v);
  };

  const submitReply = async () => {
    if (!replyText.trim()) return;
    setIsSubmittingReply(true);
    try {
      const res = await fetch(`${API}/social/feed/${post.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: replyText }),
      });
      if (res.ok) {
        const newReply = await res.json();
        setReplies((prev) => [...prev, newReply]);
        setReplyText("");
        setLocalReplyCount((c) => c + 1);
      } else {
        if (res.status === 400) {
          const errData = await res.json();
          alert(errData.message || "Failed to post reply.");
        } else {
          alert("Failed to post reply.");
        }
      }
    } finally {
      setIsSubmittingReply(false);
    }
  };

  return (
    <Card
      className="bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 rounded-3xl animate-fade-in-up hover:border-white/10 transition-all duration-500"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{
                background: `${catConf.color}20`,
                color: catConf.color,
                border: `1px solid ${catConf.color}40`,
              }}
            >
              {post.anonymousIdentity.avatarSeed.charAt(0)}
            </div>
            <div>
              <CardTitle className="text-sm text-zinc-100 font-semibold">
                {post.anonymousIdentity.avatarSeed}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 mt-0.5">
                {timeStr}
              </CardDescription>
            </div>
          </div>
          <span
            className="text-[10px] font-bold uppercase px-2 py-1 rounded-full shrink-0"
            style={{
              background: `${catConf.color}15`,
              color: catConf.color,
              border: `1px solid ${catConf.color}30`,
            }}
          >
            {catConf.label}
          </span>
          {(isAdmin || post.isMine) && (
            <button onClick={() => onDelete(post.id)} className="p-1 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Action Bar */}
        <div className="flex items-center gap-3 pt-2 border-t border-zinc-800/50">
          {/* Like */}
          <button
            onClick={() => onReact(post.id, "LIKE")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              post.myReaction === "LIKE"
                ? "bg-green-500/15 text-green-400 border border-green-500/30"
                : "text-zinc-500 hover:text-green-400 hover:bg-green-500/10 border border-transparent"
            }`}
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{post.likes}</span>
          </button>

          {/* Dislike */}
          <button
            onClick={() => onReact(post.id, "DISLIKE")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              post.myReaction === "DISLIKE"
                ? "bg-red-500/15 text-red-400 border border-red-500/30"
                : "text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent"
            }`}
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span>{post.dislikes}</span>
          </button>

          {/* Reply toggle */}
          <button
            onClick={toggleReplies}
            className="flex items-center gap-1.5 ml-auto px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>{localReplyCount} {localReplyCount === 1 ? "reply" : "replies"}</span>
            {showReplies ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Reply Thread */}
        {showReplies && (
          <div className="mt-2 space-y-3 animate-fade-in-up">
            <div className="pl-4 border-l-2 border-white/5 space-y-3">
              {loadingReplies ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-zinc-600" />
                </div>
              ) : replies.length > 0 ? (
                replies.map((reply) => (
                  <div key={reply.id} className="flex gap-2.5 group">
                    <div
                      className="h-6 w-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                      style={{
                        background: `${catConf.color}15`,
                        color: catConf.color,
                        border: `1px solid ${catConf.color}30`,
                      }}
                    >
                      {reply.anonymousIdentity.avatarSeed.charAt(0)}
                    </div>
                    <div className="bg-white/3 rounded-xl px-3 py-2 flex-1 border border-white/5 relative">
                      {(isAdmin || reply.isMine) && (
                        <button onClick={async () => {
                          await onDeleteReply(reply.id);
                          setReplies(prev => prev.filter(r => r.id !== reply.id));
                          setLocalReplyCount(prev => Math.max(0, prev - 1));
                        }} className="absolute top-2 right-2 p-1 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 rounded-lg transition-all">
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                      <p className="text-[11px] font-semibold text-zinc-400 mb-1">
                        {reply.anonymousIdentity.avatarSeed}
                      </p>
                      <p className="text-xs text-zinc-300 leading-relaxed pr-6">
                        {reply.content}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-zinc-600 py-2 pl-1">No replies yet. Be the first!</p>
              )}
            </div>

            {/* Reply compose */}
            <div className="flex gap-2 mt-2">
              <textarea
                ref={replyInputRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write an anonymous reply..."
                rows={1}
                className="flex-1 p-2.5 bg-black/60 border border-neutral-800 rounded-xl text-xs focus:outline-none focus:border-zinc-600 transition-colors resize-none text-white placeholder:text-zinc-600"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submitReply();
                  }
                }}
              />
              <button
                onClick={submitReply}
                disabled={isSubmittingReply || !replyText.trim()}
                className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all disabled:opacity-30"
              >
                {isSubmittingReply ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AnonymousChatPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.email === "lit2025021@iiitl.ac.in";

  const [posts, setPosts] = useState<AnonymousPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear().toString();
  const [activeMonth, setActiveMonth] = useState<string>(currentMonth);
  const [activeYear, setActiveYear] = useState<string>(currentYear);

  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState("CONFESSIONS");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.append("category", activeCategory);
      if (activeMonth) params.append("month", activeMonth);
      if (activeYear) params.append("year", activeYear);
      
      const url = `${API}/social/feed?${params.toString()}`;
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
  }, [activeCategory, activeMonth, activeYear]);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API}/social/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ content: newContent, category: newCategory }),
      });
      if (res.ok) {
        setIsComposeOpen(false);
        setNewContent("");
        fetchFeed();
      } else {
        if (res.status === 400) {
          const errData = await res.json();
          alert(errData.message || "Failed to post.");
        } else {
          alert("Failed to post.");
        }
      }
    } catch {
      alert("Network error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReact = async (postId: string, type: "LIKE" | "DISLIKE") => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const wasLiked = p.myReaction === "LIKE";
        const wasDisliked = p.myReaction === "DISLIKE";
        const toggling = p.myReaction === type;

        return {
          ...p,
          myReaction: toggling ? null : type,
          likes:
            type === "LIKE"
              ? toggling
                ? p.likes - 1
                : p.likes + 1 - (wasDisliked ? 0 : 0)
              : wasLiked
              ? p.likes - 1
              : p.likes,
          dislikes:
            type === "DISLIKE"
              ? toggling
                ? p.dislikes - 1
                : p.dislikes + 1
              : wasDisliked
              ? p.dislikes - 1
              : p.dislikes,
        };
      })
    );

    try {
      await fetch(`${API}/social/feed/${postId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ type }),
      });
    } catch (err) {
      console.error("React failed:", err);
      // Revert by re-fetching
      fetchFeed();
    }
  };

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`${API}/social/feed/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
      } else {
        alert("Failed to delete post");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) return;
    try {
      const res = await fetch(`${API}/social/feed/reply/${replyId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        // Handled locally by PostCard
      } else {
        alert("Failed to delete reply");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting reply");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 animate-fade-in-up">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-pastel-mint" />
            <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
              Anonymous Feed
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">
            Campus <span className="bg-gradient-to-r from-pastel-mint to-teal-400 bg-clip-text text-transparent">Anonymous Chat</span>
          </h1>
          <p className="text-neutral-400 text-sm">Read what&apos;s on everyone&apos;s mind anonymously.</p>
        </div>

        {/* Compose Button */}
        <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
          <DialogTrigger asChild>
            <button className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 bg-pastel-mint text-black hover:bg-pastel-mint/90 hover:scale-105">
              <Sparkles className="h-4 w-4" />
              New Post
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg bg-[#0A0A0A] border border-neutral-800 rounded-3xl text-white shadow-[0_0_50px_rgba(167,243,208,0.15)]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create Anonymous Post</DialogTitle>
              <DialogDescription className="text-neutral-400">
                You will be assigned a random moniker (e.g. &quot;Silent Ninja&quot;). No one will know it&apos;s you.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="What's happening on campus?"
                className="w-full h-32 p-4 bg-black border border-neutral-800 rounded-xl text-sm focus:outline-none focus:border-pastel-mint transition-colors resize-none"
              />
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase">Category</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.key}
                      onClick={() => setNewCategory(c.key)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: newCategory === c.key ? `${c.color}20` : "transparent",
                        color: newCategory === c.key ? c.color : "#8b8ba7",
                        border:
                          newCategory === c.key
                            ? `1px solid ${c.color}50`
                            : "1px solid rgba(255,255,255,0.1)",
                      }}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsComposeOpen(false)}
                className="text-sm font-semibold px-4 py-2 text-neutral-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !newContent.trim()}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-pastel-mint hover:bg-pastel-mint/90"
              >
                {isSubmitting ? "Posting..." : "Post Anonymously"}
                {!isSubmitting && <Send className="w-4 h-4" />}
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Chips */}
      <div className="flex flex-col md:flex-row gap-4 animate-fade-in-up delay-100 items-start md:items-center justify-between bg-[#0A0A0A]/50 p-4 rounded-3xl border border-white/5">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 mr-1 text-neutral-500" />
        <button
          onClick={() => setActiveCategory(null)}
          className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            background: activeCategory === null ? "rgba(255,255,255,0.1)" : "rgba(10,10,10,0.6)",
            color: activeCategory === null ? "#f4f4f8" : "#8b8ba7",
            border:
              activeCategory === null
                ? "1px solid rgba(255,255,255,0.2)"
                : "1px solid rgba(255,255,255,0.05)",
          }}
        >
          All
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c.key}
            onClick={() => setActiveCategory(c.key)}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{
              background: activeCategory === c.key ? `${c.color}20` : "rgba(10,10,10,0.6)",
              color: activeCategory === c.key ? c.color : "#8b8ba7",
              border:
                activeCategory === c.key
                  ? `1px solid ${c.color}50`
                  : "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {c.label}
          </button>
        ))}
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={activeMonth} 
            onChange={e => setActiveMonth(e.target.value)}
            className="bg-black border border-white/10 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-pastel-mint"
          >
            <option value="01">Jan</option>
            <option value="02">Feb</option>
            <option value="03">Mar</option>
            <option value="04">Apr</option>
            <option value="05">May</option>
            <option value="06">Jun</option>
            <option value="07">Jul</option>
            <option value="08">Aug</option>
            <option value="09">Sep</option>
            <option value="10">Oct</option>
            <option value="11">Nov</option>
            <option value="12">Dec</option>
          </select>
          <select 
            value={activeYear} 
            onChange={e => setActiveYear(e.target.value)}
            className="bg-black border border-white/10 text-white text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-pastel-mint"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
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
          posts.map((post) => (
            <PostCard key={post.id} post={post} onReact={handleReact} isAdmin={isAdmin} onDelete={handleDelete} onDeleteReply={handleDeleteReply} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mb-4 animate-float bg-pastel-mint/10 border border-pastel-mint/20">
              <Ghost className="h-8 w-8 text-pastel-mint" />
            </div>
            <p className="text-white font-medium">No posts in this category yet</p>
            <p className="text-sm text-neutral-500 mt-1">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
