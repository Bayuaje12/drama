import { useQuery } from "@tanstack/react-query";
import { apiFetch, extractItems, extractTitle, extractImage, extractId } from "@/lib/api";
import { useSearchParams } from "react-router-dom";
import { useState, useMemo } from "react";
import DramaCard from "@/components/DramaCard";
import { SkeletonGrid } from "@/components/Skeleton";

const GENRES = ["Semua", "Romantis", "Aksi", "Komedi", "Fantasi", "Misteri", "Sejarah"];
const SORT_OPTIONS = [
  { label: "Terpopuler", value: "popular" },
  { label: "Terbaru", value: "newest" },
];

const ExplorePage = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [genre, setGenre] = useState("Semua");
  const [sort, setSort] = useState("popular");

  const { data, isLoading } = useQuery({
    queryKey: ["explore", searchQuery],
    queryFn: () =>
      searchQuery
        ? apiFetch<any>("/search", { keyword: searchQuery, lang: "in" })
        : apiFetch<any>("/homepage", { page: "1", lang: "in" }),
  });

  const trending = useQuery({
    queryKey: ["trending-explore"],
    queryFn: () => apiFetch<any>("/trending", { lang: "in" }),
    enabled: !searchQuery,
  });

  const allItems = useMemo(() => {
    let items: any[] = [];
    if (data) {
      const extracted = extractItems(data);
      // Flatten sections
      extracted.forEach((item: any) => {
        if (item?.list && Array.isArray(item.list)) {
          items.push(...item.list);
        } else {
          items.push(item);
        }
      });
    }
    if (!searchQuery && trending.data) {
      const trendingItems = extractItems(trending.data);
      trendingItems.forEach((t: any) => {
        if (!items.find((i: any) => extractId(i) === extractId(t))) {
          items.push(t);
        }
      });
    }
    return items;
  }, [data, trending.data, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          {searchQuery ? `Hasil: "${searchQuery}"` : "Jelajah"}
        </h1>
      </div>

      {!searchQuery && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-2 flex-wrap">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setGenre(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  genre === g
                    ? "bg-gold-gradient text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-secondary text-secondary-foreground text-xs rounded-lg px-3 py-1.5 outline-none"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      )}

      {isLoading ? (
        <SkeletonGrid />
      ) : allItems.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <p>Tidak ada drama ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
          {allItems.map((item, i) => (
            <div key={i} className="w-full">
              <DramaCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExplorePage;
