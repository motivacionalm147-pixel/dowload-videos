import React, { useState } from 'react';
import { History, Trash2, Download, Youtube, Music, Instagram, Facebook, Clock, Play, FileVideo, ExternalLink, FolderOpen, Check } from 'lucide-react';
import { DownloadHistoryItem } from '../types';

interface DownloadHistoryProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({ history, onClearHistory }) => {
  const [activePreviewUrl, setActivePreviewUrl] = useState<string | null>(null);

  const getPlatformBadge = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 rounded-full"><Youtube className="w-3.5 h-3.5" /> YouTube</span>;
      case 'tiktok':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full"><Music className="w-3.5 h-3.5" /> TikTok</span>;
      case 'instagram':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full"><Instagram className="w-3.5 h-3.5" /> Instagram</span>;
      case 'facebook':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full"><Facebook className="w-3.5 h-3.5" /> Facebook</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-slate-700 text-slate-300 rounded-full"><FileVideo className="w-3.5 h-3.5" /> Vídeo</span>;
    }
  };

  const handleRedownload = (item: DownloadHistoryItem) => {
    const downloadUrl = `/api/download?url=${encodeURIComponent(item.url)}&format=${item.format}&quality=${item.quality}&title=${encodeURIComponent(item.title)}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenFolder = () => {
    fetch('/api/open-downloads-folder', { method: 'POST' }).catch(() => {});
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="glass-card border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">Histórico de Vídeos Baixados</h2>
              <p className="text-xs sm:text-sm text-slate-400">Seus downloads recentes organizados e prontos para ver ou rebaixar.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleOpenFolder}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all backdrop-blur-md"
              title="Abrir pasta local de arquivos salvos"
            >
              <FolderOpen className="w-4 h-4 text-emerald-400" />
              <span>Abrir Pasta dos Downloads</span>
            </button>

            {history.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/30 text-slate-300 hover:text-rose-300 text-xs font-semibold transition-all backdrop-blur-md"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar</span>
              </button>
            )}
          </div>
        </div>

        {/* History Cards Grid or Empty State */}
        {history.length === 0 ? (
          <div className="text-center py-16 bg-slate-950/40 rounded-3xl border border-white/5 p-6">
            <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Clock className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Nenhum vídeo no histórico ainda</h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6">
              Assim que você baixar qualquer vídeo ou áudio MP3, a capa e as opções de download ficarão salvas aqui em grande destaque.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {history.map((item) => (
              <div
                key={item.id}
                className="group glass-card border border-white/10 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between shadow-lg hover:shadow-indigo-500/10"
              >
                {/* Thumbnail Header with Play Overlay */}
                <div className="relative aspect-video bg-slate-950 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />
                  
                  {/* Top Badge */}
                  <div className="absolute top-3 left-3">
                    {getPlatformBadge(item.platform)}
                  </div>

                  {/* Format Pill */}
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-950/90 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold font-mono">
                    {item.format.toUpperCase()} • {item.quality}
                  </div>

                  {/* Open / Original Link Button */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute bottom-3 right-3 p-2 rounded-xl bg-slate-900/90 hover:bg-indigo-600 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all backdrop-blur-md flex items-center gap-1 shadow-md"
                    title="Abrir link original do vídeo"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Content Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug mb-2 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-4">
                      <span>Tamanho: {item.fileSize}</span>
                      <span>{item.downloadedAt}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleRedownload(item)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar Novamente</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

