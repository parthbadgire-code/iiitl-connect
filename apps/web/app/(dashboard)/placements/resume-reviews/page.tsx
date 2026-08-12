"use client";

import { useState, useEffect } from "react";
import { MinimalParticles } from "@/components/ui/MinimalParticles";
import { FileText, Plus, CheckCircle, Clock, Link as LinkIcon, User, MessageCircle } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { format } from "date-fns";

type ResumeRequest = {
  id: string;
  resumeUrl: string;
  status: "PENDING" | "REVIEWED";
  feedback: string | null;
  rating: number | null;
  createdAt: string;
  requester: { name: string; email: string; image: string | null };
  reviewer: { name: string; email: string; image: string | null } | null;
};

export default function ResumeReviewsPage() {
  const { data: session } = useSession();
  const [requests, setRequests] = useState<ResumeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [selectedRequest, setSelectedRequest] = useState<ResumeRequest | null>(null);

  const isEligibleReviewer = session?.user?.email 
    ? /^.+?(2023|2024).*?@iiitl\.ac\.in$/i.test(session.user.email) 
    : false;

  const fetchRequests = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/resume-reviews`, {
        headers: {
          "Authorization": `Bearer ${session?.session?.token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchRequests();
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/resume-reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.session?.token}`
        },
        body: JSON.stringify({ resumeUrl })
      });
      if (res.ok) {
        setIsSubmitModalOpen(false);
        setResumeUrl("");
        fetchRequests();
      } else {
        const errorData = await res.json().catch(() => ({ message: "Unknown error" }));
        alert(`Error: ${errorData.message || JSON.stringify(errorData)}`);
      }
    } catch (error) {
      console.error(error);
      alert("Network error");
    }
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !reviewFeedback) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/resume-reviews/${selectedRequest.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.session?.token}`
        },
        body: JSON.stringify({ feedback: reviewFeedback, rating: reviewRating, status: "REVIEWED" })
      });
      if (res.ok) {
        setIsReviewModalOpen(false);
        setReviewFeedback("");
        setReviewRating(5);
        setSelectedRequest(null);
        fetchRequests();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feedback?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/placements/resume-reviews/${id}/feedback`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${session?.session?.token}`
        }
      });
      if (res.ok) {
        fetchRequests();
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
            <div className="p-3 bg-pastel-lavender/10 rounded-xl text-pastel-lavender border border-pastel-lavender/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Resume Reviews</h1>
              <p className="text-neutral-400">Get your resume reviewed by seniors or help juniors.</p>
            </div>
          </div>
          <button 
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pastel-lavender to-pastel-blue text-black font-semibold rounded-xl hover:scale-105 transition-transform"
          >
            <Plus className="h-5 w-5" />
            Submit Resume
          </button>
        </div>

        {loading ? (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center mt-12">
            <p className="text-neutral-400">Loading requests...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
            {requests.map((req) => (
              <div key={req.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                        {req.requester.image ? (
                          <img src={req.requester.image} alt={req.requester.name} className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-white/50" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-white font-medium">{req.requester.name}</h3>
                        <p className="text-xs text-neutral-400">{req.requester.email}</p>
                      </div>
                    </div>
                    {req.status === "PENDING" ? (
                      <span className="flex items-center gap-1 text-xs font-medium bg-pastel-yellow/10 text-pastel-yellow px-2 py-1 rounded-md border border-pastel-yellow/20">
                        <Clock className="w-3 h-3" /> Pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium bg-pastel-mint/10 text-pastel-mint px-2 py-1 rounded-md border border-pastel-mint/20">
                        <CheckCircle className="w-3 h-3" /> Reviewed
                      </span>
                    )}
                  </div>
                  
                  <a href={req.resumeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-pastel-blue text-sm hover:underline mb-4">
                    <LinkIcon className="w-4 h-4" /> View Resume
                  </a>

                  {req.status === "REVIEWED" && req.feedback && (
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-pastel-mint" />
                          <span className="text-xs text-neutral-400">Feedback by {req.reviewer?.name}</span>
                        </div>
                        {req.rating !== null && (
                          <div className="flex items-center gap-1 text-xs font-bold text-pastel-yellow bg-pastel-yellow/10 px-2 py-0.5 rounded border border-pastel-yellow/20">
                            ⭐ {req.rating}/10
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-neutral-300 whitespace-pre-wrap">{req.feedback}</p>
                      
                      {req.reviewer?.email === session?.user?.email && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                          <button
                            onClick={() => {
                              setSelectedRequest(req);
                              setReviewFeedback(req.feedback || "");
                              setReviewRating(req.rating || 5);
                              setIsReviewModalOpen(true);
                            }}
                            className="text-xs font-medium text-pastel-blue hover:text-white transition-colors"
                          >
                            Edit Feedback
                          </button>
                          <button
                            onClick={() => handleDeleteFeedback(req.id)}
                            className="text-xs font-medium text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {req.status === "PENDING" && isEligibleReviewer && req.requester.email !== session?.user?.email && (
                  <button
                    onClick={() => {
                      setSelectedRequest(req);
                      setIsReviewModalOpen(true);
                    }}
                    className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Provide Feedback
                  </button>
                )}
                
                <div className="mt-4 text-xs text-neutral-500">
                  Submitted {format(new Date(req.createdAt), "PPP")}
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="col-span-full p-8 text-center text-neutral-400 bg-white/5 rounded-2xl border border-white/10">
                No resume review requests yet. Be the first to submit!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Submit Resume</h2>
            <p className="text-neutral-400 text-sm mb-6">Provide a public link to your resume (e.g. Google Drive, Notion).</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Resume Link</label>
                <input
                  type="url"
                  required
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-lavender/50"
                  placeholder="https://..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-pastel-lavender to-pastel-blue text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-2">Review Resume</h2>
            <p className="text-neutral-400 text-sm mb-6">Providing feedback for {selectedRequest.requester.name}&apos;s resume.</p>
            
            <form onSubmit={handleReview} className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="block text-sm font-medium text-neutral-300">Rating</label>
                  <span className="text-sm font-bold text-pastel-yellow">{reviewRating} / 10</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={reviewRating}
                  onChange={(e) => setReviewRating(Number(e.target.value))}
                  className="w-full accent-pastel-lavender h-2 bg-white/10 rounded-lg appearance-none cursor-pointer mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Your Feedback</label>
                <textarea
                  required
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-pastel-lavender/50"
                  placeholder="Provide constructive feedback..."
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setSelectedRequest(null);
                    setReviewFeedback("");
                    setReviewRating(5);
                  }}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-pastel-mint to-pastel-blue text-black rounded-xl font-bold hover:opacity-90 transition-opacity"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
