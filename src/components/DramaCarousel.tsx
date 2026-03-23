import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DramaCard from "./DramaCard";

interface DramaCarouselProps {
  title: string;
  items: any[];
  getProgress?: (item: any) => number | undefined;
}

const DramaCarousel = ({ title, items, getProgress }: DramaCarouselProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: number) => {
    ref.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  };

  if (!items.length) return null;

  return (
    <div className="space-y-3">
      <h2 className="text-lg sm:text-xl font-display font-semibold text-foreground px-1">
        {title}
      </h2>
      <div className="relative group">
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronLeft size={20} className="text-foreground" />
        </button>
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 px-1"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {items.map((item, i) => (
            <DramaCard
              key={i}
              item={item}
              showProgress={getProgress?.(item)}
            />
          ))}
        </div>
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ChevronRight size={20} className="text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default DramaCarousel;
