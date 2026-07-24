import React, { useState } from 'react';
import { Search, Clipboard, X, Youtube, Music, Instagram, Facebook, ArrowRight, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PlatformType } from '../types';

interface UrlInputSectionProps {
  url: string;
  setUrl: (url: string) => void;
  onSearch: (inputUrl?: string) => void;
  isLoading: boolean;
  detectedPlatform: PlatformType;
}

export const UrlInputSection: React.FC<UrlInputSectionProps> = ({
  url,
  setUrl,
  onSearch,
  isLoading,
  detectedPlatform,
}) => {
  const [pasteSuccess, setPasteSuccess] = useState(false);

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim().length > 0) {
          setUrl(text.trim());
          setPasteSuccess(true);
          setTimeout(() => setPasteSuccess(false), 2000);
          onSearch(text.trim());
        }
      }
    } catch (err) {
      console.warn('Clipboard read error:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSearch(url.trim());
    }
  };

  const getPlatformIcon = () => {
    switch (detectedPlatform) {
      case 'youtube':
        return <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/25"><Youtube className="w-3.5 h-3.5" /> YouTube</span>;
      case 'tiktok':
        return <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"><Music className="w-3.5 h-3.5" /> TikTok</span>;
      case 'instagram':
        return <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/25"><Instagram className="w-3.5 h-3.5" /> Instagram</span>;
      case 'facebook':
        return <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/25"><Facebook className="w-3.5 h-3.5" /> Facebook</span>;
      default:
        return null;
    }
  };

  return (
    <section className="relative pt-10 pb-10 overflow-hidden">
      {/* Background soft ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[250px] bg-indigo-600/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 text-center">
        
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-white/10 text-xs font-medium text-slate-300 mb-6 shadow-sm">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Download Rápido & Sem Anúncios</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
          Baixar Vídeo ou Áudio em{' '}
          <span className="bg-gradient-to-r from-rose-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
            Alta Qualidade
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto mb-8 font-normal">
          Suporte a YouTube, TikTok, Instagram e Facebook. Sem limites de tamanho.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          <div className="relative flex items-center bg-slate-900/90 border border-white/15 rounded-2xl shadow-xl shadow-slate-950/80 p-2 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 backdrop-blur-2xl transition-all">
            
            {/* Platform / Search Icon */}
            <div className="pl-3 pr-2 flex items-center shrink-0">
              {detectedPlatform !== 'unknown' ? (
                getPlatformIcon()
              ) : (
                <Search className="w-5 h-5 text-slate-400" />
              )}
            </div>

            {/* Input Field */}
            <input
              id="video-url-input"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Cole o link do vídeo aqui..."
              className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base px-2 py-3 focus:outline-none"
            />

            {/* Clear Button */}
            {url && (
              <button
                type="button"
                onClick={() => setUrl('')}
                className="p-1.5 text-slate-400 hover:text-white transition-colors mr-1"
                title="Limpar"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Paste Button */}
            <button
              type="button"
              id="paste-clipboard-btn"
              onClick={handlePaste}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition-all mr-2 shrink-0 ${
                pasteSuccess
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-300 border-white/10 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {pasteSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Colado!</span>
                </>
              ) : (
                <>
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Colar</span>
                </>
              )}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              id="fetch-video-btn"
              disabled={isLoading || !url.trim()}
              className="bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-indigo-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="hidden sm:inline">Analisando...</span>
                </>
              ) : (
                <>
                  <span>Analisar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </section>
  );
};

