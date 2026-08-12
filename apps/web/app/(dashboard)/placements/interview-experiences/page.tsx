"use client";

import { useState, useEffect } from "react";
import { MinimalParticles } from "@/components/ui/MinimalParticles";
import { BookOpen, Plus, Search, Building, User, Calendar, Star, HelpCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { format } from "date-fns";

type InterviewExperience = {
  id: string;
  role: string;
  year: number;
  difficultyRating: number;
  oaQuestions: string[];
  interviewRounds: number | null;
  content: string;
  createdAt: string;
  company: { name: string; logo: string | null };
  user: { name: string; image: string | null } | null;
  anonymousIdentity: { avatarSeed: string } | null;
};

export default function InterviewExperiencesPage() {
  const { data: session } = useSession();
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    companyId: "",
    role: "",
    year: new Date().getFullYear(),
    difficultyRating: 3,
    oaQuestions: "",
    interviewRounds: "",
    content: "",
    postAnonymously: false
  });
  
  const [companies, setCompanies] = useState<{id: string, name: string}[]>([]);

  const fetchExperiences = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/interview-experiences`, {
        headers: { "Authorization": `Bearer ${session?.session?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setExperiences(data);
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
      fetchExperiences();
      fetchCompanies();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const oaQuestionsArray = formData.oaQuestions.split(",").map(t => t.trim()).filter(Boolean);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/interview-experiences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.session?.token}`
        },
        body: JSON.stringify({
          companyId: formData.companyId,
          role: formData.role,
          year: Number(formData.year),
          difficultyRating: Number(formData.difficultyRating),
          oaQuestions: oaQuestionsArray,
          interviewRounds: formData.interviewRounds ? Number(formData.interviewRounds) : null,
          content: formData.content,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          anonymousIdentityId: formData.postAnonymously && (session?.user as any)?.anonymousIdentity ? (session?.user as any).anonymousIdentity.id : null
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ companyId: "", role: "", year: new Date().getFullYear(), difficultyRating: 3, oaQuestions: "", interviewRounds: "", content: "", postAnonymously: false });
        fetchExperiences();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const filteredExperiences = experiences.filter(exp => 
    exp.role.toLowerCase().includes(searchQuery.toLowerCase()) || 
    exp.company.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <MinimalParticles />
      <div className="mx-auto max-w-6xl p-4 md:p-8 relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pastel-blue/10 rounded-xl text-pastel-blue border border-pastel-blue/20">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Interview Experiences</h1>
              <p className="text-neutral-400">Read and share experiences by company and role.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pastel-blue to-pastel-lavender text-black font-semibold rounded-xl hover:scale-105 transition-transform"
          >
            <Plus className="h-5 w-5" />
            Share Experience
          </button>
        </div>

        <div className="relative max-w-xl mt-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search by company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-pastel-blue/50 transition-colors"
          />
        </div>

        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mt-8">
            <p className="text-neutral-400">Loading experiences...</p>
          </div>
        ) : (
          <div className="space-y-6 mt-8">
            {filteredExperiences.map((exp) => (
              <div key={exp.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 hover:border-white/20 transition-all">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-white/10 rounded border border-white/5">
                        <Building className="h-5 w-5 text-pastel-blue" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">{exp.company.name}</h2>
                      <span className="bg-pastel-blue/10 text-pastel-blue px-3 py-1 rounded-full text-sm font-medium border border-pastel-blue/20">
                        {exp.year}
                      </span>
                    </div>
                    <h3 className="text-lg text-neutral-300 font-medium ml-12">{exp.role}</h3>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center text-pastel-yellow bg-pastel-yellow/10 px-2 py-1 rounded border border-pastel-yellow/20 text-sm font-bold">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        {exp.difficultyRating}/5 Difficulty
                      </div>
                      {exp.interviewRounds && (
                        <div className="text-sm font-medium text-pastel-mint bg-pastel-mint/10 px-2 py-1 rounded border border-pastel-mint/20">
                          {exp.interviewRounds} Rounds
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-xl p-6 border border-white/5 mb-6 text-neutral-300 whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                  {exp.content}
                </div>

                {exp.oaQuestions && exp.oaQuestions.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 text-pastel-yellow" />
                      OA Questions Asked
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {exp.oaQuestions.map((q, idx) => (
                        <span key={idx} className="bg-white/5 text-neutral-300 text-sm px-3 py-1.5 rounded-lg border border-white/10">
                          {q}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                      {exp.user ? (
                        exp.user.image ? <img src={exp.user.image} alt="User" /> : <User className="w-4 h-4 text-white/50" />
                      ) : (
                        <img src={`https://api.dicebear.com/7.x/bottts/svg?seed=${exp.anonymousIdentity?.avatarSeed}`} alt="Anon" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-neutral-400">
                      {exp.user ? exp.user.name : "Anonymous"}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(exp.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            ))}
            {filteredExperiences.length === 0 && (
              <div className="p-8 text-center text-neutral-400 bg-white/5 rounded-2xl border border-white/10">
                No experiences found. Be the first to share one!
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-white mb-6">Share Interview Experience</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Company</label>
                  {companies.length > 0 ? (
                    <select
                      required
                      value={formData.companyId}
                      onChange={(e) => setFormData({...formData, companyId: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue/50 appearance-none"
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
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue/50"
                      placeholder="Company ID"
                    />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Role</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue/50"
                    placeholder="e.g. SDE Intern"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Year</label>
                  <input
                    type="number"
                    required
                    min={2020}
                    max={2030}
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Difficulty (1-5)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={5}
                    value={formData.difficultyRating}
                    onChange={(e) => setFormData({...formData, difficultyRating: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Rounds</label>
                  <input
                    type="number"
                    min={1}
                    value={formData.interviewRounds}
                    onChange={(e) => setFormData({...formData, interviewRounds: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue/50"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">OA Questions (comma separated)</label>
                <input
                  type="text"
                  value={formData.oaQuestions}
                  onChange={(e) => setFormData({...formData, oaQuestions: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue/50"
                  placeholder="e.g. Graph Traversal, DP on Trees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Experience Details</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  rows={8}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-blue/50"
                  placeholder="Share your interview rounds, questions asked, and tips..."
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="postAnonymously"
                  checked={formData.postAnonymously}
                  onChange={(e) => setFormData({...formData, postAnonymously: e.target.checked})}
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-pastel-blue focus:ring-pastel-blue/50"
                />
                <label htmlFor="postAnonymously" className="text-sm text-neutral-300">
                  Post anonymously
                </label>
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
                  className="flex-1 py-3 bg-gradient-to-r from-pastel-blue to-pastel-lavender text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Share
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
