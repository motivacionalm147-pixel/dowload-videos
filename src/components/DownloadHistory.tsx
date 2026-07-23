import React from 'react';
import { History, Trash2, Download, Youtube, Music, Instagram, Facebook, Clock, FileVideo, FileAudio } from 'lucide-react';
import { DownloadHistoryItem } from '../types';

interface DownloadHistoryProps {
  history: DownloadHistoryItem[];
  onClearHistory: () => void;
}

export const DownloadHistory: React.FC<DownloadHistoryProps> = ({ history, onClearHistory }) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-400" />;
      case 'tiktok':
        return <Music className="w-4 h-4 text-cyan-300" />;
      case 'instagram':
        return <Instagram className="w-4 h-4 text-pink-400" />;
      case 'facebook':
        return <Facebook className="w-4 h-4 text-blue-400" />;
      default:
        return <FileVideo className="w-4 h-4 text-slate-400" />;
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

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass-card border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md">
              <History className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Histórico de Downloads</h2>
              <p className="text-xs text-slate-400">Seus downloads recentes salvos neste navegador.</p>
            </div>
          </div>

          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-rose-400 text-xs font-semibold transition-all backdrop-blur-md"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Histórico</span>
            </button>
          )}
        </div>

        {/* History List or Empty state */}
        {history.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8" />
            </div>
            <p className="text-slate-300 font-semibold mb-1">Nenhum download gravado ainda</p>
            <p className="text-slate-500 text-xs max-w-sm mx-auto">
              Quando você baixar vídeos ou áudios MP3, seus registros aparecerão aqui para fácil acesso.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  </div>

                  <div className="truncate">
                    <div className="flex items-center gap-2 mb-0.5">
                      {getPlatformIcon(item.platform)}
                      <span className="text-xs font-bold text-slate-200 truncate">{item.title}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      <span className="px-1.5 py-0.2 rounded bg-slate-800 uppercase text-indigo-300 font-bold">
                        {item.format} ({item.quality})
                      </span>
                      <span>• {item.fileSize}</span>
                      <span>• {item.downloadedAt}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRedownload(item)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors shrink-0"
                  title="Baixar novamente"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Rebaixar</span>
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
