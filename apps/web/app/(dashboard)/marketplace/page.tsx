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
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/marketplace`, { credentials: "include" });
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

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/marketplace`, {
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
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        <div className="text-center py-20 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl">
          <Tag className="h-10 w-10 text-neutral-500 mx-auto mb-4" />
          <p className="text-neutral-400">No items listed yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div key={item.id} className="group rounded-3xl overflow-hidden bg-black/40 backdrop-blur-xl border border-white/5 hover:border-pastel-peach/30 transition-all duration-500 shadow-2xl">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0A0A0A]/95 border border-white/10 w-full max-w-lg rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex flex-col gap-1 p-6 sm:p-8 border-b border-white/5 relative shrink-0">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 p-2 bg-white/5 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors z-10">
                <X className="h-5 w-5" />
              </button>
              <div className="h-1 w-6 rounded-full bg-pastel-peach mb-2" />
              <h2 className="text-2xl font-black text-white">Create a <span className="text-pastel-peach">Listing</span></h2>
              <p className="text-sm text-neutral-400">Add photos and details for your item.</p>
            </div>
            
            <form onSubmit={handleCreateListing} className="p-6 sm:p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-pastel-peach focus:bg-black transition-colors"
                    placeholder="E.g., Graphics Card"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Price (₹)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-pastel-peach focus:bg-black transition-colors"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Description</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white placeholder-neutral-600 focus:outline-none focus:border-pastel-peach focus:bg-black transition-colors min-h-[120px] resize-none"
                  placeholder="Describe the condition, specifications, and age of the item..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Photos</label>
                <div className="relative border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-neutral-500 hover:border-pastel-peach hover:bg-pastel-peach/10 transition-colors cursor-pointer overflow-hidden bg-black/30 group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-40 object-contain rounded-lg" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                      <div className="p-3 bg-pastel-peach/10 rounded-full text-pastel-peach mb-1">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                      <span className="text-sm font-medium text-neutral-300">Click or drag image to upload</span>
                      <span className="text-xs text-neutral-500">Maximum file size 5MB</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || uploading}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-black text-black bg-pastel-peach hover:bg-pastel-peach/90 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed transition-all"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
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
