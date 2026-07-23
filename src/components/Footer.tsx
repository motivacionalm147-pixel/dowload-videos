import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/5 text-slate-500 text-[11px] py-6 text-center">
      <div className="max-w-7xl mx-auto px-4">
        <p>© {new Date().getFullYear()} MediaGrab HD • Downloader de Vídeos & Áudios</p>
      </div>
    </footer>
  );
};
