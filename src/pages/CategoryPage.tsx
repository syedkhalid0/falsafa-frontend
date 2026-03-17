import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { useCategories, useCategoryById } from "@/hooks/useCategories";
import { useBooks, type BookWithRelations } from "@/hooks/useBooks";

export default function CategoryPage() {
  const { categoryId } = useParams();
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: category, isLoading: categoryLoading } = useCategoryById(categoryId || "");
  const { data: allBooks, isLoading: booksLoading } = useBooks(
    categoryId ? { categoryId } : undefined
  );

  const isLoading = categoriesLoading || (categoryId && (categoryLoading || booksLoading));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!categoryId) {
    return (
      <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in">
        <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4">Categories</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories && categories.length > 0 ? (
            categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/category/${cat.id}`}
                className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-muted"
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
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <h3 className="text-sm font-serif font-semibold text-primary-foreground">
                    {cat.name}
                  </h3>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-muted-foreground col-span-full">No categories found.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in">
      <Link
        to="/category"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        All Categories
      </Link>
      <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4">
        {category?.name || "Category"}
      </h1>
      <div className="space-y-3">
        {allBooks && allBooks.length > 0 ? (
          allBooks.map((book) => (
            <BookCard key={book.id} book={transformBookForCard(book)} variant="full" />
          ))
        ) : (
          <p className="text-center text-muted-foreground py-12">
            No books found in this category yet.
          </p>
        )}
      </div>
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
