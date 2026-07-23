import React, { useState, useEffect } from 'react';
import { DownloadFormat, QualityOption, VideoInfo } from '../types';
import { 
  X, 
  Loader2, 
  CheckCircle2, 
  FileVideo, 
  FileAudio, 
  HardDrive, 
  Sparkles, 
  AlertCircle,
  Download,
  Clock,
  Youtube,
  Music,
  Instagram,
  Facebook,
  FolderOpen
} from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  info: VideoInfo;
  format: DownloadFormat;
  quality: QualityOption;
  onSaveHistory: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  info,
  format,
  quality,
  onSaveHistory
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('Iniciando conexão com o servidor...');
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setIsCompleted(false);
      setErrorMsg(null);
      setCurrentStep(1);
      return;
    }

    let isSubscribed = true;
    setProgress(5);
    setStatusText('Conectando ao servidor e solicitando mídia...');
    setCurrentStep(1);

    // Progress animation timer simulating server preparation
    const progressInterval = setInterval(() => {
      if (!isSubscribed) return;
      setProgress((prev) => {
        if (prev < 30) {
          setCurrentStep(1);
          setStatusText('Conectando ao servidor e solicitando mídia...');
          return prev + 5;
        } else if (prev < 70) {
          setCurrentStep(2);
          setStatusText('Baixando faixas de vídeo e áudio em alta qualidade...');
          return prev + 3;
        } else if (prev < 92) {
          setCurrentStep(3);
          setStatusText('Processando e unindo faixas via ffmpeg (vídeo pesado)...');
          return prev + 1;
        }
        return 92;
      });
    }, 400);

    // Trigger actual download via fetch API
    const downloadUrl = `/api/download?url=${encodeURIComponent(info.url)}&format=${format}&quality=${quality.qualityKey}&title=${encodeURIComponent(info.title)}`;

    fetch(downloadUrl)
      .then(async (res) => {
        if (!res.ok) {
          const errText = await res.text().catch(() => 'Erro ao baixar o vídeo');
          throw new Error(errText || 'Falha ao processar o download.');
        }

        const blob = await res.blob();
        if (!isSubscribed) return;

        clearInterval(progressInterval);
        setProgress(100);
        setCurrentStep(4);
        setStatusText('Download concluído com sucesso!');
        setIsCompleted(true);

        // Trigger browser file save
        const objectUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = objectUrl;

        const platformName = info.platform === 'unknown' ? 'MEDIA' : info.platform.toUpperCase();
        const cleanTitle = info.title
          .replace(/[^a-zA-Z0-9 \-_áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g, '')
          .trim()
          .replace(/\s+/g, '_')
          .slice(0, 50) || 'video';
        const ext = format === 'mp3' ? 'mp3' : 'mp4';
        a.download = `${platformName}_${cleanTitle}_${quality.qualityKey}.${ext}`;

        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(objectUrl);

        onSaveHistory();
      })
      .catch((err) => {
        if (!isSubscribed) return;
        clearInterval(progressInterval);
        console.error('Download modal error:', err);
        setErrorMsg(err.message || 'Ocorreu um erro durante o download. Tente novamente.');
      });

    return () => {
      isSubscribed = false;
      clearInterval(progressInterval);
    };
  }, [isOpen, info, format, quality]);

  if (!isOpen) return null;

  const getPlatformBadge = () => {
    switch (info.platform) {
      case 'youtube':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 rounded-full"><Youtube className="w-3.5 h-3.5" /> YouTube</span>;
      case 'tiktok':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full"><Music className="w-3.5 h-3.5" /> TikTok</span>;
      case 'instagram':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full"><Instagram className="w-3.5 h-3.5" /> Instagram</span>;
      case 'facebook':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full"><Facebook className="w-3.5 h-3.5" /> Facebook</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-slate-700 text-slate-300 rounded-full">Vídeo Web</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-[94vw] sm:w-full max-w-lg max-h-[92vh] overflow-y-auto glass-card border border-white/15 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl shadow-indigo-950/80">
        
        {/* Glow ambient decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2">
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400 shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400 animate-spin shrink-0" />
            )}
            <h3 className="text-sm sm:text-lg font-bold text-white truncate">
              {isCompleted ? 'Download Concluído!' : 'Baixando e Processando Mídia'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 sm:p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="py-4 sm:py-6 relative z-10">
          
          {/* Card Info Box */}
          <div className="flex gap-3 sm:gap-4 p-3 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 mb-4 sm:mb-6">
            <img
              src={info.thumbnail}
              alt={info.title}
              className="w-16 h-12 sm:w-20 sm:h-14 rounded-xl object-cover shrink-0 border border-slate-700"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getPlatformBadge()}
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-bold font-mono">
                  {format.toUpperCase()} - {quality.qualityKey}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-semibold text-white truncate mb-1">
                {info.title}
              </h4>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                {quality.resolution || quality.bitrate || ''} ~ {quality.estimatedSize}
              </p>
            </div>
          </div>

          {/* Error Banner */}
          {errorMsg ? (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs shadow-lg mb-6">
              <div className="flex items-center gap-2 mb-2 font-bold text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>Ocorreu um erro no processamento</span>
              </div>
              <p className="mb-3">{errorMsg}</p>
              <button
                onClick={onClose}
                className="w-full py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 font-semibold text-xs transition-all"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              {/* Animated Progress Bar */}
              <div className="mb-5 sm:mb-6">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5 truncate">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span className="truncate">{statusText}</span>
                  </span>
                  <span className="font-mono text-indigo-300 text-sm font-bold shrink-0 ml-2">{progress}%</span>
                </div>

                <div className="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-white/10 overflow-hidden relative shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Process Step Checklist */}
              <div className="space-y-2 sm:space-y-2.5 mb-5 sm:mb-6 bg-slate-950/50 p-3.5 sm:p-4 rounded-2xl border border-white/5 text-xs">
                
                <div className={`flex items-center gap-2.5 sm:gap-3 transition-colors ${currentStep >= 1 ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                  {currentStep > 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : currentStep === 1 ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>1. Conectando e validando links do vídeo</span>
                </div>

                <div className={`flex items-center gap-2.5 sm:gap-3 transition-colors ${currentStep >= 2 ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                  {currentStep > 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : currentStep === 2 ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>2. Extraindo faixas de áudio e vídeo HD no servidor</span>
                </div>

                <div className={`flex items-center gap-2.5 sm:gap-3 transition-colors ${currentStep >= 3 ? 'text-slate-200 font-medium' : 'text-slate-500'}`}>
                  {currentStep > 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : currentStep === 3 ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>3. Renderizando e unindo arquivo final</span>
                </div>

                <div className={`flex items-center gap-2.5 sm:gap-3 transition-colors ${currentStep >= 4 ? 'text-emerald-300 font-bold' : 'text-slate-500'}`}>
                  {currentStep === 4 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span>4. Transferindo arquivo para a pasta de downloads</span>
                </div>

              </div>

              {/* Informative Tip Box for Heavy Videos */}
              <div className="p-3 sm:p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-200 text-[11px] sm:text-xs leading-relaxed flex items-start gap-2 sm:gap-2.5">
                <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Vídeos pesados:</strong> O servidor une o áudio e vídeo HD em tempo real. O processo pode levar alguns segundos. Mantenha a tela aberta!
                </p>
              </div>
            </>
          )}

        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 sm:pt-4 border-t border-white/10 relative z-10">
          <button
            onClick={() => fetch('/api/open-downloads-folder', { method: 'POST' }).catch(() => {})}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
            title="Abrir pasta local de arquivos salvos do site"
          >
            <FolderOpen className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Abrir Pasta dos Downloads</span>
          </button>

          <button
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs transition-all ${
              isCompleted
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20 hover:scale-[1.02]'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isCompleted ? 'Concluído (Fechar)' : 'Cancelar / Minimizar'}
          </button>
        </div>

      </div>
    </div>
  );
};
