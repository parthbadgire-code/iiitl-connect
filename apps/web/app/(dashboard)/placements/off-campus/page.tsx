"use client";

import { useState, useEffect } from "react";
import { MinimalParticles } from "@/components/ui/MinimalParticles";
import { Globe, Plus, Building, MapPin, Calendar, ExternalLink, User } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { format, isPast, isToday } from "date-fns";

type Opportunity = {
  id: string;
  title: string;
  company: string;
  role: string;
  link: string;
  deadline: string | null;
  createdAt: string;
  postedBy: { name: string; image: string | null };
};

export default function OffCampusPage() {
  const { data: session } = useSession();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    role: "",
    link: "",
    deadline: ""
  });

  const fetchOpportunities = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/off-campus`, {
        headers: { "Authorization": `Bearer ${session?.session?.token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOpportunities(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) fetchOpportunities();
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/off-campus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.session?.token}`
        },
        body: JSON.stringify({
          ...formData,
          deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: "", company: "", role: "", link: "", deadline: "" });
        fetchOpportunities();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <MinimalParticles />
      <div className="mx-auto max-w-6xl p-4 md:p-8 relative z-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pastel-mint/10 rounded-xl text-pastel-mint border border-pastel-mint/20">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Off-Campus Opportunities</h1>
              <p className="text-neutral-400">Track openings and deadline reminders.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pastel-mint to-pastel-blue text-black font-semibold rounded-xl hover:scale-105 transition-transform"
          >
            <Plus className="h-5 w-5" />
            Post Opportunity
          </button>
        </div>

        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mt-12">
            <p className="text-neutral-400">Loading opportunities...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            {opportunities.map((opp) => {
              const isDeadlinePast = opp.deadline && isPast(new Date(opp.deadline)) && !isToday(new Date(opp.deadline));
              
              return (
                <div key={opp.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-white/10 rounded-lg p-2 border border-white/5">
                        <Building className="h-6 w-6 text-pastel-mint" />
                      </div>
                      {opp.deadline && (
                        <div className={`text-xs font-medium px-2 py-1 rounded-md border ${isDeadlinePast ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-pastel-yellow/10 text-pastel-yellow border-pastel-yellow/20"}`}>
                          {isDeadlinePast ? "Expired" : `Due ${format(new Date(opp.deadline), "MMM d")}`}
                        </div>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{opp.title}</h3>
                    <p className="text-pastel-blue font-medium mb-4">{opp.company}</p>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <MapPin className="h-4 w-4" />
                        <span>{opp.role}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-400">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {format(new Date(opp.createdAt), "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {opp.postedBy.image ? (
                          <img src={opp.postedBy.image} alt={opp.postedBy.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-3 h-3 text-white/50" />
                        )}
                      </div>
                      <span className="text-xs text-neutral-500">{opp.postedBy.name}</span>
                    </div>
                    <a 
                      href={opp.link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm font-medium text-white hover:text-pastel-mint transition-colors"
                    >
                      Apply <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              );
            })}
            {opportunities.length === 0 && (
              <div className="col-span-full p-8 text-center text-neutral-400 bg-white/5 rounded-2xl border border-white/10">
                No opportunities posted yet. Be the first to share!
              </div>
            )}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Post Opportunity</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-mint/50"
                  placeholder="e.g. Software Engineering Intern"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-mint/50"
                    placeholder="e.g. Google"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">Role Type</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-mint/50"
                    placeholder="e.g. SDE-1, Intern"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Application Link</label>
                <input
                  type="url"
                  required
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-mint/50"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Deadline (Optional)</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-mint/50"
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
                  className="flex-1 py-3 bg-gradient-to-r from-pastel-mint to-pastel-blue text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
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
