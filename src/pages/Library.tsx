import { useState } from "react";
import { Search, Plus, BookOpen, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { useUserLibrary } from "@/hooks/useUserLibrary";
import type { Book } from "@/types/database";

export default function Library() {
  const { data: libraryData, isLoading } = useUserLibrary();
  const [searchQuery, setSearchQuery] = useState("");

  const libraryBooks = libraryData?.map((item) => item.books) || [];

  const filteredBooks = searchQuery
    ? libraryBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : libraryBooks;

  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-serif font-bold">My Library</h1>
        <Link
          to="/library/upload"
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          Upload Book
        </Link>
      </div>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your library..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={transformBookForCard(book)} variant="compact" />
          ))}
        </div>
      ) : searchQuery && libraryBooks.length > 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-lavender-light flex items-center justify-center mb-4">
            <Search className="h-9 w-9 text-primary" />
          </div>
          <h3 className="font-serif font-semibold text-lg mb-1">No results found</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            No books matching "{searchQuery}" in your library.
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-20 w-20 rounded-full bg-lavender-light flex items-center justify-center mb-4">
            <BookOpen className="h-9 w-9 text-primary" />
          </div>
          <h3 className="font-serif font-semibold text-lg mb-1">Your library is empty</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Discover wonderful books and add them to your library to start chatting with characters.
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
    inLibrary: true,
    inWishlist: false,
    characters: [],
  };
}
