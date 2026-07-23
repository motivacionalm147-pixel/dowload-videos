import React, { useState } from 'react';
import { Youtube, Music, Instagram, Facebook, ShieldCheck, Zap, Sparkles, HelpCircle, ChevronDown, CheckCircle2, Download, HardDrive } from 'lucide-react';

export const FeaturesAndFAQ: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const platformsList = [
    {
      name: 'YouTube Downloader',
      icon: Youtube,
      color: 'from-red-500/20 to-rose-600/10 border-red-500/30 text-red-400',
      badge: 'Vídeos & Shorts',
      desc: 'Baixe vídeos em 1080p Full HD e extraia o áudio em MP3 com taxa de bits de até 320 kbps de alta fidelidade.'
    },
    {
      name: 'TikTok Downloader',
      icon: Music,
      color: 'from-cyan-500/20 to-blue-600/10 border-cyan-500/30 text-cyan-300',
      badge: 'Sem Marca d\'Água',
      desc: 'Remoção automática da marca d\'água do TikTok. Baixe vídeos em MP4 HD e músicas virais em MP3 rapidamente.'
    },
    {
      name: 'Instagram Downloader',
      icon: Instagram,
      color: 'from-pink-500/20 to-purple-600/10 border-pink-500/30 text-pink-400',
      badge: 'Reels, Feed & Stories',
      desc: 'Baixe Reels, vídeos do feed e carrosséis do Instagram na resolução original e com alta taxa de quadros.'
    },
    {
      name: 'Facebook Downloader',
      icon: Facebook,
      color: 'from-blue-500/20 to-indigo-600/10 border-blue-500/30 text-blue-400',
      badge: 'Vídeos HD & Reels',
      desc: 'Suporte para vídeos públicos do Facebook em qualidade HD e SD, com áudio e vídeo totalmente sincronizados.'
    }
  ];

  const faqs = [
    {
      q: 'Como baixar vídeos do YouTube, TikTok, Instagram e Facebook?',
      a: 'É muito simples! 1. Copie o link do vídeo na plataforma desejada. 2. Cole a URL no campo de busca do nosso site. 3. Clique em "Baixar", escolha a qualidade desejada (1080p, 720p ou MP3) e confirme!'
    },
    {
      q: 'Os vídeos do TikTok vêm sem marca d\'água?',
      a: 'Sim! Nosso sistema remove automaticamente a marca d\'água oficial do TikTok, entregando o arquivo MP4 limpo e na máxima resolução.'
    },
    {
      q: 'É possível converter apenas o áudio para MP3?',
      a: 'Com certeza! Você pode selecionar o formato MP3 em qualquer link e escolher entre qualidade alta (320 kbps) ou padrão (128 kbps).'
    },
    {
      q: 'Funciona no celular, Android e iPhone (iOS)?',
      a: 'Sim! Nosso site é 100% responsivo e funciona perfeitamente em qualquer navegador moderno no celular, tablet ou computador, sem necessidade de baixar aplicativos.'
    },
    {
      q: 'O serviço é seguro e gratuito?',
      a: 'Totalmente gratuito e seguro. Não armazenamos seus dados pessoais e todas as transferências são criptografadas.'
    }
  ];

  return (
    <section className="py-12 border-t border-slate-800/80 bg-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Why choose us badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="flex items-start gap-4 p-5 rounded-2xl glass-card glass-card-hover border border-white/10 backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0 backdrop-blur-md">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Download de Alta Velocidade</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Processamento instantâneo com conversores otimizados para liberar o download em segundos.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl glass-card glass-card-hover border border-white/10 backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0 backdrop-blur-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">Múltiplas Qualidades (MP4 e MP3)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Escolha a resolução ideal para você: 1080p Full HD, 720p HD, 480p ou extraia áudios em MP3 320 kbps.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-5 rounded-2xl glass-card glass-card-hover border border-white/10 backdrop-blur-xl">
            <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0 backdrop-blur-md">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white mb-1">100% Grátis e Sem Registro</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Nenhum cadastro ou aplicativo necessário. Baixe quantos vídeos desejar diretamente pelo navegador.
              </p>
            </div>
          </div>
        </div>

        {/* Supported Platforms Grid */}
        <div className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
              Plataformas Suportadas
            </h2>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Extração completa com suporte às principais redes sociais e agregadores de vídeo do mundo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {platformsList.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.name}
                  className={`p-6 rounded-2xl bg-gradient-to-b ${p.color} border backdrop-blur-sm transition-transform hover:-translate-y-1`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8" />
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-950/80 text-[10px] font-bold text-slate-200 border border-white/10">
                      {p.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{p.name}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold mb-3">
              <HelpCircle className="w-4 h-4" />
              Perguntas Frequentes
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Tire suas dúvidas</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left flex items-center justify-between font-semibold text-sm sm:text-base text-slate-100 hover:text-white transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-indigo-400 transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 border-t border-slate-800/50 leading-relaxed bg-slate-950/40">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};
