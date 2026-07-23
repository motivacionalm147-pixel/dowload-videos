export type PlatformType = 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'unknown';

export type DownloadFormat = 'mp4' | 'mp3';

export interface QualityOption {
  id: string;
  label: string; // e.g. "1080p Full HD", "720p HD", "320 kbps (MP3)"
  resolution?: string; // e.g. "1920x1080"
  bitrate?: string;
  estimatedSize: string; // e.g. "45.2 MB"
  format: DownloadFormat;
  qualityKey: string; // e.g. "1080p", "720p", "320k"
  isPopular?: boolean;
}

export interface VideoInfo {
  url: string;
  platform: PlatformType;
  title: string;
  author: string;
  authorAvatar?: string;
  thumbnail: string;
  duration: string; // e.g. "03:45"
  views?: string;
  downloadUrl?: string;
  streamUrl?: string;
  description?: string;
  qualities: QualityOption[];
}

export interface DownloadHistoryItem {
  id: string;
  title: string;
  platform: PlatformType;
  thumbnail: string;
  format: DownloadFormat;
  quality: string;
  downloadedAt: string;
  fileSize: string;
  url: string;
}

export interface BatchItem {
  id: string;
  url: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  info?: VideoInfo;
  error?: string;
  selectedFormat: DownloadFormat;
  selectedQuality: string;
}
