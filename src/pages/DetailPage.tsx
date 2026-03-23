import { useParams, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  apiFetch,
  extractImage,
  extractSynopsis,
  extractEpisodes,
  extractEpisodeUrl,
  extractEpisodeNumber,
} from "@/lib/api";
import { useState } from "react";
import VideoPlayer from "@/components/VideoPlayer";
import { Play, Star } from "lucide-react";
import { SkeletonRow } from "@/components/Skeleton";

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%231a1a1a' width='200' height='300'/%3E%3C/svg%3E";

const DetailPage = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const location = useLocation();
  const passedDrama = (location.state as any)?.drama;
  const [activeEpisode, setActiveEpisode] = useState<{ url: string; index: number } | null>(null);

  console.log("Fetching Detail for ID:", bookId);
  console.log("Passed drama from navigation:", passedDrama);

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["detail", bookId],
    queryFn: () => apiFetch<any>("/detail", { bookId: bookId!, lang: "in" }),
    enabled: !!bookId,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  const { data: episodesData, isLoading: epsLoading } = useQuery({
    queryKey: ["episodes", bookId],
    queryFn: () => apiFetch<any>("/allepisode", { bookId: bookId! }),
    enabled: !!bookId,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
  });

  // Merge: prefer API detail data, fallback to passed navigation state
  const apiDetail = detailData?.data || detailData;
  const detail = (apiDetail && apiDetail.bookId) ? apiDetail : passedDrama || apiDetail || {};

  console.log("Detail resolved:", detail);

  const title = detail?.bookName || detail?.book_name || detail?.title || "Judul Tidak Ditemukan";
  const image = extractImage(detail);
  const synopsis = extractSynopsis(detail);
  const tags = detail?.tags || detail?.tagV3s || detail?.genre || detail?.category || [];
  const rating = detail?.score || detail?.rating || "";
  const chapterCount = detail?.chapterCount || 0;

  const fetchedEpisodes = extractEpisodes(episodesData);
  const episodes = fetchedEpisodes.length > 0
    ? fetchedEpisodes
    : chapterCount > 0
      ? Array.from({ length: chapterCount }).map((_, i) => ({
          order: i + 1,
          episode_number: i + 1,
          name: `Episode ${i + 1}`,
        }))
      : [];

  console.log(`Episodes found: ${fetchedEpisodes.length}`, episodesData);
  if (fetchedEpisodes.length === 0) {
    console.error("Daftar episode kosong untuk bookId:", bookId, episodesData);
  }

  const handlePlayEpisode = (ep: any, index: number) => {
    let url = extractEpisodeUrl(ep, bookId);
    // Fallback: construct play URL from bookId + episode number
    if (!url && bookId) {
      const epNum = ep?.order || ep?.episode_number || (index + 1);
      url = `https://dramabox.dramabos.my.id/api/v1/play?bookId=${encodeURIComponent(bookId)}&episode=${epNum}`;
    }
    if (url) {
      setActiveEpisode({ url, index });
    } else {
      console.error("URL video episode tidak ditemukan:", { bookId, episode: ep });
    }
  };

  // Show skeleton only if we have no data at all
  if (detailLoading && !passedDrama) {
    return (
      <div className="space-y-6 pt-4">
        <div className="shimmer w-full aspect-video rounded-xl" />
        <SkeletonRow />
      </div>
    );
  }

  // Format tags display
  const displayTags = Array.isArray(tags)
    ? tags.map((t: any) => (typeof t === "string" ? t : t?.tagName || t?.name || "")).filter(Boolean)
    : typeof tags === "string" ? [tags] : [];

  return (
    <div className="space-y-6 pb-12">
      {activeEpisode && (
        <VideoPlayer
          src={activeEpisode.url}
          bookId={bookId!}
          title={title}
          image={image}
          episodeIndex={activeEpisode.index}
          episodes={episodes}
          onClose={() => setActiveEpisode(null)}
          onPlayEpisode={(idx) => {
            const ep = episodes[idx];
            if (ep) handlePlayEpisode(ep, idx);
          }}
        />
      )}

      {/* Detail Header */}
      <div className="relative">
        {image && (
          <div className="absolute inset-0 -z-10 overflow-hidden rounded-xl">
            <img
              src={image}
              alt=""
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full h-full object-cover blur-2xl opacity-30 scale-110"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>
        )}
        <div className="flex flex-col md:flex-row gap-6 p-4 md:p-8">
          <div className="w-40 md:w-52 shrink-0 mx-auto md:mx-0">
            <img
              src={image || FALLBACK}
              alt={title}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full rounded-lg shadow-2xl"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
            />
          </div>
          <div className="space-y-3 flex-1">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">{title}</h1>
            <div className="flex items-center gap-3 flex-wrap">
              {rating && (
                <span className="flex items-center gap-1 text-primary text-sm">
                  <Star size={14} /> {rating}
                </span>
              )}
              {chapterCount > 0 && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {chapterCount} Episode
                </span>
              )}
              {displayTags.slice(0, 3).map((tag, i) => (
                <span key={i} className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
            {synopsis && (
              <p className="text-sm text-muted-foreground leading-relaxed">{synopsis}</p>
            )}
            {(episodes.length > 0 || chapterCount > 0) && (
              <button
                onClick={() => episodes.length > 0 && handlePlayEpisode(episodes[0], 0)}
                className="inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                <Play size={18} /> Putar Episode 1
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Episodes */}
      <div className="space-y-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Daftar Episode {chapterCount > 0 && `(${chapterCount})`}
        </h2>
        {epsLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {Array.from({ length: Math.min(chapterCount || 12, 20) }).map((_, i) => (
              <div key={i} className="shimmer h-10 rounded-lg" />
            ))}
          </div>
        ) : episodes.length === 0 ? (
          <div className="text-muted-foreground text-sm space-y-2">
            <p>Episode sedang dimuat... Coba refresh halaman.</p>
            {chapterCount > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                {Array.from({ length: chapterCount }).map((_, i) => (
                  <button
                    key={i}
                    className="py-2 px-3 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground opacity-50 cursor-not-allowed"
                  >
                    Eps {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {episodes.map((ep: any, i: number) => (
              <button
                key={i}
                onClick={() => handlePlayEpisode(ep, i)}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                  activeEpisode?.index === i
                    ? "bg-gold-gradient text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                Eps {extractEpisodeNumber(ep, i + 1)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailPage;
