import React from 'react';
import { Download, Youtube, Music, Instagram, Facebook, Sparkles, History, Layers, FolderOpen } from 'lucide-react';

interface NavbarProps {
  activeTab: 'single' | 'batch' | 'history';
  setActiveTab: (tab: 'single' | 'batch' | 'history') => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, historyCount }) => {
  const handleOpenFolder = async () => {
    try {
      await fetch('/api/open-downloads-folder', { method: 'POST' });
    } catch (err) {
      console.warn('Erro ao abrir pasta de downloads:', err);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/70 border-b border-white/10 text-white shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div 
            onClick={() => setActiveTab('single')} 
            className="flex items-center gap-3 cursor-pointer group"
            id="brand-logo"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950/90 rounded-[10px] flex items-center justify-center backdrop-blur-md">
                <Download className="w-5 h-5 text-rose-400 group-hover:text-rose-300 transition-colors" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  MediaGrab
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-rose-500/20 text-rose-300 rounded border border-rose-500/30 backdrop-blur-md">
                  HD
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Baixar Vídeos & Áudios Grátis</p>
            </div>
          </div>

          {/* Platform badges */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs">
            <span className="text-slate-400 font-medium">Plataformas:</span>
            <div className="flex items-center gap-2 font-medium">
              <span className="flex items-center gap-1 text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                <Youtube className="w-3.5 h-3.5" /> YouTube
              </span>
              <span className="flex items-center gap-1 text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                <Music className="w-3.5 h-3.5" /> TikTok
              </span>
              <span className="flex items-center gap-1 text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                <Instagram className="w-3.5 h-3.5" /> Instagram
              </span>
              <span className="flex items-center gap-1 text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                <Facebook className="w-3.5 h-3.5" /> Facebook
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              id="tab-single"
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'single'
                  ? 'bg-gradient-to-r from-rose-500/90 to-indigo-600/90 text-white shadow-lg shadow-indigo-500/25 border border-white/20 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Baixar</span>
            </button>

            <button
              id="tab-batch"
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'batch'
                  ? 'bg-gradient-to-r from-rose-500/90 to-indigo-600/90 text-white shadow-lg shadow-indigo-500/25 border border-white/20 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Lote</span>
            </button>

            <button
              id="tab-history"
              onClick={() => setActiveTab('history')}
              className={`relative flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-rose-500/90 to-indigo-600/90 text-white shadow-lg shadow-indigo-500/25 border border-white/20 backdrop-blur-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden xs:inline sm:inline">Histórico</span>
              {historyCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold bg-rose-500 text-white rounded-full shadow-sm">
                  {historyCount}
                </span>
              )}
            </button>

            {/* Dedicated Folder Button */}
            <button
              onClick={handleOpenFolder}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 transition-all backdrop-blur-md"
              title="Abrir pasta local de arquivos salvos"
            >
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span className="hidden md:inline">Pasta</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
};

