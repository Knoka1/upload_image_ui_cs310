import { useState } from 'react';
import { Upload, X, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface FileWithPreview extends File {
  preview: string;
  id: string;
  status: 'uploading' | 'completed' | 'error';
  progress: number;
}

export function UploadZone({ onUpload }: { onUpload: (files: FileWithPreview[]) => void }) {
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles: FileWithPreview[] = Array.from(files)
      .filter(file => file.type.startsWith('image/'))
      .map(file => Object.assign(file, {
        preview: URL.createObjectURL(file),
        id: Math.random().toString(36).substring(7),
        status: 'uploading' as const,
        progress: 0
      }));

    if (newFiles.length === 0) {
      toast.error('Please select valid image files');
      return;
    }

    onUpload(newFiles);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); processFiles(e.dataTransfer.files); }}
      className={`relative group border-2 border-dashed rounded-2xl p-12 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer
        ${isDragging 
          ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
    >
      <input
        type="file"
        multiple
        accept="image/*"
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={(e) => processFiles(e.target.files)}
      />
      
      <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragging ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
        <Upload size={32} />
      </div>
      
      <h3 className="text-lg font-medium text-slate-900 mb-1">
        Click or drag images here
      </h3>
      <p className="text-sm text-slate-500">
        Support for PNG, JPG and WebP
      </p>
    </div>
  );
}

export function ImageCard({ file, onRemove }: { file: FileWithPreview, onRemove: (id: string) => void }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 group border border-slate-200"
    >
      <img
        src={file.preview}
        alt="Preview"
        className={`w-full h-full object-cover transition-all duration-500 ${file.status === 'uploading' ? 'blur-sm grayscale scale-110' : 'group-hover:scale-105'}`}
      />
      
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-20">
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
          className="p-2 bg-white/20 hover:bg-red-500/80 backdrop-blur-md rounded-full text-white transition-colors"
          title="Remove image"
        >
          <X size={20} />
        </button>
      </div>

      {file.status === 'uploading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 z-10">
          <Loader2 className="animate-spin text-white mb-2" size={24} />
          <div className="w-24 h-1.5 bg-white/30 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-white"
              initial={{ width: 0 }}
              animate={{ width: `${file.progress}%` }}
            />
          </div>
        </div>
      )}

      {file.status === 'completed' && (
        <div className="absolute top-2 right-2 p-1 bg-green-500 rounded-full text-white shadow-lg z-10">
          <CheckCircle2 size={14} />
        </div>
      )}
    </motion.div>
  );
}
