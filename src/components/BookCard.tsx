import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    cover: string;
    description?: string;
    rating: number;
    price: number;
    category?: string;
    inLibrary?: boolean;
    inWishlist?: boolean;
    characters?: unknown[];
  };
  variant?: "compact" | "full" | "featured";
}

export function BookCard({ book, variant = "compact" }: BookCardProps) {
  if (variant === "featured") {
    return (
      <Link
        to={`/book/${book.id}`}
        className="flex-shrink-0 w-[200px] md:w-[220px] group"
      >
        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-muted shadow-sm group-hover:shadow-lg transition-all duration-300">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No cover
            </div>
          )}
          {book.price === 0 && (
            <span className="absolute top-3 right-3 bg-accent text-accent-foreground text-[10px] font-bold px-2.5 py-1 rounded-full">
              Free
            </span>
          )}
        </div>
        <div className="mt-3 px-0.5">
          <h3 className="text-sm font-serif font-bold text-foreground line-clamp-1">
            {book.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium text-foreground">{book.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        to={`/book/${book.id}`}
        className="flex-shrink-0 w-[140px] group"
      >
        <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-muted shadow-soft group-hover:shadow-soft-lg transition-shadow duration-300">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
              No cover
            </div>
          )}
          {book.price === 0 && (
            <span className="absolute top-2 right-2 bg-sage text-accent-foreground text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Free
            </span>
          )}
        </div>
        <h3 className="mt-2 text-sm font-serif font-semibold text-foreground line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
      </Link>
    );
  }

  return (
    <Link
      to={`/book/${book.id}`}
      className="group flex gap-4 p-3 rounded-2xl bg-card border border-border hover:shadow-soft transition-all duration-200"
    >
      <div className="relative w-20 rounded-xl overflow-hidden aspect-[3/4] bg-muted shrink-0">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
            No cover
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 py-1">
        <h3 className="text-sm font-serif font-semibold text-foreground line-clamp-1">
          {book.title}
        </h3>
        <p className="text-xs text-muted-foreground mt-0.5">{book.author}</p>
        {book.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{book.description}</p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center gap-0.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-medium">{book.rating.toFixed(1)}</span>
          </div>
          <span
            className={cn(
              "text-xs font-semibold",
              book.price === 0 ? "text-sage" : "text-primary"
            )}
          >
            {book.price === 0 ? "Free" : `$${book.price.toFixed(2)}`}
          </span>
        </div>
      </div>
    </Link>
  );
}
