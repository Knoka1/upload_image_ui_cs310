import { useState } from 'react';
import { UploadZone, ImageCard } from '../components/UploadZone';
import { AnimatePresence, motion } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { ImageIcon, LayoutGrid, Info, Trash2, Camera } from 'lucide-react';

interface FileWithPreview extends File {
  preview: string;
  id: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export default function App() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'completed', progress: 100 } : f
        ));
      } else {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
      }
    }, 300);
  };

  const handleUpload = (newFiles: FileWithPreview[]) => {
    setFiles(prev => [...newFiles, ...prev]);
    newFiles.forEach(file => simulateUpload(file.id));
    toast.success(`${newFiles.length} file(s) added`);
  };

  const removeFile = (id: string) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removedFile = prev.find(f => f.id === id);
      if (removedFile) URL.revokeObjectURL(removedFile.preview);
      return filtered;
    });
  };

  const clearAll = () => {
    files.forEach(f => URL.revokeObjectURL(f.preview));
    setFiles([]);
    toast.info('Gallery cleared');
  };

  const completedCount = files.filter(f => f.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100">
      <Toaster position="bottom-right" richColors />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-indigo-200 shadow-lg">
              <Camera size={22} />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight block leading-none">SnapFlow</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Image Manager</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Overview</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Shared</a>
            <a href="#" className="text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">Archive</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-slate-200 hidden sm:block mx-2" />
            <button className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all active:scale-95">
              Upgrade Pro
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Upload Sidebar */}
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

            <div className="space-y-6">
              <div className="flex items-center justify-between text-sm font-medium">
                <span className="text-slate-500">Storage Used</span>
                <span className="text-slate-900">{(files.length * 1.2).toFixed(1)} MB / 500 MB</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${(files.length / 50) * 100}%` }}
                  className="h-full bg-indigo-500"
                />
              </div>
              
              <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex gap-3 items-start">
                <Info className="text-indigo-500 mt-0.5 shrink-0" size={18} />
                <p className="text-xs text-indigo-700/80 leading-relaxed">
                  This is a pure UI demonstration. No data is sent to a server. Refreshing the page will clear your session.
                </p>
              </div>
            </div>
          </div>

          {/* Gallery Content */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <LayoutGrid size={18} className="text-slate-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">Media Library</h2>
                    <p className="text-xs text-slate-500 font-medium">
                      {completedCount} of {files.length} uploaded
                    </p>
                  </div>
                </div>

                {files.length > 0 && (
                  <button 
                    onClick={clearAll}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    Clear All
                  </button>
                )}
              </div>

              <div className="p-8">
                {files.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center justify-center py-24 text-center"
                  >
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
                      {files.map(file => (
                        <ImageCard 
                          key={file.id} 
                          file={file} 
                          onRemove={removeFile} 
                        />
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
          <span className="font-bold text-lg tracking-tight">SnapFlow</span>
        </div>
        <div className="flex gap-8 text-sm font-medium text-slate-400">
          <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-indigo-600 transition-colors">Security</a>
        </div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
          &copy; 2026 SnapFlow
        </p>
      </footer>
    </div>
  );
}
