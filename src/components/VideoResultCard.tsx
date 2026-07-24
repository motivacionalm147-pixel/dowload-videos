import React, { useState } from 'react';
import { VideoInfo, QualityOption, DownloadFormat } from '../types';
import { DownloadModal } from './DownloadModal';
import { 
  Download, 
  Play, 
  Volume2, 
  Check, 
  Clock, 
  Eye, 
  User, 
  Copy, 
  Youtube, 
  Music, 
  Instagram, 
  Facebook, 
  FileVideo,
  FileAudio
} from 'lucide-react';

interface VideoResultCardProps {
  info: VideoInfo;
  onDownloadStart: (format: DownloadFormat, quality: QualityOption) => void;
}

export const VideoResultCard: React.FC<VideoResultCardProps> = ({ info, onDownloadStart }) => {
  const safeQualities = (info && Array.isArray(info.qualities) && info.qualities.length > 0)
    ? info.qualities
    : [
        { id: '1080p', label: '1080p Full HD', resolution: '1920x1080', estimatedSize: '~45 MB', format: 'mp4', qualityKey: '1080p', isPopular: true },
        { id: '720p', label: '720p HD', resolution: '1280x720', estimatedSize: '~25 MB', format: 'mp4', qualityKey: '720p' },
        { id: '320k', label: 'MP3 Áudio 320k', bitrate: '320 kbps', estimatedSize: '~10 MB', format: 'mp3', qualityKey: '320k', isPopular: true }
      ];

  const [activeFormat, setActiveFormat] = useState<DownloadFormat>('mp4');
  const [selectedQuality, setSelectedQuality] = useState<QualityOption>(
    safeQualities.find(q => q.format === 'mp4' && q.qualityKey === '1080p') || safeQualities[0]
  );

  const availableQualities = safeQualities.filter(q => q && q.format === activeFormat);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  const handleFormatChange = (format: DownloadFormat) => {
    setActiveFormat(format);
    const defaultQuality = safeQualities.find(q => q && q.format === format && (q.isPopular || q.qualityKey === '1080p' || q.qualityKey === '320k')) ||
      safeQualities.find(q => q && q.format === format) ||
      safeQualities[0];
    if (defaultQuality) {
      setSelectedQuality(defaultQuality);
    }
  };

  const handleDownload = () => {
    setIsModalOpen(true);
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(info.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const getPlatformBadge = () => {
    switch (info.platform) {
      case 'youtube':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 rounded-full"><Youtube className="w-3.5 h-3.5" /> YouTube</span>;
      case 'tiktok':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full"><Music className="w-3.5 h-3.5" /> TikTok</span>;
      case 'instagram':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full"><Instagram className="w-3.5 h-3.5" /> Instagram</span>;
      case 'facebook':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full"><Facebook className="w-3.5 h-3.5" /> Facebook</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-slate-700 text-slate-300 rounded-full">Vídeo Web</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto mb-12 px-4">
      
      {/* Live Download Modal */}
      <DownloadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        info={info}
        format={activeFormat}
        quality={selectedQuality}
        onSaveHistory={() => onDownloadStart(activeFormat, selectedQuality)}
      />

      <div className="glass-card border border-white/15 rounded-3xl p-5 sm:p-8 shadow-2xl shadow-indigo-950/60 backdrop-blur-2xl relative overflow-hidden">
        
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            {getPlatformBadge()}
            <span className="text-xs text-slate-400 font-medium">Link Verificado</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all backdrop-blur-md"
              title="Copiar link original"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar Link'}</span>
            </button>
          </div>
        </div>

        {/* Media Main Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6 items-start">
          
          {/* Thumbnail / Player Box */}
          <div className="md:col-span-5 relative group">
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg select-none">
              {!isPlayingPreview ? (
                <>
                  <img
                    src={info.thumbnail}
                    alt={info.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-center justify-center">
                    <button
                      onClick={() => setIsPlayingPreview(true)}
                      className="w-12 h-12 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-xl shadow-rose-600/30 backdrop-blur-sm group-hover:scale-110 transition-all"
                      title="Abrir pré-visualização"
                    >
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </button>
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-mono font-medium border border-white/10 flex items-center gap-1 z-10">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {info.duration}
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full bg-slate-950 overflow-hidden">
                  {info.platform === 'youtube' ? (
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${info.url.split('v=')[1] || info.url.split('/').pop()}?autoplay=1&controls=1`}
                      title={info.title}
                      className="w-full h-full border-0"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      src={info.streamUrl || info.url}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  )}
                  <button
                    onClick={() => setIsPlayingPreview(false)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 text-white z-40 backdrop-blur-md border border-white/10"
                    title="Fechar Player"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Title & Creator Details */}
          <div className="md:col-span-7 flex flex-col justify-between h-full">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white leading-snug mb-3">
                {info.title}
              </h2>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mb-6">
                <span className="flex items-center gap-1.5 font-medium text-slate-300">
                  <User className="w-3.5 h-3.5 text-rose-400" />
                  {info.author}
                </span>
                {info.views && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-indigo-400" />
                    {info.views}
                  </span>
                )}
              </div>

              {/* Format Toggle Bar (MP4 vs MP3) */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  1. Escolha o Formato do Arquivo
                </label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-950/70 rounded-2xl border border-white/10 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => handleFormatChange('mp4')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      activeFormat === 'mp4'
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 border border-white/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <FileVideo className="w-4 h-4" />
                    <span>Vídeo (MP4)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFormatChange('mp3')}
                    className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      activeFormat === 'mp3'
                        ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/30 border border-white/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <FileAudio className="w-4 h-4" />
                    <span>Áudio (MP3)</span>
                  </button>
                </div>
              </div>

              {/* Quality Options Grid */}
              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
                  2. Escolha a Qualidade
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5">
                  {availableQualities.map((q) => {
                    const isSelected = selectedQuality && selectedQuality.id === q.id;
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setSelectedQuality(q)}
                        className={`relative flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-slate-800 border-indigo-500 text-white ring-2 ring-indigo-500/20'
                            : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold">{q.label}</span>
                            {q.isPopular && (
                              <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                                POPULAR
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {q.resolution || q.bitrate} ~ {q.estimatedSize}
                          </span>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Download Action Section */}
              <div className="mt-2">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-rose-500 via-indigo-600 to-indigo-700 hover:from-rose-600 hover:to-indigo-800 text-white font-bold text-base shadow-xl shadow-rose-500/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <Download className="w-5 h-5" />
                  <span>
                    Baixar {activeFormat.toUpperCase()} ({selectedQuality?.qualityKey || '1080p'})
                  </span>
                </button>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
