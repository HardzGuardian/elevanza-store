'use client';

import { useState } from 'react';
import { Upload, X, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CldUploadWidget } from 'next-cloudinary';
import { toast } from 'react-hot-toast';
import { OptimizedImage } from '@/components/ui/optimized-image';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export function ImageUpload({ value, onChange, label = "Product Image" }: ImageUploadProps) {
  const [isReady, setIsReady] = useState(false);

  // Handle successful upload
  const onUpload = (result: any) => {
    if (result.event === 'success') {
      onChange(result.info.secure_url);
      toast.success('Image uploaded to Cloudinary!');
    }
  };

  return (
    <div className="space-y-4 w-full">
      <label className="text-sm font-black text-gray-700 uppercase tracking-widest">{label}</label>
      
      {value ? (
        <div className="relative aspect-square w-full max-w-[200px] rounded-3xl overflow-hidden border-4 border-white shadow-xl ring-1 ring-gray-100 group">
          <OptimizedImage
            src={value}
            alt="Upload Preview"
            fill
            sizes="200px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={() => onChange('')}
              className="p-3 bg-red-500 text-white rounded-2xl shadow-lg hover:scale-110 transition-transform"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <CldUploadWidget 
          onSuccess={onUpload}
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "elevanza_unsigned"}
          options={{
            maxFiles: 1,
            styles: {
              palette: {
                window: "#FFFFFF",
                windowBorder: "#E2E8F0",
                tabIcon: "#4F46E5",
                menuIcons: "#5A616A",
                textDark: "#000000",
                textLight: "#FFFFFF",
                link: "#4F46E5",
                action: "#4F46E5",
                inactiveTabIcon: "#8E96A0",
                error: "#F43F5E",
                inProgress: "#4F46E5",
                complete: "#10B981",
                sourceBg: "#F8FAFC"
              },
              fonts: {
                default: null,
                "sans-serif": "Inter"
              }
            }
          }}
        >
          {({ open }) => {
            return (
              <div 
                onClick={() => open()}
                className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-gray-200 rounded-[32px] bg-gray-50/50 hover:bg-white hover:border-indigo-600/50 transition-all cursor-pointer group"
              >
                <div className="p-5 bg-white rounded-2xl shadow-sm mb-4 group-hover:scale-110 transition-transform">
                  <Upload className="w-8 h-8 text-indigo-600" />
                </div>
                <p className="text-sm font-bold text-gray-900">Open Image Studio</p>
                <p className="text-xs text-gray-400 mt-1 italic font-medium">Click to upload or drag & drop</p>
              </div>
            );
          }}
        </CldUploadWidget>
      )}

      {/* Manual URL Input Fallback */}
      <div className="pt-2">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter mb-2">Or enter image URL manually</p>
        <div className="flex gap-2">
           <div className="relative flex-grow">
              <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={value || ''} 
                onChange={(e) => onChange(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-2xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
              />
           </div>
        </div>
      </div>
    </div>
  );
}

