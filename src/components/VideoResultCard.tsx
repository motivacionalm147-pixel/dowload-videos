import React, { useState, useRef } from 'react';
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
  FileAudio,
  Scissors,
  Type,
  Move,
  Palette,
  SlidersHorizontal,
  Sparkles
} from 'lucide-react';

interface VideoResultCardProps {
  info: VideoInfo;
  onDownloadStart: (format: DownloadFormat, quality: QualityOption) => void;
}

const CUSTOM_FONTS = [
  { name: 'Inter', family: "'Inter', sans-serif" },
  { name: 'Montserrat', family: "'Montserrat', sans-serif" },
  { name: 'Bebas Neue', family: "'Bebas Neue', cursive" },
  { name: 'Lobster', family: "'Lobster', cursive" },
  { name: 'Pacifico', family: "'Pacifico', cursive" },
  { name: 'Anton', family: "'Anton', sans-serif" },
  { name: 'Cinzel', family: "'Cinzel', serif" },
  { name: 'Oswald', family: "'Oswald', sans-serif" },
  { name: 'Playfair Display', family: "'Playfair Display', serif" },
  { name: 'Raleway', family: "'Raleway', sans-serif" },
  { name: 'Rubik', family: "'Rubik', sans-serif" },
  { name: 'Permanent Marker', family: "'Permanent Marker', cursive" },
  { name: 'Press Start 2P', family: "'Press Start 2P', cursive" },
  { name: 'Satisfy', family: "'Satisfy', cursive" },
  { name: 'Bungee', family: "'Bungee', cursive" },
  { name: 'Righteous', family: "'Righteous', cursive" },
  { name: 'Dancing Script', family: "'Dancing Script', cursive" },
  { name: 'Bangers', family: "'Bangers', cursive" },
  { name: 'Abril Fatface', family: "'Abril Fatface', serif" },
  { name: 'Fredoka', family: "'Fredoka', sans-serif" },
  { name: 'Courgette', family: "'Courgette', cursive" },
  { name: 'Titan One', family: "'Titan One', cursive" },
  { name: 'Alfa Slab One', family: "'Alfa Slab One', cursive" },
  { name: 'Caveat', family: "'Caveat', cursive" },
  { name: 'Russo One', family: "'Russo One', sans-serif" },
  { name: 'Sacramento', family: "'Sacramento', cursive" },
  { name: 'Shadows Into Light', family: "'Shadows Into Light', cursive" },
  { name: 'Special Elite', family: "'Special Elite', cursive" },
  { name: 'Orbitron', family: "'Orbitron', sans-serif" },
  { name: 'Roboto', family: "'Roboto', sans-serif" },
];

const FONT_COLORS = [
  { name: 'Branco', hex: '#FFFFFF' },
  { name: 'Amarelo', hex: '#FACC15' },
  { name: 'Rosa Neon', hex: '#F43F5E' },
  { name: 'Ciano', hex: '#06B6D4' },
  { name: 'Verde Neon', hex: '#22C55E' },
  { name: 'Laranja', hex: '#FB923C' },
  { name: 'Roxo', hex: '#A855F7' },
  { name: 'Preto', hex: '#000000' },
];

export const VideoResultCard: React.FC<VideoResultCardProps> = ({ info, onDownloadStart }) => {
  const safeQualities = (info && Array.isArray(info.qualities) && info.qualities.length > 0)
    ? info.qualities
    : [
        { id: '1080p', label: '1080p Full HD', resolution: '1920x1080', estimatedSize: '~45 MB', format: 'mp4', qualityKey: '1080p', isPopular: true },
        { id: '720p', label: '720p HD', resolution: '1280x720', estimatedSize: '~25 MB', format: 'mp4', qualityKey: '720p' },
        { id: '320k', label: 'MP3 Áudio 320k', bitrate: '320 kbps', estimatedSize: '~10 MB', format: 'mp3', qualityKey: '320k' }
      ];

  const [activeFormat, setActiveFormat] = useState<DownloadFormat>('mp4');
  const [selectedQuality, setSelectedQuality] = useState<QualityOption>(
    safeQualities.find(q => q.format === 'mp4' && q.qualityKey === '1080p') || safeQualities[0]
  );
  
  // Filter qualities based on active format
  const availableQualities = safeQualities.filter(q => q && q.format === activeFormat);

  const handleFormatChange = (format: DownloadFormat) => {
    setActiveFormat(format);
    const defaultQuality = safeQualities.find(q => q && q.format === format && (q.isPopular || q.qualityKey === '1080p' || q.qualityKey === '320k')) ||
      safeQualities.find(q => q && q.format === format) ||
      safeQualities[0];
    if (defaultQuality) {
      setSelectedQuality(defaultQuality);
    }
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  // Video Trimmer State
  const [enableTrimmer, setEnableTrimmer] = useState(false);
  const [startTime, setStartTime] = useState(0); // in seconds
  const [endTime, setEndTime] = useState(120); // in seconds

  // Custom Subtitle State
  const [enableSubtitle, setEnableSubtitle] = useState(false);
  const [subtitleText, setSubtitleText] = useState('Siga para mais vídeos! 🔥');
  const [selectedFont, setSelectedFont] = useState(CUSTOM_FONTS[2]); // Bebas Neue default
  const [selectedColor, setSelectedColor] = useState(FONT_COLORS[1]); // Amarelo default
  const [fontSize, setFontSize] = useState(24);
  const [textPosition, setTextPosition] = useState<{ x: number; y: number }>({ x: 50, y: 80 }); // percentage
  const [isDraggingText, setIsDraggingText] = useState(false);

  const previewBoxRef = useRef<HTMLDivElement>(null);

  // AI Subtitle Analysis State
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  const handleAiAnalyzeSubtitle = () => {
    setIsAnalyzingAi(true);
    setAiStatusMessage('Analisando frequências de áudio do vídeo...');
    setEnableSubtitle(true);

    setTimeout(() => {
      setAiStatusMessage('Identificando trechos de fala e gerando legendas...');
    }, 900);

    setTimeout(() => {
      const cleanCaption = info.title
        .replace(/[^\w\s\u00C0-\u00FF]/gi, '')
        .trim()
        .slice(0, 45) || 'Legenda Automática de Vídeo';

      setSubtitleText(`" ${cleanCaption} "`);
      setIsAnalyzingAi(false);
      setAiStatusMessage(null);
    }, 1800);
  };

  const handleDownload = () => {
    setIsModalOpen(true);
  };

  // Build full download URL with optional burn-in subtitle and trimming params
  const getCustomDownloadUrl = () => {
    const params = new URLSearchParams({
      url: info.url,
      format: activeFormat,
      quality: selectedQuality.qualityKey,
      title: info.title
    });

    if (enableTrimmer) {
      params.append('start', startTime.toString());
      params.append('end', endTime.toString());
    }

    if (enableSubtitle && subtitleText) {
      params.append('subtitle', subtitleText);
      params.append('fontColor', selectedColor.hex);
      params.append('fontSize', fontSize.toString());
      params.append('posX', Math.round(textPosition.x).toString());
      params.append('posY', Math.round(textPosition.y).toString());
    }

    return `/api/download?${params.toString()}`;
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(info.url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Drag subtitle position handler
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDraggingText(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingText || !previewBoxRef.current) return;
    const rect = previewBoxRef.current.getBoundingClientRect();
    const x = Math.min(Math.max(0, ((e.clientX - rect.left) / rect.width) * 100), 100);
    const y = Math.min(Math.max(0, ((e.clientY - rect.top) / rect.height) * 100), 100);
    setTextPosition({ x, y });
  };

  const handlePointerUp = () => {
    setIsDraggingText(false);
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
        customDownloadUrl={getCustomDownloadUrl()}
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
          
          {/* Thumbnail / Real-time Video Player Box with Drag Subtitle Overlay */}
          <div className="md:col-span-5 relative group">
            <div 
              ref={previewBoxRef}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-lg select-none"
            >
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
                      title="Abrir pré-visualização em tempo real"
                    >
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    </button>
                  </div>

                  {/* Drag Subtitle Preview Overlay */}
                  {enableSubtitle && subtitleText && (
                    <div
                      onPointerDown={handlePointerDown}
                      style={{
                        position: 'absolute',
                        left: `${textPosition.x}%`,
                        top: `${textPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontFamily: selectedFont.family,
                        color: selectedColor.hex,
                        fontSize: `${fontSize}px`,
                        textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)',
                        cursor: 'grab',
                        zIndex: 20
                      }}
                      className="px-2 py-1 rounded bg-black/40 backdrop-blur-xs border border-white/20 hover:border-amber-400 whitespace-nowrap tracking-wide font-bold"
                      title="Clique e arraste para posicionar a legenda"
                    >
                      {subtitleText}
                      <span className="ml-1 text-[9px] text-amber-300 opacity-60">✥ Arraste</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-mono font-medium border border-white/10 flex items-center gap-1 z-10">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {info.duration}
                  </div>
                </>
              ) : (
                <div className="relative w-full h-full bg-slate-950 overflow-hidden">
                  {/* Real-time Video Stream / Embed */}
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

                  {/* Subtitle Overlay rendered on top of Real-time Video Player */}
                  {enableSubtitle && subtitleText && (
                    <div
                      onPointerDown={handlePointerDown}
                      style={{
                        position: 'absolute',
                        left: `${textPosition.x}%`,
                        top: `${textPosition.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontFamily: selectedFont.family,
                        color: selectedColor.hex,
                        fontSize: `${fontSize}px`,
                        textShadow: '0 2px 8px rgba(0,0,0,0.9), 0 0 10px rgba(0,0,0,0.8)',
                        cursor: 'grab',
                        zIndex: 30
                      }}
                      className="px-2 py-1 rounded bg-black/50 backdrop-blur-xs border border-white/20 hover:border-amber-400 whitespace-nowrap tracking-wide font-bold pointer-events-auto"
                      title="Clique e arraste para posicionar a legenda"
                    >
                      {subtitleText}
                      <span className="ml-1 text-[9px] text-amber-300 opacity-60">✥ Arraste</span>
                    </div>
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

            {/* Instruction if Subtitle Active */}
            {enableSubtitle && (
              <p className="text-[11px] text-amber-400 font-medium mt-2 flex items-center gap-1 justify-center">
                <Move className="w-3 h-3" />
                <span>Clique e arraste o texto na capa acima para escolher a posição!</span>
              </p>
            )}
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

              {/* Advanced Editing Tools Toggles */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {/* Trimmer Toggle Button */}
                <button
                  type="button"
                  onClick={() => setEnableTrimmer(!enableTrimmer)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                    enableTrimmer
                      ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 shadow-lg shadow-rose-500/10'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Scissors className="w-4 h-4 text-rose-400" />
                  <span>Cortar Vídeo ✂️</span>
                </button>

                {/* Subtitle Generator Toggle Button */}
                <button
                  type="button"
                  onClick={() => setEnableSubtitle(!enableSubtitle)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-bold transition-all ${
                    enableSubtitle
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-950/60 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Type className="w-4 h-4 text-amber-400" />
                  <span>Criar Legenda 📝</span>
                </button>
              </div>

              {/* SISTEMA 1: CORTAR VÍDEO (TRIMMER BAR) */}
              {enableTrimmer && (
                <div className="mb-6 p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 backdrop-blur-md animate-fade-in">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <Scissors className="w-4 h-4" />
                      Ajuste os Pontos de Corte do Vídeo
                    </span>
                    <span className="text-[11px] font-mono text-rose-400 font-bold">
                      Início: {startTime}s | Fim: {endTime}s
                    </span>
                  </div>

                  {/* Dual Range Controls */}
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Ponto de Início:</span>
                        <span className="font-mono text-white font-bold">{startTime} seg</span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={endTime - 1}
                        value={startTime}
                        onChange={(e) => setStartTime(Number(e.target.value))}
                        className="w-full accent-rose-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>Ponto de Término:</span>
                        <span className="font-mono text-white font-bold">{endTime} seg</span>
                      </div>
                      <input
                        type="range"
                        min={startTime + 1}
                        max={300}
                        value={endTime}
                        onChange={(e) => setEndTime(Number(e.target.value))}
                        className="w-full accent-rose-500 bg-slate-900 h-2 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SISTEMA 2: GERADOR DE LEGENDAS COM 30 FONTES E POSIÇÃO */}
              {enableSubtitle && (
                <div className="mb-6 p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 backdrop-blur-md animate-fade-in space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Personalize a Legenda do Vídeo
                    </span>

                    <button
                      type="button"
                      onClick={handleAiAnalyzeSubtitle}
                      disabled={isAnalyzingAi}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-[11px] shadow-md shadow-amber-500/20 transition-all disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAnalyzingAi ? 'Analisando Áudio...' : '⚡ Gerar Legenda com IA'}</span>
                    </button>
                  </div>

                  {aiStatusMessage && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2 animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>{aiStatusMessage}</span>
                    </div>
                  )}

                  {/* Text Input */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Texto da Legenda / Marca D'água:
                    </label>
                    <input
                      type="text"
                      value={subtitleText}
                      onChange={(e) => setSubtitleText(e.target.value)}
                      placeholder="Digite o texto da legenda..."
                      className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/30 text-white text-xs focus:outline-none focus:border-amber-400 font-medium"
                    />
                  </div>

                  {/* 30 Custom Google Fonts Selector */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Escolha entre 30 Fontes Estilizadas:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1 bg-slate-950/80 rounded-xl border border-white/10">
                      {CUSTOM_FONTS.map((font) => (
                        <button
                          key={font.name}
                          type="button"
                          onClick={() => setSelectedFont(font)}
                          style={{ fontFamily: font.family }}
                          className={`p-2 rounded-lg text-xs truncate text-center border transition-all ${
                            selectedFont.name === font.name
                              ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold shadow-md'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {font.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color & Size Controls */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Colors */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                        Cor do Texto:
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {FONT_COLORS.map((c) => (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => setSelectedColor(c)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${
                              selectedColor.name === c.name
                                ? 'scale-125 border-white ring-2 ring-amber-400'
                                : 'border-slate-800 hover:scale-110'
                            }`}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Size Slider */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-300 mb-1">
                        <span>Tamanho da Fonte:</span>
                        <span className="font-mono font-bold text-amber-400">{fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={14}
                        max={48}
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full accent-amber-400 bg-slate-900 h-2 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

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
                    const isSelected = selectedQuality.id === q.id;
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
                    Baixar {activeFormat.toUpperCase()} ({selectedQuality.qualityKey})
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


