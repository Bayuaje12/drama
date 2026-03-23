import { extractImage, extractTitle, extractId } from "@/lib/api";
import { useNavigate } from "react-router-dom";

interface DramaCardProps {
  item: any;
  showProgress?: number;
}

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 300'%3E%3Crect fill='%231a1a1a' width='200' height='300'/%3E%3Ctext fill='%23555' x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

const DramaCard = ({ item, showProgress }: DramaCardProps) => {
  const navigate = useNavigate();
  const title = extractTitle(item);
  const image = extractImage(item);
  const id = extractId(item);

  return (
    <div
      onClick={() => id && navigate(`/detail/${id}`, { state: { drama: item } })}
      className="flex-shrink-0 w-36 sm:w-44 cursor-pointer gold-glow group"
    >
      <div className="relative rounded-lg overflow-hidden aspect-[2/3] bg-secondary">
        <img
          src={image || FALLBACK}
          alt={title}
          referrerPolicy="no-referrer"
          crossOrigin="anonymous"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK; }}
          loading="lazy"
        />
        {typeof showProgress === "number" && showProgress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-secondary">
            <div
              className="h-full bg-gold-gradient rounded-r"
              style={{ width: `${Math.min(showProgress, 100)}%` }}
            />
          </div>
        )}
      </div>
      <p className="mt-2 text-xs sm:text-sm text-foreground font-medium line-clamp-2">{title}</p>
    </div>
  );
};

export default DramaCard;
