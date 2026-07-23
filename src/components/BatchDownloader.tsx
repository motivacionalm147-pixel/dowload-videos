import React, { useState } from 'react';
import { Layers, Play, CheckCircle2, Loader2, Download, AlertCircle, Trash2, Youtube, Music, Instagram, Facebook } from 'lucide-react';
import { BatchItem, DownloadFormat } from '../types';

interface BatchDownloaderProps {
  onProcessBatchUrl: (url: string) => Promise<any>;
}

export const BatchDownloader: React.FC<BatchDownloaderProps> = ({ onProcessBatchUrl }) => {
  const [rawText, setRawText] = useState('');
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStartBatch = async () => {
    const lines = rawText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 5);

    if (lines.length === 0) return;

    const newItems: BatchItem[] = lines.map((url, idx) => ({
      id: `batch-${Date.now()}-${idx}`,
      url,
      status: 'pending',
      selectedFormat: 'mp4',
      selectedQuality: '1080p'
    }));

    setBatchItems(newItems);
    setIsProcessing(true);

    for (let i = 0; i < newItems.length; i++) {
      const item = newItems[i];
      setBatchItems(prev =>
        prev.map(it => (it.id === item.id ? { ...it, status: 'loading' } : it))
      );

      try {
        const info = await onProcessBatchUrl(item.url);
        setBatchItems(prev =>
          prev.map(it => (it.id === item.id ? { ...it, status: 'success', info } : it))
        );
      } catch (err) {
        setBatchItems(prev =>
          prev.map(it =>
            it.id === item.id
              ? { ...it, status: 'error', error: 'Falha ao buscar este link' }
              : it
          )
        );
      }
    }

    setIsProcessing(false);
  };

  const handleDownloadSingleBatch = (item: BatchItem) => {
    if (!item.info) return;
    const title = item.info.title || 'video';
    const downloadUrl = `/api/download?url=${encodeURIComponent(item.url)}&format=${item.selectedFormat}&quality=${item.selectedQuality}&title=${encodeURIComponent(title)}`;
    
    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAllSuccess = () => {
    batchItems.filter(i => i.status === 'success').forEach((item, index) => {
      setTimeout(() => {
        handleDownloadSingleBatch(item);
      }, index * 600);
    });
  };

  const clearBatch = () => {
    setRawText('');
    setBatchItems([]);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass-card border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Download em Lote (Múltiplos Links)</h2>
            <p className="text-xs text-slate-400">Cole múltiplos links de vídeos (um por linha) para baixar tudo de uma vez.</p>
          </div>
        </div>

        {/* Textarea */}
        <div className="mb-6">
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={5}
            placeholder={`Cole seus links aqui, um por linha:\nhttps://www.youtube.com/watch?v=...\nhttps://www.tiktok.com/@user/video/...\nhttps://www.instagram.com/reel/...`}
            className="w-full glass-input border border-white/15 rounded-2xl p-4 text-slate-200 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-400 backdrop-blur-md transition-all font-mono"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div className="text-xs text-slate-400">
            {rawText.split('\n').filter(l => l.trim()).length} link(s) detectado(s)
          </div>

          <div className="flex items-center gap-3">
            {batchItems.length > 0 && (
              <button
                onClick={clearBatch}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span>Limpar</span>
              </button>
            )}

            <button
              onClick={handleStartBatch}
              disabled={isProcessing || !rawText.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-indigo-600 text-white font-semibold text-sm shadow-lg shadow-rose-500/20 hover:opacity-95 disabled:opacity-50 transition-all"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando Lote...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Analisar Todos os Links</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Batch Items Results */}
        {batchItems.length > 0 && (
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Resultados da Análise ({batchItems.filter(i => i.status === 'success').length}/{batchItems.length})
              </h3>

              {batchItems.some(i => i.status === 'success') && (
                <button
                  onClick={handleDownloadAllSuccess}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Todos Concluídos</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {batchItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    {item.status === 'loading' && <Loader2 className="w-5 h-5 text-indigo-400 animate-spin shrink-0" />}
                    {item.status === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {item.status === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                    {item.status === 'pending' && <div className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />}

                    <div className="truncate">
                      <p className="font-semibold text-slate-200 truncate">
                        {item.info ? item.info.title : item.url}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {item.info ? `${item.info.author} • ${item.info.duration}` : item.url}
                      </p>
                    </div>
                  </div>

                  {item.status === 'success' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={item.selectedFormat}
                        onChange={(e) => {
                          const fmt = e.target.value as DownloadFormat;
                          setBatchItems(prev =>
                            prev.map(i => i.id === item.id ? { ...i, selectedFormat: fmt } : i)
                          );
                        }}
                        className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2 py-1 font-medium"
                      >
                        <option value="mp4">MP4 (Vídeo)</option>
                        <option value="mp3">MP3 (Áudio)</option>
                      </select>

                      <button
                        onClick={() => handleDownloadSingleBatch(item)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Baixar</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
