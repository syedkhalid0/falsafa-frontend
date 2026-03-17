import { useState } from "react";
import { Search, ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { BookCard } from "@/components/BookCard";
import { useBooks, type BookWithRelations } from "@/hooks/useBooks";
import { useCategories } from "@/hooks/useCategories";

export default function Discover() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: books, isLoading: booksLoading } = useBooks({ limit: 6 });
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const isLoading = booksLoading || categoriesLoading;

  const filteredBooks = searchQuery
    ? books?.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (book.author && book.author.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : books;

  return (
    <div className="animate-fade-in">
      <div className="px-4 md:px-8 pt-8 pb-6">
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground tracking-tight">
          Discover
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Find your next favourite book & character
        </p>

        <div className="flex items-center gap-3 mt-5 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find the book you like..."
              className="w-full h-12 pl-11 pr-4 rounded-2xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
            />
          </div>
          <button className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity shrink-0">
            Search
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <section className="mt-4">
            <div className="flex items-center justify-between px-4 md:px-8 mb-5">
              <h2 className="text-xl md:text-2xl font-serif font-bold tracking-tight">
                Book Recommendation
              </h2>
              <Link
                to="/category"
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground border border-border rounded-full px-3 py-1.5 transition-colors"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto px-4 md:px-8 pb-6 scrollbar-hide">
              {filteredBooks && filteredBooks.length > 0 ? (
                filteredBooks.map((book) => (
                  <BookCard key={book.id} book={transformBookForCard(book)} variant="featured" />
                ))
              ) : (
                <p className="text-sm text-muted-foreground px-4">No books found.</p>
              )}
            </div>
          </section>

          <section className="px-4 md:px-8 mt-2 pb-10">
            <h2 className="text-xl md:text-2xl font-serif font-bold tracking-tight mb-5">
              Book Category
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories && categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.id}`}
                    className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-muted shadow-sm hover:shadow-md transition-shadow duration-300"
                  >
                    {cat.cover_image_url ? (
                      <img
                        src={cat.cover_image_url}
                        alt={cat.name}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-lavender-light to-background" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-sm font-serif font-bold text-primary-foreground">
                        {cat.name}
                      </h3>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground col-span-full">No categories found.</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function transformBookForCard(book: BookWithRelations) {
  return {
    id: book.id,
    title: book.title,
    author: book.author || "Unknown Author",
    cover: book.cover_image_url || "",
    description: book.description || "",
    rating: book.average_rating,
    price: book.price,
    category: book.categories?.name || "",
    inLibrary: false,
    inWishlist: false,
    characters: [],
  };
}
