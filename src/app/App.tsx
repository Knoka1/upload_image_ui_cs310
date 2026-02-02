
import { useState } from 'react';
import { UploadZone } from '../components/UploadZone';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { ImageIcon, LayoutGrid, Info, Camera } from 'lucide-react';

import {
  getUsers,
  getImages,
  uploadImage,
  getImageLabels,
  searchImagesByLabel,
  downloadImage,
  deleteAllImages,
  type User,
  type Image,
  type Label
} from "../lib/api";

export default function App() {
  
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [searchLabel, setSearchLabel] = useState("");
  const [labels, setLabels] = useState<Record<number, Label[]>>({});

  

  const handleUpload = async (newFiles: File[]) => {
    if (!selectedUser) {
      toast.error("Please select a user first");
      return;
    }

    try {
      for (const file of newFiles) {
        await uploadImage(selectedUser, file);
      }

      toast.success("Upload complete");
      const imgs = await getImages(selectedUser);
      setImages(imgs);
      setLabels({});
    } catch (error) {
      toast.error("Upload failed");
      console.error(error);
    }
  };


  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      <Toaster position="bottom-right" richColors />
      
  
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
              <Camera size={22} />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block leading-none">PhotoApp</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Image Manager</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Overview</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Shared</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Archive</a>
          </div>

        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
  
          <div className="lg:col-span-4 flex flex-col gap-8">
            <section className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                Your visual <br />
                <span className="text-indigo-600 underline decoration-indigo-100 underline-offset-8">workspace</span>
              </h1>
              <p className="text-slate-600 leading-relaxed">
                Upload and manage your assets in one place. Fast, secure, and beautiful.
              </p>
            </section>

            <UploadZone onUpload={handleUpload} />

            <div className="space-y-2">
              <button
                onClick={async () => {
                  try {
                    const data = await getUsers();
                    setUsers(data);
                    toast.success("Users loaded");
                  } catch (error) {
                    toast.error("Failed to load users");
                    console.error(error);
                  }
                }}
                className="px-3 py-2 bg-indigo-600 text-white rounded">
                Load Users
              </button>

              <select
                value={selectedUser || ""}
                onChange={e => setSelectedUser(e.target.value ? Number(e.target.value) : null)}
                className="w-full border p-2 rounded">
                <option value="">Select User</option>
                {users.map(u => (
                  <option key={u.userid} value={u.userid}>
                    {u.username} - {u.givenname} {u.familyname}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-slate-500">Storage Used</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(images.length * 10, 100)}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>
              
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex gap-3 items-start">
                <Info className="text-indigo-500 mt-0.5 shrink-0" size={18} />
                <p className="text-xs text-indigo-700/80 leading-relaxed">
                  data is sent to a server.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mb-4 items-center">
            <button
              disabled={!selectedUser}
              onClick={async () => {
                if (!selectedUser) {
                  toast.error("Select a user first");
                  return;
                }
                try {
                  const data = await getImages(selectedUser);
                  setImages(data);
                  setLabels({});
                  toast.success("Images loaded");
                } catch (error) {
                  toast.error("Failed to load images");
                  console.error(error);
                }
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded w-32 flex-none"
            >
              Load Images
            </button>

            <input
              type="text"
              placeholder="Search by label"
              value={searchLabel}
              onChange={e => setSearchLabel(e.target.value)}
              className="border px-3 py-2 rounded flex-1"
            />

            <button
              disabled={!searchLabel}
              onClick={async () => {
                if (!searchLabel) {
                  toast.error("Enter a label to search");
                  return;
                }
                try {
                  const results = await searchImagesByLabel(searchLabel);
                  const imageData: Image[] = results.map(r => ({
                    assetid: r.assetid,
                    userid: 0,
                    localname: "",
                    bucketkey: ""
                  }));
                  setImages(imageData);
                  setLabels({});
                  toast.success(`Found ${results.length} images`);
                } catch (error) {
                  toast.error("Search failed");
                  console.error(error);
                }
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded w-24 flex-none">
              Search
            </button>
            <button
              onClick={async () => {
                const ok = window.confirm("Are you sure you want to delete all images?");
                if (!ok) return;

                try {
                  await deleteAllImages();
                  setImages([]);
                  setLabels({});
                  toast.success("All images deleted");
                } catch (error) {
                  toast.error("Failed to delete images");
                  console.error(error);
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded w-32"
            >
              Delete Images
            </button>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <LayoutGrid size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">Media Library</h2>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {images.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
                      <ImageIcon size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Your library is empty</h3>
                    <p className="text-slate-500 max-w-xs mx-auto text-sm leading-relaxed">
                      Upload your first image to see it appear here in your workspace.
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    <AnimatePresence mode="popLayout">
                      {images.map(img => (
                        <div key={img.assetid} className="border p-2 rounded bg-white">
                          <div className="mb-2 text-xs text-slate-600">
                            Asset #{img.assetid}
                          </div>

                          <button
                            onClick={async () => {
                              try {
                                const blob = await downloadImage(img.assetid);
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = img.localname || `image_${img.assetid}.jpg`;
                                a.click();
                                URL.revokeObjectURL(url);
                                toast.success("Download started");
                              } catch (error) {
                                toast.error("Download failed");
                                console.error(error);
                              }
                            }}
                            className="text-sm text-blue-600">
                            Download
                          </button>

                          <button
                            onClick={async () => {
                              try {
                                const data = await getImageLabels(img.assetid);
                                setLabels(prev => ({ ...prev, [img.assetid]: data }));
                                toast.success("Labels loaded");
                              } catch (error) {
                                toast.error("Failed to get labels");
                                console.error(error);
                              }
                            }}
                            className="text-sm text-green-600 ml-2">
                            Get Labels
                          </button>

                          {labels[img.assetid] && (
                            <p className="text-xs mt-1">
                              Labels: {labels[img.assetid].map(l => l.label).join(", ")}
                            </p>
                          )}
                        </div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all cursor-pointer">
          <Camera size={20} />
          <span className="font-bold text-lg tracking-tight">Photoapp</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
        </div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
          &copy; 2026 Photoapp
        </p>
      </footer>
    </div>
  );
}




/*

import { useState } from "react";
import { UploadZone } from "../components/UploadZone";
import { Toaster, toast } from "sonner";

import {
  getUsers,
  getImages,
  uploadImage,
  getLabels,
  searchImages,
  downloadImage,
  deleteImages
} from "./api";

interface Image {
  image_id: string;
  url: string;
}

export default function App() {
  const [users, setUsers] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [images, setImages] = useState<Image[]>([]);
  const [searchLabel, setSearchLabel] = useState("");
  const [labels, setLabels] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  // Load users
  const handleLoadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
      toast.success("Users loaded");
    } catch {
      toast.error("Failed to load users");
    }
  };

  // Upload images
  const handleUpload = async (files: File[]) => {
    if (!selectedUser) {
      toast.error("Select a user first");
      return;
    }

    try {
      for (const file of files) {
        await uploadImage(file, selectedUser);
      }
      toast.success("Upload complete");

      const imgs = await getImages(selectedUser);
      setImages(imgs);
    } catch {
      toast.error("Upload failed");
    }
  };

  // Load images
  const handleLoadImages = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      const data = await getImages(selectedUser);
      setImages(data);
    } catch {
      toast.error("Failed to load images");
    } finally {
      setLoading(false);
    }
  };

  // Search by label
  const handleSearch = async () => {
    try {
      const results = await searchImages(searchLabel);
      setImages(results);
    } catch {
      toast.error("Search failed");
    }
  };

  // Delete all images
  const handleDeleteImages = async () => {
  const ok = window.confirm("Are you sure you want to delete all images?");
  if (!ok) return;

  try {
    await deleteImages();
    setImages([]);
    toast.success("All images deleted");
  } catch {
    toast.error("Delete failed");
  }
  };

  // Get labels
  const handleGetLabels = async (imageId: string) => {
    try {
      const data = await getLabels(imageId);
      setLabels(prev => ({ ...prev, [imageId]: data }));
    } catch {
      toast.error("Failed to get labels");
    }
  };

  return (
    <div className="min-h-screen p-8 bg-slate-50">
      <Toaster position="bottom-right" richColors />

      <h1 className="text-2xl font-bold mb-6">Photo App</h1>

      <div className="space-y-3 mb-6">
        <button
          onClick={handleLoadUsers}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
        >
          Load Users
        </button>

        <select
          value={selectedUser}
          onChange={e => setSelectedUser(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select User</option>
          {users.map(u => (
            <option key={u} value={u}>{u}</option>
          ))}
        </select>

        {!selectedUser && (
          <p className="text-sm text-red-500">Please select a user first.</p>
        )}
      </div>

      <UploadZone onUpload={handleUpload} />


      <div className="flex gap-3 my-4">
        <button
          disabled={!selectedUser}
          onClick={handleLoadImages}
          className={`px-4 py-2 rounded w-32 flex-none 
            ${!selectedUser ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 text-white"}`}
        >
          Load Images
        </button>

        <input
          type="text"
          placeholder="Search by label"
          value={searchLabel}
          onChange={e => setSearchLabel(e.target.value)}
          className="border px-3 py-2 rounded flex-1"
        />

        <button
          disabled={!searchLabel}
          onClick={handleSearch}
          className={`px-4 py-2 rounded w-24 flex-none 
            ${!searchLabel ? "bg-gray-400 cursor-not-allowed" : "bg-slate-800 text-white"}`}
        >
          Search
        </button>

        <button
          onClick={handleDeleteImages}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Delete Images
        </button>
      </div>

      {loading && <p className="text-gray-500 mb-2">Loading images...</p>}
      {!loading && images.length === 0 ? (
        <p className="text-gray-500">No images loaded.</p>
      ) :( !loading && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map(img => (
            <div key={img.image_id} className="border p-2 rounded bg-white">
              <img src={img.url} alt="" className="mb-2" />

              <div className="flex gap-2 text-sm">
                <button
                  onClick={() => downloadImage(img.image_id)}
                  className="text-blue-600"
                >
                  Download
                </button>

                <button
                  onClick={() => handleGetLabels(img.image_id)}
                  className="text-green-600"
                >
                  Get Labels
                </button>
              </div>

              {labels[img.image_id] && (
                <p className="text-xs mt-1">
                  Labels: {labels[img.image_id].join(", ")}
                </p>
              )}
            </div>
          ))}
        </div>
       )
      )}
    </div>
  );
}

*/