"use client";

import { useEffect, useState } from "react";
import { Download, BookOpen, FileText, ClipboardList, Filter, Search, Upload } from "lucide-react";

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

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType; badge: string }> = {
  PYQ: { label: "PYQ", color: "#7c3aed", icon: FileText, badge: "badge-pyq" },
  NOTES: { label: "Notes", color: "#06b6d4", icon: BookOpen, badge: "badge-notes" },
  ASSIGNMENT: { label: "Assignment", color: "#ec4899", icon: ClipboardList, badge: "badge-assignment" },
};

function SkeletonCard() {
  return (
    <div className="rounded-2xl p-5 space-y-4" style={{ background: "rgba(13,13,20,0.7)", border: "1px solid rgba(255,255,255,0.06)" }}>
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
  const Icon = typeConf.icon;
  const timeAgo = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "Recently";

  return (
    <div
      className="glass-card group rounded-2xl p-5 flex flex-col gap-4 animate-fade-in-up"
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
        <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-1 rounded-full ${typeConf.badge}`}>
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
          <div className="h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold"
            style={{ background: "linear-gradient(135deg, #7c3aed, #06b6d4)", color: "#fff" }}>
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
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
          style={{ background: "rgba(124,58,237,0.15)", color: "#a855f7", border: "1px solid rgba(124,58,237,0.25)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.25)";
            (e.currentTarget as HTMLElement).style.boxShadow = "0 0 12px rgba(124,58,237,0.3)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(124,58,237,0.15)";
            (e.currentTarget as HTMLElement).style.boxShadow = "none";
          }}
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

  const counts = { PYQ: 0, NOTES: 0, ASSIGNMENT: 0 };
  resources.forEach(r => { if (r.type in counts) (counts as Record<string, number>)[r.type]++; });

  return (
    <div className="space-y-8 max-w-7xl">

      {/* === HERO HEADER === */}
      <div className="animate-fade-in-up">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-1 w-6 rounded-full" style={{ background: "linear-gradient(90deg, #7c3aed, #06b6d4)" }} />
              <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: "#8b8ba7" }}>
                Community Resources
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tight leading-none" style={{ color: "#f4f4f8" }}>
              Academic{" "}
              <span className="gradient-text">Hub</span>
            </h1>
            <p className="text-sm" style={{ color: "#8b8ba7" }}>
              PYQs, lecture notes, and assignments — uploaded by IIITL students, for IIITL students.
            </p>
          </div>

          {/* Upload button */}
          <button
            className="btn-shimmer flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              color: "#fff",
              border: "1px solid rgba(124,58,237,0.4)",
              boxShadow: "0 4px 15px rgba(124,58,237,0.25)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 0 20px rgba(124,58,237,0.4), 0 4px 15px rgba(124,58,237,0.25)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 15px rgba(124,58,237,0.25)";
            }}
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
            background: "rgba(13,13,20,0.8)",
            border: searchFocused ? "1px solid rgba(124,58,237,0.4)" : "1px solid rgba(255,255,255,0.06)",
            boxShadow: searchFocused ? "0 0 0 3px rgba(124,58,237,0.08), 0 0 20px rgba(124,58,237,0.15)" : "none",
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
            style={{ color: "#f4f4f8", caretColor: "#a855f7" }}
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
                    : "rgba(13,13,20,0.8)",
                  color: isActive ? (conf?.color || "#f4f4f8") : "#8b8ba7",
                  border: isActive
                    ? `1px solid ${conf?.color || "rgba(255,255,255,0.2)"}50`
                    : "1px solid rgba(255,255,255,0.06)",
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
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl animate-float"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <BookOpen className="h-8 w-8" style={{ color: "#7c3aed" }} />
          </div>
          <div className="text-center">
            <p className="font-semibold" style={{ color: "#f4f4f8" }}>No resources found</p>
            <p className="text-sm mt-1" style={{ color: "#8b8ba7" }}>
              {search ? `No results for "${search}"` : "Be the first to upload a resource!"}
            </p>
          </div>
          <button className="text-sm font-semibold px-4 py-2 rounded-lg"
            style={{ background: "rgba(124,58,237,0.1)", color: "#a855f7", border: "1px solid rgba(124,58,237,0.2)" }}
            onClick={() => { setSearch(""); setActiveType(null); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
