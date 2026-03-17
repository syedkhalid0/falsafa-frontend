import { Heart, Loader2 } from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { Link } from "react-router-dom";
import { useUserWishlist } from "@/hooks/useUserWishlist";
import type { Book } from "@/types/database";

export default function Wishlist() {
  const { data: wishlistData, isLoading } = useUserWishlist();

  const wishlistBooks = wishlistData?.map((item) => item.books) || [];

  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4">Wishlist</h1>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : wishlistBooks.length > 0 ? (
        <div className="space-y-3">
          {wishlistBooks.map((book) => (
            <BookCard key={book.id} book={transformBookForCard(book)} variant="full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-blush-light flex items-center justify-center mb-4">
            <Heart className="h-9 w-9 text-blush" />
          </div>
          <h3 className="font-serif font-semibold text-lg mb-1">Your wishlist is empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Explore books and tap the heart icon to add them to your wishlist.
          </p>
          <Link
            to="/"
            className="mt-4 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Discover Books
          </Link>
        </div>
      )}
    </div>
  );
}

function transformBookForCard(book: Book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author || "Unknown Author",
    cover: book.cover_image_url || "",
    description: book.description || "",
    rating: book.average_rating,
    price: book.price,
    category: "",
    inLibrary: false,
    inWishlist: true,
    characters: [],
  };
}
