import { PlatformType, VideoInfo, QualityOption } from '../src/types';
import { execFile } from 'child_process';
import path from 'path';

const isWin = process.platform === "win32";
const YT_DLP_PATH = path.resolve(isWin ? "yt-dlp.exe" : "yt-dlp");

export function detectPlatform(url: string): PlatformType {
  const lower = url.trim().toLowerCase();
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) {
    return 'youtube';
  }
  if (lower.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) {
    return 'instagram';
  }
  if (lower.includes('facebook.com') || lower.includes('fb.watch') || lower.includes('fb.com')) {
    return 'facebook';
  }
  return 'unknown';
}

export function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function formatDuration(seconds?: number): string {
  if (!seconds || isNaN(seconds)) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const mStr = mins.toString().padStart(2, '0');
  const sStr = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mStr}:${sStr}`;
  }
  return `${mStr}:${sStr}`;
}

export function formatViews(views?: number, likes?: number): string {
  const count = views || likes;
  if (!count) return 'Mídia Online';
  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1)}M visualizações`;
  }
  if (count >= 1_000) {
    return `${Math.round(count / 1_000)}K visualizações`;
  }
  return `${count} visualizações`;
}

export function generateDefaultQualities(maxHeight: number = 1080): QualityOption[] {
  const qualities: QualityOption[] = [];
  const effectiveMaxHeight = Math.max(maxHeight || 1080, 1080);

  if (effectiveMaxHeight >= 2160) {
    qualities.push({
      id: 'mp4-2160',
      label: '4K Ultra HD',
      resolution: '3840x2160',
      estimatedSize: '~1.5 GB - 5 GB',
      format: 'mp4',
      qualityKey: '2160p',
      isPopular: true
    });
  }

  if (effectiveMaxHeight >= 1440) {
    qualities.push({
      id: 'mp4-1440',
      label: '2K QHD',
      resolution: '2560x1440',
      estimatedSize: '~800 MB - 2.5 GB',
      format: 'mp4',
      qualityKey: '1440p'
    });
  }

  qualities.push({
    id: 'mp4-1080',
    label: '1080p Full HD',
    resolution: '1920x1080',
    estimatedSize: '~300 MB - 1.2 GB',
    format: 'mp4',
    qualityKey: '1080p',
    isPopular: effectiveMaxHeight < 2160
  });

  qualities.push({
    id: 'mp4-720',
    label: '720p HD',
    resolution: '1280x720',
    estimatedSize: '~150 MB - 600 MB',
    format: 'mp4',
    qualityKey: '720p'
  });

  qualities.push({
    id: 'mp4-480',
    label: '480p SD',
    resolution: '854x480',
    estimatedSize: '~80 MB - 300 MB',
    format: 'mp4',
    qualityKey: '480p'
  });

  qualities.push({
    id: 'mp4-360',
    label: '360p',
    resolution: '640x360',
    estimatedSize: '~40 MB - 150 MB',
    format: 'mp4',
    qualityKey: '360p'
  });

  qualities.push({
    id: 'mp3-320',
    label: 'MP3 Áudio Alta Qualidade',
    bitrate: '320 kbps',
    estimatedSize: '~10 MB - 60 MB',
    format: 'mp3',
    qualityKey: '320k',
    isPopular: true
  });

  qualities.push({
    id: 'mp3-128',
    label: 'MP3 Áudio Padrão',
    bitrate: '128 kbps',
    estimatedSize: '~5 MB - 30 MB',
    format: 'mp3',
    qualityKey: '128k'
  });

  return qualities;
}

export function getYtDlpJson(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const args = [
      '-j',
      '--no-playlist',
      '--js-runtimes', 'node',
      '--no-warnings',
      url
    ];

    execFile(YT_DLP_PATH, args, { timeout: 30000, maxBuffer: 20 * 1024 * 1024 }, (error, stdout) => {
      if (error) {
        return reject(error);
      }
      try {
        const json = JSON.parse(stdout);
        resolve(json);
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

export async function fetchVideoDetails(url: string): Promise<VideoInfo> {
  const platform = detectPlatform(url);
  const cleanUrl = url.trim();

  try {
    const info = await getYtDlpJson(cleanUrl);
    const title = info.title || info.fulltitle || 'Vídeo Selecionado';
    const author = info.uploader || info.channel || info.creator || info.artist || '@criador';
    const thumbnail = info.thumbnail || (info.thumbnails && info.thumbnails.length ? info.thumbnails[info.thumbnails.length - 1].url : '');
    const duration = formatDuration(info.duration);
    const views = formatViews(info.view_count, info.like_count);

    let maxHeight = 1080;
    if (info.formats && Array.isArray(info.formats) && info.formats.length > 0) {
      const heights = info.formats
        .map((f: any) => f.height)
        .filter((h: any) => typeof h === 'number' && h > 0);
      if (heights.length > 0) {
        maxHeight = Math.max(...heights);
      }
    } else if (info.height && typeof info.height === 'number') {
      maxHeight = info.height;
    }

    return {
      url: cleanUrl,
      platform,
      title,
      author,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
      duration,
      views,
      qualities: generateDefaultQualities(maxHeight)
    };
  } catch (error) {
    console.warn('yt-dlp fetch error, using oEmbed fallback:', error);
  }

  // Fallback if yt-dlp fails to extract JSON
  let title = 'Vídeo Selecionado';
  let author = 'Criador de Conteúdo';
  let thumbnail = '';
  let duration = '03:15';
  let views = 'Mídia Online';

  if (platform === 'youtube') {
    const videoId = extractYouTubeId(cleanUrl);
    if (videoId) {
      thumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }

    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`;
      const res = await fetch(oembedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const data = await res.json();
        if (data.title) title = data.title;
        if (data.author_name) author = data.author_name;
        if (data.thumbnail_url) thumbnail = data.thumbnail_url;
      }
    } catch (err) {
      console.warn('YouTube oEmbed fallback error', err);
    }

    if (!title || title === 'Vídeo Selecionado') {
      title = videoId ? `Vídeo do YouTube (#${videoId})` : 'Vídeo em Alta Definição do YouTube';
    }
  } else if (platform === 'tiktok') {
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
      const res = await fetch(oembedUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (res.ok) {
        const data = await res.json();
        if (data.title) title = data.title;
        if (data.author_name) author = `@${data.author_name}`;
        if (data.thumbnail_url) thumbnail = data.thumbnail_url;
      }
    } catch (err) {
      console.warn('TikTok oEmbed fallback error', err);
    }
  }

  return {
    url: cleanUrl,
    platform,
    title,
    author,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80',
    duration,
    views,
    qualities: generateDefaultQualities(1080)
  };
}

