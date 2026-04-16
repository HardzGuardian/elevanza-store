'use client';

import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface EmergencyBannerProps {
  message: string;
}

export function EmergencyBanner({ message }: EmergencyBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible || !message) return null;

  return (
    <div className="bg-red-600 text-white py-3 px-4 relative z-[60] overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <div className="flex-shrink-0 animate-pulse bg-red-400 p-1 rounded-full">
            <AlertCircle className="w-4 h-4" />
        </div>
        <p className="text-xs md:text-sm font-black uppercase tracking-widest text-center">
            <span className="opacity-70 mr-2">[Notice]</span> {message}
        </p>
        <button 
            onClick={() => setIsVisible(false)}
            className="absolute right-4 hover:bg-white/10 p-1 rounded-full transition-colors"
        >
            <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
