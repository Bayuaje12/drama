import { useQuery } from "@tanstack/react-query";
import { apiFetch, extractItems, extractTitle, extractImage, extractSynopsis, extractId } from "@/lib/api";
import { getWatchHistory } from "@/lib/storage";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DramaCarousel from "@/components/DramaCarousel";
import { SkeletonHero, SkeletonRow } from "@/components/Skeleton";
import { useMemo } from "react";

const FALLBACK_BG = "linear-gradient(135deg, hsl(0 0% 8%), hsl(0 0% 3%))";

const HeroSection = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({
    queryKey: ["randomdrama"],
    queryFn: () => apiFetch<any>("/randomdrama", { lang: "in" }),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <SkeletonHero />;

  const items = extractItems(data);
  const drama = items.length > 0 ? items[Math.floor(Math.random() * items.length)] : data?.data || data;
  if (!drama) return null;

  const title = extractTitle(drama);
  const image = extractImage(drama);
  const synopsis = extractSynopsis(drama);
  const id = extractId(drama);

  return (
    <div className="relative w-full aspect-[16/7] min-h-[300px] rounded-xl overflow-hidden">
      {image ? (
        <img
          src={image}
          alt={title}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent" />
      <div className="absolute bottom-0 left-0 p-6 md:p-10 max-w-2xl space-y-3 animate-slide-up">
        <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight">
          {title}
        </h1>
        {synopsis && (
          <p className="text-sm text-muted-foreground line-clamp-3">{synopsis}</p>
        )}
        <button
          onClick={() => id && navigate(`/detail/${id}`, { state: { drama } })}
          className="inline-flex items-center gap-2 bg-gold-gradient text-primary-foreground px-5 py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Play size={18} /> Putar
        </button>
      </div>
    </div>
  );
};

const HomePage = () => {
  const watchHistory = useMemo(() => getWatchHistory(), []);

  const homepage = useQuery({
    queryKey: ["homepage"],
    queryFn: () => apiFetch<any>("/homepage", { page: "1", lang: "in" }),
  });

  const foryou = useQuery({
    queryKey: ["foryou"],
    queryFn: () => apiFetch<any>("/foryou", { lang: "in" }),
  });

  const trending = useQuery({
    queryKey: ["trending"],
    queryFn: () => apiFetch<any>("/trending", { lang: "in" }),
  });

  const latest = useQuery({
    queryKey: ["latest"],
    queryFn: () => apiFetch<any>("/latest", { lang: "in" }),
  });

  const isLoading = homepage.isLoading || foryou.isLoading;

  // Extract homepage sections
  const homeSections = useMemo(() => {
    if (!homepage.data) return [];
    const items = extractItems(homepage.data);
    // Homepage might return sections with title + list
    if (items.length > 0 && items[0]?.list) {
      return items.map((section: any) => ({
        title: section.title || section.name || "Drama",
        items: Array.isArray(section.list) ? section.list : [],
      }));
    }
    return [];
  }, [homepage.data]);

  return (
    <div className="space-y-8 pb-12">
      <HeroSection />

      {watchHistory.length > 0 && (
        <DramaCarousel
          title="Lanjutkan Menonton"
          items={watchHistory.map((h) => ({
            bookId: h.bookId,
            title: h.title,
            cover: h.image,
          }))}
          getProgress={(item) => {
            const h = watchHistory.find((w) => w.bookId === item.bookId);
            return h && h.duration > 0 ? (h.timestamp / h.duration) * 100 : undefined;
          }}
        />
      )}

      {isLoading ? (
        <>
          <SkeletonRow />
          <SkeletonRow />
        </>
      ) : (
        <>
          {foryou.data && (
            <DramaCarousel title="Pilihan Untukmu" items={extractItems(foryou.data)} />
          )}
          {trending.data && (
            <DramaCarousel title="Terpopuler" items={extractItems(trending.data)} />
          )}
          {latest.data && (
            <DramaCarousel title="Terbaru" items={extractItems(latest.data)} />
          )}
          {homeSections.map((section, i) => (
            <DramaCarousel key={i} title={section.title} items={section.items} />
          ))}
        </>
      )}
    </div>
  );
};

export default HomePage;
