import { useRef, useEffect, useState } from "react";
import { X, SkipForward, Maximize, Minimize, Moon, Play, AlertCircle } from "lucide-react";
import { saveWatchProgress } from "@/lib/storage";
import { extractId } from "@/lib/api";

interface VideoPlayerProps {
  src: string;
  bookId: string;
  title: string;
  image: string | null;
  episodeIndex: number;
  episodes: any[];
  onClose: () => void;
  onPlayEpisode: (index: number) => void;
}

const VideoPlayer = ({
  src,
  bookId,
  title,
  image,
  episodeIndex,
  episodes,
  onClose,
  onPlayEpisode,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cinemaMode, setCinemaMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState(false);

  // Auto-play dan sinkronisasi saat link video (src) berubah
  useEffect(() => {
    setError(false);
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(() => {
        console.log("Menunggu interaksi pengguna untuk play");
      });
    }
  }, [src]);

  // Simpan progres nonton setiap 10 detik
  useEffect(() => {
    const interval = setInterval(() => {
      const v = videoRef.current;
      if (v && v.currentTime > 0) {
        saveWatchProgress({
          bookId,
          title,
          image,
          episodeId: extractId(episodes[episodeIndex] || {}),
          episodeIndex,
          timestamp: v.currentTime,
          duration: v.duration || 0,
          updatedAt: Date.now(),
        });
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [bookId, title, image, episodeIndex, episodes]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-500 ${
        cinemaMode ? "bg-black" : "bg-black/95"
      }`}
    >
      {/* Tombol Kontrol Atas */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-50">
        <button onClick={() => setCinemaMode(!cinemaMode)} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
          <Moon size={20} className={cinemaMode ? "fill-yellow-400 text-yellow-400" : ""} />
        </button>
        <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition">
          <X size={20} />
        </button>
      </div>

      {/* Area Video */}
      <div className="relative w-full max-w-5xl aspect-video bg-black shadow-2xl overflow-hidden group">
        {!error ? (
          <video
            ref={videoRef}
            src={src}
            className="w-full h-full object-contain"
            controls
            autoPlay
            playsInline
            webkit-playsinline="true"
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            onError={() => setError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 bg-zinc-900">
            <AlertCircle size={48} className="text-red-500 mb-3" />
            <p className="text-white font-medium">Gagal memutar video ini</p>
            <p className="text-zinc-400 text-sm mt-1 mb-4">Link streaming mungkin telah kedaluwarsa atau diblokir server.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-amber-500 text-black font-bold rounded-full hover:bg-amber-400"
            >
              Coba Segarkan Halaman
            </button>
          </div>
        )}
      </div>

      {/* Info Drama di Bawah Player */}
      <div className="w-full max-w-5xl p-4 flex items-center justify-between">
        <div>
          <h2 className="text-white font-bold text-lg leading-tight line-clamp-1">{title}</h2>
          <p className="text-amber-500 text-sm">Episode {episodeIndex + 1}</p>
        </div>
        
        <div className="flex items-center gap-3">
          {episodeIndex < episodes.length - 1 && (
            <button
              onClick={() => onPlayEpisode(episodeIndex + 1)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-sm"
            >
              Lanjut Episode <SkipForward size={16} />
            </button>
          )}
          <button onClick={toggleFullscreen} className="p-2 text-white/70 hover:text-white transition">
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
