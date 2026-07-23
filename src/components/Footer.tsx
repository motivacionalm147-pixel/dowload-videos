import React from 'react';
import { Download, Heart, ShieldCheck, Youtube, Music, Instagram, Facebook } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-xs py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-900">
          
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center text-white">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200 text-sm">MediaGrab HD</span>
              <p className="text-[11px] text-slate-500">Downloader de Vídeos & Áudios para YouTube, TikTok, Instagram e Facebook</p>
            </div>
          </div>

          {/* Social / Supported Icons */}
          <div className="flex items-center gap-4 text-slate-400">
            <Youtube className="w-5 h-5 hover:text-red-400 transition-colors" />
            <Music className="w-5 h-5 hover:text-cyan-400 transition-colors" />
            <Instagram className="w-5 h-5 hover:text-pink-400 transition-colors" />
            <Facebook className="w-5 h-5 hover:text-blue-400 transition-colors" />
          </div>

        </div>

        {/* Copyright & Disclaimer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© {new Date().getFullYear()} MediaGrab HD. Todos os direitos reservados. Uso pessoal e educativo.</p>
          <div className="flex items-center gap-1">
            <span>Desenvolvido com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>para alta performance.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
