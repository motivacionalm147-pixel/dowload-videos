import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { UrlInputSection } from './components/UrlInputSection';
import { VideoResultCard } from './components/VideoResultCard';
import { BatchDownloader } from './components/BatchDownloader';
import { DownloadHistory } from './components/DownloadHistory';
import { FeaturesAndFAQ } from './components/FeaturesAndFAQ';
import { Footer } from './components/Footer';
import { VideoInfo, PlatformType, DownloadHistoryItem, DownloadFormat, QualityOption } from './types';
import { detectPlatform } from './utils';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

const HISTORY_STORAGE_KEY = 'mediagrab_download_history_v1';

export default function App() {
  const [url, setUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'single' | 'batch' | 'history'>('single');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<DownloadHistoryItem[]>([]);

  const detectedPlatform: PlatformType = url ? detectPlatform(url) : 'unknown';

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }, []);

  // Save history to localStorage
  const saveHistoryItem = (item: DownloadHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter(i => i.id !== item.id)].slice(0, 30);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (err) {
        console.warn('Error saving history:', err);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch (err) {
      console.warn('Error clearing history:', err);
    }
  };

  const handleSearch = async (overrideUrl?: string) => {
    const targetUrl = (overrideUrl || url).trim();
    if (!targetUrl) return;

    setIsLoading(true);
    setErrorMessage(null);
    setVideoInfo(null);

    try {
      const response = await fetch('/api/fetch-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Não foi possível buscar as informações do vídeo.');
      }

      const data: VideoInfo = await response.json();
      setVideoInfo(data);
      setActiveTab('single');
    } catch (err: any) {
      console.error('Fetch video error:', err);
      setErrorMessage(
        err.message || 'Verifique se o link está correto e tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadStart = (format: DownloadFormat, quality: QualityOption) => {
    if (!videoInfo) return;

    const downloadUrl = `/api/download?url=${encodeURIComponent(videoInfo.url)}&format=${format}&quality=${quality.qualityKey}&title=${encodeURIComponent(videoInfo.title)}`;

    // Save to history log
    const historyItem: DownloadHistoryItem = {
      id: `hist-${Date.now()}`,
      title: videoInfo.title,
      platform: videoInfo.platform,
      thumbnail: videoInfo.thumbnail,
      format,
      quality: quality.qualityKey,
      downloadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      fileSize: quality.estimatedSize,
      url: videoInfo.url,
    };
    saveHistoryItem(historyItem);

    // Trigger browser download anchor
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processBatchUrl = async (batchUrl: string) => {
    const response = await fetch('/api/fetch-info', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: batchUrl }),
    });

    if (!response.ok) {
      throw new Error('Falha ao processar link');
    }

    return await response.json();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Frosted Ambient Glow Blobs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none animate-pulse-slow -z-10" style={{ animationDelay: '3s' }} />
      <div className="fixed top-1/3 right-10 w-[350px] h-[350px] bg-rose-600/15 rounded-full blur-[100px] pointer-events-none -z-10" />
      
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={history.length}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* URL Input Hero Section (Visible in single tab or as main header) */}
        {activeTab === 'single' && (
          <>
            <UrlInputSection
              url={url}
              setUrl={setUrl}
              onSearch={handleSearch}
              isLoading={isLoading}
              detectedPlatform={detectedPlatform}
            />

            {/* Search Loading Indicator Card */}
            {isLoading && (
              <div className="max-w-2xl mx-auto px-4 mb-12 animate-fade-in">
                <div className="glass-card border border-indigo-500/30 rounded-3xl p-8 shadow-2xl backdrop-blur-2xl text-center flex flex-col items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-500 via-indigo-600 to-cyan-400 p-0.5 mb-4 shadow-xl shadow-indigo-500/30">
                    <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-rose-400 animate-spin" />
                    </div>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mb-1">Localizando Mídia e Analisando Qualidades...</h3>
                  <p className="text-xs text-slate-400">Verificando disponibilidades em Full HD (1080p) e áudio MP3 (320k).</p>
                </div>
              </div>
            )}

            {/* Error banner if search fails */}
            {errorMessage && (
              <div className="max-w-2xl mx-auto px-4 mb-8">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm shadow-lg">
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                  <p className="flex-1">{errorMessage}</p>
                  <button
                    onClick={() => handleSearch()}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Tentar Novamente</span>
                  </button>
                </div>
              </div>
            )}

            {/* Video Result Box */}
            {videoInfo && (
              <VideoResultCard
                info={videoInfo}
                onDownloadStart={handleDownloadStart}
              />
            )}

            {/* Quick Recent Downloads Section on Main Page */}
            {!videoInfo && history.length > 0 && (
              <div className="max-w-4xl mx-auto px-4 mt-4 mb-12">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <span>Últimos Vídeos Baixados</span>
                  </h3>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    Ver Histórico Completo ({history.length}) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {history.slice(0, 3).map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setActiveTab('history')}
                      className="group cursor-pointer glass-card border border-white/10 rounded-2xl p-3 flex items-center gap-3 hover:border-indigo-500/50 transition-all"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-14 h-10 rounded-xl object-cover shrink-0 border border-slate-700 group-hover:scale-105 transition-transform"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-indigo-300 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {item.format.toUpperCase()} • {item.quality}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Batch Downloader View */}
        {activeTab === 'batch' && (
          <BatchDownloader onProcessBatchUrl={processBatchUrl} />
        )}

        {/* Download History View */}
        {activeTab === 'history' && (
          <DownloadHistory history={history} onClearHistory={handleClearHistory} />
        )}

      </main>

      {/* Footer */}
      <Footer />

    </div>
  );
}
