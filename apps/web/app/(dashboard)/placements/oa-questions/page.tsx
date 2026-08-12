"use client";

import { useState, useEffect } from "react";
import { MinimalParticles } from "@/components/ui/MinimalParticles";
import { Briefcase, Plus, Search, Tag, ExternalLink, User } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { format } from "date-fns";

type OAQuestion = {
  id: string;
  title: string;
  company: { name: string; logo: string | null };
  difficulty: "EASY" | "MEDIUM" | "HARD";
  topics: string[];
  description: string;
  link: string | null;
  createdAt: string;
  postedBy: { name: string; image: string | null };
};

export default function OAQuestionsPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<OAQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    companyId: "", // Since I don't have a company select built yet, I will use a simple text input and create companies or expect companyIds for now. Wait, I should probably just fetch companies.
    difficulty: "MEDIUM",
    topics: "",
    description: "",
    link: ""
  });
  
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/oa-questions`, {
        headers: { "Authorization": `Bearer ${session?.session?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/database/companies`, {
        headers: { "Authorization": `Bearer ${session?.session?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (session) {
      fetchQuestions();
      fetchCompanies(); // Assumes a generic companies endpoint exists, else we can fall back.
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const topicsArray = formData.topics.split(",").map(t => t.trim()).filter(Boolean);
      
      const payload: Record<string, unknown> = {
        ...formData,
        topics: topicsArray,
      };
      if (!payload.link) delete payload.link;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/oa-questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.session?.token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: "", companyId: "", difficulty: "MEDIUM", topics: "", description: "", link: "" });
        fetchQuestions();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredQuestions = questions.filter(q => 
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    q.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case "EASY": return "text-pastel-mint bg-pastel-mint/10 border-pastel-mint/20";
      case "MEDIUM": return "text-pastel-yellow bg-pastel-yellow/10 border-pastel-yellow/20";
      case "HARD": return "text-red-400 bg-red-500/10 border-red-500/20";
      default: return "text-white bg-white/10 border-white/20";
    }
  };

  return (
    <>

      <MinimalParticles />
      <div className="mx-auto max-w-6xl p-4 md:p-8 relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pastel-yellow/10 rounded-xl text-pastel-yellow border border-pastel-yellow/20">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">OA Question Bank</h1>
              <p className="text-neutral-400">Coding questions tagged by company and difficulty.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pastel-yellow to-pastel-mint text-black font-semibold rounded-xl hover:scale-105 transition-transform"
          >
            <Plus className="h-5 w-5" />
            Add Question
          </button>
        </div>

        <div className="relative max-w-xl mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by company, topic, or title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-pastel-yellow/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mt-8">
            <p className="text-neutral-400">Loading questions...</p>
          </div>
        ) : (
          <div className="space-y-4 mt-8">
            {filteredQuestions.map((q) => (
              <div key={q.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-full text-sm">
                      {q.company.name}
                    </span>
                    <h3 className="text-xl font-semibold text-white">{q.title}</h3>
                  </div>
                  
                  <p className="text-sm text-neutral-300 line-clamp-2">{q.description}</p>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-medium px-2 py-1 rounded border ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty}
                    </span>
                    {q.topics.map((t, idx) => (
                      <span key={idx} className="flex items-center gap-1 text-xs text-neutral-400 bg-black/50 px-2 py-1 rounded border border-white/5">
                        <Tag className="w-3 h-3" /> {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-4 shrink-0 w-full md:w-auto">
                  {q.link && (
                    <a 
                      href={q.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full md:w-auto text-center px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      Solve <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                      {q.postedBy.image ? (
                        <img src={q.postedBy.image} alt={q.postedBy.name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3 h-3 text-white/50" />
                      )}
                    </div>
                    <span className="text-xs text-neutral-500">{format(new Date(q.createdAt), "MMM d, yyyy")}</span>
                  </div>
                </div>
              </div>
            ))}
            {filteredQuestions.length === 0 && (
              <div className="p-8 text-center text-neutral-400 bg-white/5 rounded-2xl border border-white/10">
                No questions found.
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Add OA Question</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-yellow/50"
                  placeholder="e.g. Find Max Subarray"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Company</label>
                  {companies.length > 0 ? (
                    <select
                      required
                      value={formData.companyId}
                      onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-yellow/50 appearance-none"
                    >
                      <option value="">Select Company</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  ) : (
                    <input
                      type="text"
                      required
                      value={formData.companyId}
                      onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-yellow/50"
                      placeholder="Company Name"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-yellow/50 appearance-none"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Topics (comma separated)</label>
                <input
                  type="text"
                  value={formData.topics}
                  onChange={(e) => setFormData({...formData, topics: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-yellow/50"
                  placeholder="Arrays, DP, Graphs"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Description / Problem Statement</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-yellow/50"
                  placeholder="Describe the problem..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Platform Link (Optional)</label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-yellow/50"
                  placeholder="https://leetcode.com/..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-pastel-yellow to-pastel-mint text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
