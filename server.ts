import express from "express";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import { createServer as createViteServer } from "vite";
import { fetchVideoDetails, detectPlatform } from "./server/extractors.ts";
import ffmpegPath from "ffmpeg-static";

const isWin = process.platform === "win32";
const YT_DLP_PATH = path.resolve(isWin ? "yt-dlp.exe" : "yt-dlp");
const TEMP_DIR = path.resolve("temp_downloads");
const SAVED_DOWNLOADS_DIR = path.resolve("Downloads_Do_Site");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

if (!fs.existsSync(SAVED_DOWNLOADS_DIR)) {
  fs.mkdirSync(SAVED_DOWNLOADS_DIR, { recursive: true });
}

// Cleanup stale files older than 15 minutes
function cleanupOldTempFiles() {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stat = fs.statSync(filePath);
      if (now - stat.mtimeMs > 15 * 60 * 1000) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.warn("Erro ao limpar temporários:", err);
  }
}

setInterval(cleanupOldTempFiles, 10 * 60 * 1000);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // API Health Check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "VideoDownloaderAPI" });
  });

  // Open Downloads Folder in Windows File Explorer
  app.post("/api/open-downloads-folder", (_req, res) => {
    try {
      if (!fs.existsSync(SAVED_DOWNLOADS_DIR)) {
        fs.mkdirSync(SAVED_DOWNLOADS_DIR, { recursive: true });
      }
      execFile("explorer.exe", [SAVED_DOWNLOADS_DIR]);
      return res.json({ status: "ok", path: SAVED_DOWNLOADS_DIR });
    } catch (err) {
      console.error("Erro ao abrir pasta:", err);
      return res.status(500).json({ error: "Não foi possível abrir a pasta de downloads." });
    }
  });

  // Fetch Video Info from URL
  app.post("/api/fetch-info", async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== "string") {
        return res.status(400).json({ error: "Insira uma URL válida do vídeo." });
      }

      const info = await fetchVideoDetails(url);
      return res.json(info);
    } catch (error: any) {
      console.error("Erro em /api/fetch-info:", error);
      return res.status(500).json({ error: "Não foi possível analisar este link. Verifique e tente novamente." });
    }
  });

  // Download File Endpoint
  app.get("/api/download", (req, res) => {
    try {
      const url = (req.query.url as string) || "";
      const format = (req.query.format as string) === "mp3" ? "mp3" : "mp4";
      const quality = (req.query.quality as string) || "1080p";
      const rawTitle = (req.query.title as string) || "video";

      if (!url) {
        return res.status(400).send("URL não informada.");
      }

      const platform = detectPlatform(url);
      const platformName = platform === "unknown" ? "MEDIA" : platform.toUpperCase();

      const cleanTitle = rawTitle
        .replace(/[^a-zA-Z0-9 \-_áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/g, "")
        .trim()
        .replace(/\s+/g, "_")
        .slice(0, 50) || "video";

      const extension = format === "mp3" ? "mp3" : "mp4";
      const clientFilename = `${platformName}_${cleanTitle}_${quality}.${extension}`;

      const downloadId = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const fileTemplate = path.join(TEMP_DIR, `dl_${downloadId}.%(ext)s`);

      const args = [
        "--ffmpeg-location", ffmpegPath || "",
        "--js-runtimes", "node",
        "--no-playlist",
        "--no-warnings",
      ];

      if (format === "mp3") {
        args.push("-x", "--audio-format", "mp3");
        if (quality === "320k" || quality.includes("320")) {
          args.push("--audio-quality", "0");
        } else {
          args.push("--audio-quality", "5");
        }
      } else {
        let height = 1080;
        if (quality.includes("2160") || quality.includes("4k") || quality.includes("4K")) height = 2160;
        else if (quality.includes("1440") || quality.includes("2k") || quality.includes("2K")) height = 1440;
        else if (quality.includes("1080")) height = 1080;
        else if (quality.includes("720")) height = 720;
        else if (quality.includes("480")) height = 480;
        else if (quality.includes("360")) height = 360;

        args.push(
          "-f", `bestvideo[height<=${height}][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=${height}]+bestaudio/best[height<=${height}]/best`,
          "--merge-output-format", "mp4"
        );
      }

      args.push("-o", fileTemplate, url);

      execFile(YT_DLP_PATH, args, { timeout: 1800000, maxBuffer: 200 * 1024 * 1024 }, (error, _stdout, stderr) => {
        if (error) {
          console.error("Erro no processamento do vídeo com yt-dlp:", error, stderr);
          if (!res.headersSent) {
            return res.status(500).send("Erro ao processar o vídeo. Tente outro link ou formato.");
          }
          return;
        }

        try {
          const files = fs.readdirSync(TEMP_DIR);
          const downloadedFile = files.find(f => f.startsWith(`dl_${downloadId}.`));

          if (!downloadedFile) {
            if (!res.headersSent) {
              return res.status(500).send("Arquivo baixado não foi localizado.");
            }
            return;
          }

          const fullPath = path.join(TEMP_DIR, downloadedFile);

          // Copy a permanent copy to the site's dedicated folder
          try {
            const permanentPath = path.join(SAVED_DOWNLOADS_DIR, clientFilename);
            fs.copyFileSync(fullPath, permanentPath);
          } catch (copyErr) {
            console.warn("Erro ao copiar para pasta própria:", copyErr);
          }

          res.download(fullPath, clientFilename, (downloadErr) => {
            if (downloadErr) {
              console.warn("Erro ao entregar o arquivo via res.download:", downloadErr);
            }
            // Cleanup temp file
            try {
              if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
              }
            } catch (unlinkErr) {
              console.warn("Erro ao remover arquivo temporário:", unlinkErr);
            }
          });
        } catch (readErr) {
          console.error("Erro ao localizar arquivo de saída:", readErr);
          if (!res.headersSent) {
            return res.status(500).send("Erro ao enviar o download.");
          }
        }
      });
    } catch (error) {
      console.error("Erro no handler de download:", error);
      return res.status(500).send("Erro ao realizar o download.");
    }
  });

  // Vite Development / Production Middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Downloader server rodando na porta ${PORT}`);
  });
}

startServer();

