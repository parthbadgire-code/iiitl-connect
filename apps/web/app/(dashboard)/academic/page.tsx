"use client";

import { useEffect, useState } from "react";
import { Download, BookOpen, FileText, ClipboardList, Filter, Search, Upload, X, Loader2 } from "lucide-react";
import { uploadFileToR2 } from "@/lib/upload";

type StudyResource = {
  id: string;
  title: string;
  courseCode: string;
  type: string;
  description?: string;
  url?: string;
  uploader?: { name: string; email: string };
  createdAt?: string;
};

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PYQ: { label: "PYQ", color: "#E9D5FF", icon: FileText },
  NOTES: { label: "Notes", color: "#C084FC", icon: BookOpen },
  ASSIGNMENT: { label: "Assignment", color: "#A78BFA", icon: ClipboardList },
};

function SkeletonCard() {
  return (
    <div className="rounded-3xl p-5 space-y-4 bg-black/40 backdrop-blur-xl border border-white/5">
      <div className="flex justify-between items-start">
        <div className="skeleton h-5 w-3/4 rounded-lg" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
      <div className="skeleton h-4 w-1/3 rounded-lg" />
      <div className="space-y-2">
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="skeleton h-3 w-24 rounded" />
        <div className="skeleton h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function ResourceCard({ resource, index }: { resource: StudyResource; index: number }) {
  const typeConf = TYPE_CONFIG[resource.type] || TYPE_CONFIG.NOTES;
  const Icon = typeConf.icon as React.ElementType<{ className?: string; style?: React.CSSProperties }>;
  const timeAgo = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "Recently";

  return (
    <div
      className="group relative overflow-hidden rounded-3xl p-6 flex flex-col gap-4 animate-fade-in-up bg-[#0A0A0A]/50 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all duration-500"
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both", opacity: 0 }}
    >
      {/* Card top */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Icon box */}
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110"
            style={{ background: `${typeConf.color}18`, border: `1px solid ${typeConf.color}30` }}>
            <Icon className="h-4 w-4" style={{ color: typeConf.color }} />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: "#f4f4f8" }}>
              {resource.title}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-md"
                style={{ background: "rgba(255,255,255,0.05)", color: "#8b8ba7" }}>
                {resource.courseCode}
              </span>
            </div>
          </div>
        </div>
        {/* Type badge */}
        <span className="shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full border"
          style={{ background: `${typeConf.color}10`, color: typeConf.color, borderColor: `${typeConf.color}30` }}>
          {typeConf.label}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "#8b8ba7" }}>
        {resource.description || "Community-contributed study material. Download and contribute!"}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold bg-pastel-lavender/10 text-pastel-lavender border border-pastel-lavender/20">
            {resource.uploader?.name?.charAt(0) || "?"}
          </div>
          <div>
            <span className="text-[10px]" style={{ color: "#4a4a6a" }}>
              {resource.uploader?.name || "Anonymous"} · {timeAgo}
            </span>
          </div>
        </div>

        <a
          href={resource.url || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-300 bg-white/5 text-pastel-lavender hover:bg-pastel-lavender/10 border border-white/5 hover:border-pastel-lavender/30"
        >
          <Download className="h-3 w-3" />
          Download
        </a>
      </div>
    </div>
  );
}

export default function AcademicHubPage() {
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);

  // Upload State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("NOTES");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch("http://localhost:3001/academic/resources", { credentials: "include" });
        if (res.ok) setResources(await res.json());
      } catch (err) {
        console.error("Failed to fetch resources:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchResources();
  }, []);

  const filtered = resources.filter(r => {
    const matchSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.courseCode.toLowerCase().includes(search.toLowerCase());
    const matchType = !activeType || r.type === activeType;
    return matchSearch && matchType;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseCode || !selectedFile) return;

    setSubmitting(true);
    try {
      setUploading(true);
      const fileUrl = await uploadFileToR2(selectedFile);
      setUploading(false);

      const res = await fetch("http://localhost:3001/academic/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          courseCode,
          description,
          type,
          url: fileUrl,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setCourseCode("");
        setDescription("");
        setType("NOTES");
        setSelectedFile(null);
        // refresh list
        const refreshed = await fetch("http://localhost:3001/academic/resources", { credentials: "include" });
        if (refreshed.ok) setResources(await refreshed.json());
      } else {
        const data = await res.json();
        alert(data.message || "Failed to upload resource");
      }
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message || "Something went wrong");
      else alert("Something went wrong");
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const counts = { PYQ: 0, NOTES: 0, ASSIGNMENT: 0 };
  resources.forEach(r => { if (r.type in counts) (counts as Record<string, number>)[r.type]++; });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8">

      {/* === HERO HEADER === */}
      <div className="animate-fade-in-up">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 rounded-full bg-pastel-lavender" />
              <span className="text-xs font-semibold tracking-widest uppercase text-neutral-400">
                Community Resources
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none text-white">
              Academic <span className="bg-gradient-to-r from-pastel-lavender to-pastel-blue bg-clip-text text-transparent">Hub</span>
            </h1>
            <p className="text-sm text-neutral-400 max-w-xl">
              PYQs, lecture notes, and assignments — uploaded by IIITL students, for IIITL students.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="group flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-300 bg-pastel-lavender text-black hover:bg-pastel-lavender/90 hover:scale-105"
          >
            <Upload className="h-4 w-4" />
            Upload Resource
          </button>
        </div>

        {/* Stats chips */}
        <div className="flex gap-3 mt-5 flex-wrap">
          {[
            { label: "Total Resources", val: resources.length, color: "#a855f7" },
            { label: "PYQs", val: counts.PYQ, color: "#7c3aed" },
            { label: "Notes", val: counts.NOTES, color: "#06b6d4" },
            { label: "Assignments", val: counts.ASSIGNMENT, color: "#ec4899" },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: `${s.color}12`, border: `1px solid ${s.color}25` }}>
              <span className="text-sm font-black" style={{ color: s.color }}>{s.val}</span>
              <span className="text-xs" style={{ color: "#8b8ba7" }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* === SEARCH + FILTERS === */}
      <div className="animate-fade-in-up delay-200 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div
          className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl flex-1 min-w-[220px] max-w-sm transition-all duration-300"
          style={{
            background: "rgba(10,10,10,0.6)",
            border: searchFocused ? "1px solid rgba(233,213,255,0.4)" : "1px solid rgba(255,255,255,0.05)",
            boxShadow: searchFocused ? "0 0 0 3px rgba(233,213,255,0.1), 0 0 20px rgba(233,213,255,0.2)" : "none",
          }}
        >
          <Search className="h-4 w-4 shrink-0" style={{ color: "#8b8ba7" }} />
          <input
            type="text"
            placeholder="Search by title or course code..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="bg-transparent text-sm outline-none flex-1"
            style={{ color: "#f4f4f8", caretColor: "#E9D5FF" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-xs" style={{ color: "#8b8ba7" }}>✕</button>
          )}
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2">
          <Filter className="h-3.5 w-3.5" style={{ color: "#8b8ba7" }} />
          {[
            { key: null, label: "All" },
            { key: "PYQ", label: "PYQ" },
            { key: "NOTES", label: "Notes" },
            { key: "ASSIGNMENT", label: "Assignments" },
          ].map(f => {
            const isActive = f.key === activeType;
            const conf = f.key ? TYPE_CONFIG[f.key] : null;
            return (
              <button
                key={f.key ?? "all"}
                onClick={() => setActiveType(f.key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                style={{
                  background: isActive
                    ? (conf ? `${conf.color}20` : "rgba(255,255,255,0.1)")
                    : "rgba(10,10,10,0.6)",
                  color: isActive ? (conf?.color || "#f4f4f8") : "#8b8ba7",
                  border: isActive
                    ? `1px solid ${conf?.color || "rgba(255,255,255,0.2)"}50`
                    : "1px solid rgba(255,255,255,0.05)",
                  boxShadow: isActive && conf ? `0 0 10px ${conf.color}30` : "none",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* === RESOURCE GRID === */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} />)}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl animate-float bg-pastel-lavender/10 border border-pastel-lavender/20">
            <BookOpen className="h-8 w-8 text-pastel-lavender" />
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: "#f4f4f8" }}>No resources found</p>
            <p className="text-sm mt-1" style={{ color: "#8b8ba7" }}>
              {search ? `No results for "${search}"` : "Be the first to upload a resource!"}
            </p>
          </div>
          <button className="text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 bg-white/5 text-pastel-lavender hover:bg-pastel-lavender/10 border border-white/5 hover:border-pastel-lavender/30"
            onClick={() => { setSearch(""); setActiveType(null); }}>
            Clear filters
          </button>
        </div>
      )}

      {/* Upload Resource Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-neutral-800 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(233,213,255,0.15)]">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Upload Resource</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                  placeholder="e.g. EndSem Notes 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Course Code</label>
                  <input
                    type="text"
                    required
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] transition-colors uppercase"
                    placeholder="e.g. CS101"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] transition-colors appearance-none"
                  >
                    <option value="NOTES">Notes</option>
                    <option value="PYQ">PYQ</option>
                    <option value="ASSIGNMENT">Assignment</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors min-h-[80px] resize-none"
                  placeholder="Additional context or topics covered..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">File (PDF/Image)</label>
                <div className="relative border-2 border-dashed border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center text-neutral-500 hover:border-pastel-lavender hover:bg-pastel-lavender/5 transition-colors cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    required
                    accept="application/pdf,image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {selectedFile ? (
                    <div className="text-sm font-medium text-pastel-lavender truncate max-w-full px-4">
                      {selectedFile.name}
                    </div>
                  ) : (
                    <>
                      <FileText className="h-8 w-8 mb-2" />
                      <span className="text-sm font-medium">Click to upload file</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-pastel-lavender hover:bg-pastel-lavender/90"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploading ? "Uploading File..." : "Publishing..."}
                  </>
                ) : (
                  "Upload Resource"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
