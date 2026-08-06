"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Tag, Plus, Loader2, Image as ImageIcon, X } from "lucide-react";
import { uploadFileToR2 } from "@/lib/upload";
import { useSession } from "@/lib/auth-client";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  seller: {
    name: string;
    image: string | null;
  };
  createdAt: string;
}

export default function MarketplacePage() {
  const { } = useSession();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const res = await fetch("http://localhost:3001/marketplace", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setListings(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !price) return;
    
    setSubmitting(true);
    try {
      let imageUrl = null;
      if (selectedFile) {
        setUploading(true);
        imageUrl = await uploadFileToR2(selectedFile);
        setUploading(false);
      }

      const res = await fetch("http://localhost:3001/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          title,
          description,
          price: parseFloat(price),
          images: imageUrl ? [imageUrl] : [],
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setTitle("");
        setDescription("");
        setPrice("");
        setSelectedFile(null);
        setPreviewUrl(null);
        fetchListings();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create listing");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || "Something went wrong");
      } else {
        alert("Something went wrong");
      }
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-card p-6 rounded-3xl bg-[#0A0A0A]/50 border-neutral-800/80">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pastel-peach/10 border border-pastel-peach/20">
            <ShoppingBag className="h-7 w-7 text-pastel-peach" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-white">Campus <span className="bg-gradient-to-r from-pastel-peach to-pastel-mint bg-clip-text text-transparent">Marketplace</span></h1>
            <p className="text-sm text-neutral-400">Buy, sell, and trade within IIITL.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm bg-gradient-to-r from-pastel-peach to-pastel-mint text-black hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> List an Item
        </button>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-pastel-peach" />
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20 glass-card rounded-3xl border-neutral-800/80">
          <Tag className="h-10 w-10 text-neutral-500 mx-auto mb-4" />
          <p className="text-neutral-400">No items listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="group glass-card rounded-2xl overflow-hidden bg-[#0A0A0A]/80 border-neutral-800/80 hover:border-pastel-peach/50 transition-colors">
              {item.images && item.images.length > 0 ? (
                <div className="w-full h-48 bg-neutral-900 relative overflow-hidden">
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="w-full h-48 bg-neutral-900 flex items-center justify-center">
                  <ShoppingBag className="h-10 w-10 text-neutral-800" />
                </div>
              )}
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-lg font-bold text-white leading-tight">{item.title}</h3>
                  <span className="text-pastel-mint font-black whitespace-nowrap">₹{item.price}</span>
                </div>
                <p className="text-sm text-neutral-400 line-clamp-2">{item.description}</p>
                
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-white overflow-hidden">
                    {item.seller.image ? <img src={item.seller.image} alt="seller" className="w-full h-full object-cover" /> : item.seller.name[0]}
                  </div>
                  <span className="text-xs text-neutral-500">{item.seller.name}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Listing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A] border border-neutral-800 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(255,218,185,0.1)]">
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">New Listing</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateListing} className="p-6 space-y-5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-peach transition-colors"
                  placeholder="What are you selling?"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-peach transition-colors"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-pastel-peach transition-colors min-h-[100px] resize-none"
                  placeholder="Item condition, specs, etc."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">Image</label>
                <div className="relative border-2 border-dashed border-neutral-800 rounded-xl p-4 flex flex-col items-center justify-center text-neutral-500 hover:border-pastel-peach hover:bg-pastel-peach/5 transition-colors cursor-pointer overflow-hidden">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-32 object-contain" />
                  ) : (
                    <>
                      <ImageIcon className="h-8 w-8 mb-2" />
                      <span className="text-sm font-medium">Click to upload</span>
                    </>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-black bg-gradient-to-r from-pastel-peach to-pastel-mint disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {uploading ? "Uploading Image..." : "Publishing..."}
                  </>
                ) : (
                  "Post Listing"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
