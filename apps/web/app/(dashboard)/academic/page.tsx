"use client";

import { useEffect, useState } from "react";
import { Download, BookOpen, FileText, ClipboardList, Filter, Search, Upload, X, Loader2, Eye, Edit2, Trash2 } from "lucide-react";
import { uploadFileToR2 } from "@/lib/upload";
import { useSession } from "@/lib/auth-client";


type StudyResource = {
  id: string;
  title: string;
  courseCode: string;
  semester: number;
  type: string;
  examType?: string;
  year?: number;
  description?: string;
  url?: string;
  uploaderId?: string;
  uploader?: { name: string; email: string };
  createdAt?: string;
};

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PYQ: { label: "PYQ", color: "#FFDAB9", icon: FileText },
  NOTES: { label: "Notes", color: "#E9D5FF", icon: BookOpen },
  ASSIGNMENT: { label: "Assignment", color: "#A7F3D0", icon: ClipboardList },
};

const SUBJECTS_BY_SEMESTER: Record<string, string[]> = {
  "1": [
    "Computational Thinking through Programming",
    "Database Management System",
    "System Programming & Scripting",
    "Web Design & Application Development-I",
    "Professional Communication - I",
    "Sports - I"
  ],
  "2": [
    "Object Oriented Programming & System Design",
    "Data Structures",
    "Computer Organization & Architecture",
    "Web Design & Application Development-II",
    "Professional Communication - II",
    "Sports - II"
  ],
  "3": [
    "Software Engineering",
    "Theory of Automata",
    "Data Communications",
    "Probability and Statistics for CS",
    "Design Analysis and Algorithm",
    "Competitive Coding - I",
    "Sports - III"
  ],
  "4": [
    "Compiler Design",
    "Mathematics for CS I (Discrete Mathematics)",
    "Operating System",
    "Computer Networks",
    "Advanced Programming Language",
    "Competitive Coding - II"
  ],
  "5": [],
  "6": [],
  "7": [],
  "8": []
};

function SkeletonCard() {
  return (
    <div className="rounded-3xl p-6 space-y-4 bg-black/40 backdrop-blur-xl border border-white/5 flex flex-col h-[280px]">
      <div className="flex justify-between items-start">
        <div className="skeleton h-10 w-10 rounded-2xl" />
        <div className="skeleton h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-3 flex-1 mt-4">
        <div className="skeleton h-5 w-full rounded-lg" />
        <div className="skeleton h-5 w-3/4 rounded-lg" />
      </div>
      <div className="flex gap-2 mb-4">
        <div className="skeleton h-5 w-16 rounded-md" />
        <div className="skeleton h-5 w-16 rounded-md" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-white/5">
        <div className="skeleton h-4 w-24 rounded" />
        <div className="skeleton h-8 w-24 rounded-xl" />
      </div>
    </div>
  );
}

function ResourceCard({ resource, index, session, onEdit, onDelete }: { resource: StudyResource; index: number; session: { user?: { role?: string; id?: string } } | null; onEdit: (r: StudyResource) => void; onDelete: (id: string) => void }) {
  const typeConf = TYPE_CONFIG[resource.type] || TYPE_CONFIG.NOTES;
  const Icon = typeConf.icon as React.ElementType<{ className?: string; style?: React.CSSProperties }>;
  const timeAgo = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
    : "Recently";

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!resource.url) return;
    try {
      const response = await fetch(resource.url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = resource.title || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Download failed, falling back to new tab", error);
      window.open(resource.url, '_blank');
    }
  };

  return (
    <div
      className="group relative overflow-hidden rounded-3xl p-6 flex flex-col h-[280px] animate-fade-in-up bg-[#0A0A0A]/80 backdrop-blur-2xl border transition-all duration-500 hover:-translate-y-1 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      style={{
        animationDelay: `${index * 50}ms`,
        animationFillMode: "both",
        opacity: 0,
        borderColor: "rgba(255,255,255,0.08)",
      }}
    >
      {/* Dynamic Hover Gradient Border */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `linear-gradient(120deg, transparent, ${typeConf.color}20, transparent)`,
          padding: '1px',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
        }}
      />

      {/* Decorative Background Icon */}
      <Icon className="absolute -right-6 -top-6 h-32 w-32 opacity-[0.03] transform -rotate-12 group-hover:scale-110 group-hover:rotate-0 transition-transform duration-700 pointer-events-none" style={{ color: typeConf.color }} />

      {/* Card Header */}
      <div className="flex justify-between items-start gap-3 relative z-10">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
          style={{ background: `linear-gradient(135deg, ${typeConf.color}20, ${typeConf.color}05)`, border: `1px solid ${typeConf.color}30` }}>
          <Icon className="h-5 w-5 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]" style={{ color: typeConf.color }} />
        </div>
        
        {/* Type Badge */}
        <span className="shrink-0 text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-full border shadow-sm"
          style={{ background: `${typeConf.color}15`, color: typeConf.color, borderColor: `${typeConf.color}40` }}>
          {typeConf.label}
        </span>
      </div>

      {/* Title & Description */}
      <div className="mt-5 flex-1 relative z-10 flex flex-col min-h-0">
        <h3 className="text-base font-bold leading-snug line-clamp-2 text-white group-hover:text-pastel-lavender transition-colors">
          {resource.title}
        </h3>
        <p className="text-xs line-clamp-2 mt-2" style={{ color: "#8b8ba7" }}>
          {resource.description || "Community-contributed study material."}
        </p>
      </div>

      {/* Metadata Pills */}
      <div className="flex items-center flex-wrap gap-1.5 mt-auto mb-4 relative z-10">
        <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-lg"
          style={{ background: "rgba(255,255,255,0.06)", color: "#c0c0d1" }}>
          {resource.courseCode}
        </span>
        <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-lg"
          style={{ background: "rgba(255,255,255,0.06)", color: "#c0c0d1" }}>
          Sem {resource.semester}
        </span>
        {resource.type === "PYQ" && resource.examType && resource.year && (
          <span className="text-[10px] font-mono font-semibold px-2 py-1 rounded-lg"
            style={{ background: "rgba(255,255,255,0.06)", color: "#c0c0d1" }}>
            {resource.examType === "MIDSEM" ? "Midsem" : "Endsem"} &apos;{resource.year.toString().slice(-2)}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col gap-3 pt-4 border-t relative z-10" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        {/* Name and Date */}
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-black shadow-sm"
            style={{ background: `linear-gradient(135deg, ${typeConf.color}30, ${typeConf.color}10)`, color: typeConf.color, border: `1px solid ${typeConf.color}40` }}>
            {resource.uploader?.name?.charAt(0) || "?"}
          </div>
          <span className="text-[11px] font-medium" style={{ color: "#e2e2e8" }}>
            {resource.uploader?.name || "Anonymous"} <span className="mx-1.5 opacity-50">•</span> <span style={{ color: "#6a6a8a" }}>{timeAgo}</span>
          </span>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2">
          {resource.url && (
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center h-8 w-8 rounded-xl text-neutral-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20"
              title="Preview"
            >
              <Eye className="h-3.5 w-3.5" />
            </a>
          )}
          
          <button
            onClick={handleDownload}
            disabled={!resource.url}
            className="flex items-center justify-center h-8 w-8 rounded-xl text-black transition-all shadow-sm hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] disabled:opacity-50"
            style={{ background: typeConf.color }}
            title="Download"
          >
            <Download className="h-3.5 w-3.5" /> 
          </button>
          
          {session?.user && (session.user.role === 'SUPER_ADMIN' || session.user.id === resource.uploaderId) && (
            <>
              <div className="w-px h-4 bg-white/10 mx-1" />
              <button
                onClick={() => onEdit(resource)}
                className="flex items-center justify-center h-8 w-8 rounded-xl text-neutral-400 hover:text-white transition-all bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20"
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => {
                  if (confirm("Are you sure you want to delete this resource?")) {
                    onDelete(resource.id);
                  }
                }}
                className="flex items-center justify-center h-8 w-8 rounded-xl text-red-400/70 hover:text-red-400 transition-all bg-red-400/5 hover:bg-red-400/10 border border-transparent hover:border-red-400/30"
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AcademicHubPage() {
  const { data: session } = useSession();
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterSemester, setFilterSemester] = useState<string | null>(null);
  const [filterSubject, setFilterSubject] = useState<string | null>(null);

  // Upload State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState(SUBJECTS_BY_SEMESTER["1"][0]);
  const [semester, setSemester] = useState("1");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("NOTES");
  const [examType, setExamType] = useState("MIDSEM");
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editResourceId, setEditResourceId] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/academic/resources/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setResources(prev => prev.filter(r => r.id !== id));
      } else {
        const data = await res.json();
        alert(data.message || "Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete resource");
    }
  };

  const handleEditOpen = (r: StudyResource) => {
    setEditResourceId(r.id);
    setTitle(r.title);
    setCourseCode(r.courseCode);
    setSemester(r.semester.toString());
    setDescription(r.description || "");
    setType(r.type);
    if (r.type === "PYQ" && r.examType) setExamType(r.examType);
    if (r.type === "PYQ" && r.year) setYear(r.year.toString());
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editResourceId || !title || !courseCode) return;

    setEditSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/academic/resources/${editResourceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          courseCode,
          semester: parseInt(semester, 10),
          description,
          type,
          examType: type === "PYQ" ? examType : undefined,
          year: type === "PYQ" ? parseInt(year, 10) : undefined,
        }),
      });

      if (res.ok) {
        setIsEditModalOpen(false);
        setEditResourceId(null);
        setTitle("");
        setDescription("");
        
        // refresh list
        const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/academic/resources`, { credentials: "include" });
        if (refreshed.ok) setResources(await refreshed.json());
      } else {
        const data = await res.json();
        alert(data.message || "Failed to update resource");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update resource");
    } finally {
      setEditSubmitting(false);
    }
  };

  useEffect(() => {
    async function fetchResources() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/academic/resources`, { credentials: "include" });
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
    const matchSem = !filterSemester || r.semester.toString() === filterSemester;
    const matchSubj = !filterSubject || r.courseCode === filterSubject;
    return matchSearch && matchType && matchSem && matchSubj;
  });

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseCode || !selectedFile) return;

    setSubmitting(true);
    try {
      setUploading(true);
      const fileUrl = await uploadFileToR2(selectedFile);
      setUploading(false);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/academic/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          courseCode,
          semester: parseInt(semester, 10),
          description,
          type,
          examType: type === "PYQ" ? examType : undefined,
          year: type === "PYQ" ? parseInt(year, 10) : undefined,
          fileUrl,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setSemester("1");
        setCourseCode(SUBJECTS_BY_SEMESTER["1"][0] || "");
        setDescription("");
        setType("NOTES");
        setExamType("MIDSEM");
        setYear(new Date().getFullYear().toString());
        setSelectedFile(null);
        // refresh list
        const refreshed = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/academic/resources`, { credentials: "include" });
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
        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
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

          <div className="h-4 w-px bg-white/10 hidden md:block" />

          {/* Semester Filter */}
          <select 
            value={filterSemester || ""} 
            onChange={(e) => {
              setFilterSemester(e.target.value || null);
              setFilterSubject(null); // Reset subject when sem changes
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold outline-none transition-all border cursor-pointer hover:border-white/20"
            style={{ background: "rgba(10,10,10,0.6)", color: "#f4f4f8", borderColor: "rgba(255,255,255,0.1)" }}
          >
            <option value="">All Semesters</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s.toString()}>Semester {s}</option>)}
          </select>

          {/* Subject Filter */}
          {filterSemester && SUBJECTS_BY_SEMESTER[filterSemester]?.length > 0 && (
            <select 
              value={filterSubject || ""} 
              onChange={(e) => setFilterSubject(e.target.value || null)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold outline-none transition-all border max-w-[200px] truncate cursor-pointer hover:border-white/20"
              style={{ background: "rgba(10,10,10,0.6)", color: "#f4f4f8", borderColor: "rgba(255,255,255,0.1)" }}
            >
              <option value="">All Subjects</option>
              {SUBJECTS_BY_SEMESTER[filterSemester].map(sub => <option key={sub} value={sub}>{sub}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* === RESOURCE GRID === */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((r, i) => <ResourceCard key={r.id} resource={r} index={i} session={session} onDelete={handleDelete} onEdit={handleEditOpen} />)}
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
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Name of Resource</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                  placeholder="e.g. Complete DSA Notes"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => {
                      const newSem = e.target.value;
                      setSemester(newSem);
                      const subjects = SUBJECTS_BY_SEMESTER[newSem];
                      if (subjects && subjects.length > 0) {
                        setCourseCode(subjects[0]);
                      } else {
                        setCourseCode("");
                      }
                    }}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] transition-colors appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Subject</label>
                  {SUBJECTS_BY_SEMESTER[semester] && SUBJECTS_BY_SEMESTER[semester].length > 0 ? (
                    <select
                      required
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] transition-colors appearance-none"
                    >
                      <option value="" disabled>Select a subject</option>
                      {SUBJECTS_BY_SEMESTER[semester].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] transition-colors"
                      placeholder="e.g. OS, DBMS, CS101"
                    />
                  )}
                </div>
                <div className="space-y-1 md:col-span-1 col-span-2">
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

              {type === "PYQ" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Exam Type</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                    >
                      <option value="MIDSEM">Midsem</option>
                      <option value="ENDSEM">Endsem</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Year</label>
                    <input
                      type="number"
                      required
                      min="2010"
                      max="2030"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      placeholder="e.g. 2024"
                    />
                  </div>
                </div>
              )}

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
      {/* Edit Resource Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-neutral-800 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(233,213,255,0.15)]">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">Edit Resource</h2>
              <button onClick={() => { setIsEditModalOpen(false); setEditResourceId(null); }} className="text-neutral-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Name of Resource</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-lavender transition-colors"
                  placeholder="e.g. Complete DSA Notes"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => {
                      const newSem = e.target.value;
                      setSemester(newSem);
                      const subjects = SUBJECTS_BY_SEMESTER[newSem];
                      if (subjects && subjects.length > 0) {
                        setCourseCode(subjects[0]);
                      } else {
                        setCourseCode("");
                      }
                    }}
                    className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] transition-colors appearance-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Subject</label>
                  {SUBJECTS_BY_SEMESTER[semester] && SUBJECTS_BY_SEMESTER[semester].length > 0 ? (
                    <select
                      required
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] transition-colors appearance-none"
                    >
                      <option value="" disabled>Select a subject</option>
                      {SUBJECTS_BY_SEMESTER[semester].map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#7c3aed] transition-colors"
                      placeholder="e.g. OS, DBMS, CS101"
                    />
                  )}
                </div>
                <div className="space-y-1 md:col-span-1 col-span-2">
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

              {type === "PYQ" && (
                <div className="grid grid-cols-2 gap-4 animate-in fade-in zoom-in-95 duration-200">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Exam Type</label>
                    <select
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors appearance-none"
                    >
                      <option value="MIDSEM">Midsem</option>
                      <option value="ENDSEM">Endsem</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Year</label>
                    <input
                      type="number"
                      required
                      min="2010"
                      max="2030"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      placeholder="e.g. 2024"
                    />
                  </div>
                </div>
              )}

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

              <button
                type="submit"
                disabled={editSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-black disabled:opacity-50 disabled:cursor-not-allowed transition-all bg-pastel-lavender hover:bg-pastel-lavender/90"
              >
                {editSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
