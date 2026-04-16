import { Sparkles } from "lucide-react";

interface FestivalBannerProps {
  message: string;
}

export function FestivalBanner({ message }: FestivalBannerProps) {
  return (
    <div className="bg-primary text-white py-2 px-4 shadow-sm z-[60] relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
        <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] italic text-center">
          {message}
        </p>
        <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
      </div>
    </div>
  );
}
