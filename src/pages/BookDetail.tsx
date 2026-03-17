import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Heart, MessageCircle, BookOpen, Share2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useBookById, useBookCharacters } from "@/hooks/useBooks";
import { useIsInLibrary, useAddToLibrary, useRemoveFromLibrary } from "@/hooks/useUserLibrary";
import { useCreateChatSession } from "@/hooks/useChatSessions";
import type { Character } from "@/types/database";

export default function BookDetail() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const { data: book, isLoading: bookLoading, error: bookError } = useBookById(bookId || "");
  const { data: characters, isLoading: charactersLoading } = useBookCharacters(bookId);
  const { data: isInLibrary } = useIsInLibrary(bookId || "");
  const addMutation = useAddToLibrary();
  const removeMutation = useRemoveFromLibrary();
  const createSession = useCreateChatSession();

  if (bookLoading) {
    return (
      <div className="flex items-center justify-center py-20 animate-fade-in">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
        <p className="text-muted-foreground">Book not found.</p>
        <Link to="/" className="mt-2 text-primary text-sm hover:underline">
          Go back
        </Link>
      </div>
    );
  }

  const handleCharacterClick = async (character: Character) => {
    if (!isInLibrary) {
      toast("Add this book to your library first", {
        description: "You need the book in your library to chat with characters.",
      });
      return;
    }

    try {
      const sessionId = await createSession.mutateAsync({
        characterId: character.id,
        bookId: book.id,
      });
      navigate(`/chat/${sessionId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const handleLibraryToggle = () => {
    if (isInLibrary) {
      removeMutation.mutate(book.id);
    } else {
      addMutation.mutate(book.id);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "fill-amber-400 text-amber-400" : "text-border"
        )}
      />
    ));
  };

  const bookCharacters = characters || book.characters || [];

  return (
    <div className="animate-fade-in pb-10">
      <div className="relative px-4 md:px-8 pt-6 pb-10">
        <div className="absolute inset-0 bg-gradient-to-b from-lavender-light via-background to-background -z-10" />

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="flex flex-col sm:flex-row gap-8 items-start">
          <div className="w-44 sm:w-52 rounded-2xl overflow-hidden shadow-lg shrink-0 mx-auto sm:mx-0">
            {book.cover_image_url ? (
              <img src={book.cover_image_url} alt={book.title} className="w-full aspect-[3/4] object-cover" />
            ) : (
              <div className="w-full aspect-[3/4] bg-muted flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left space-y-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground leading-tight">
                {book.title}
              </h1>
              {book.author && (
                <p className="text-sm text-muted-foreground mt-1.5">by {book.author}</p>
              )}
            </div>

            <div className="flex items-center gap-1.5 justify-center sm:justify-start">
              {renderStars(book.average_rating)}
              <span className="text-sm font-semibold ml-1">{book.average_rating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground ml-1">rating</span>
            </div>

            {book.description && (
              <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
                {book.description}
              </p>
            )}

            <div className="flex gap-3 justify-center sm:justify-start pt-1">
              {isInLibrary ? (
                <span className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-accent text-accent-foreground text-sm font-semibold">
                  <BookOpen className="h-4 w-4" />
                  In Your Library
                </span>
              ) : book.price === 0 ? (
                <button
                  onClick={handleLibraryToggle}
                  disabled={addMutation.isPending}
                  className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {addMutation.isPending ? "Adding..." : "Add to Library"}
                </button>
              ) : (
                <button className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity">
                  Buy — ${book.price.toFixed(2)}
                </button>
              )}
              <button
                onClick={handleLibraryToggle}
                className="p-3 rounded-2xl border border-border hover:bg-secondary transition-colors"
              >
                <Heart
                  className={cn(
                    "h-5 w-5",
                    isInLibrary ? "fill-blush text-blush" : "text-muted-foreground"
                  )}
                />
              </button>
              <button className="p-3 rounded-2xl border border-border hover:bg-secondary transition-colors">
                <Share2 className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {book.processing_status !== "success" && (
        <section className="px-4 md:px-8 mt-2">
          <div className="p-4 rounded-2xl bg-muted border border-border">
            <div className="flex items-center gap-2">
              <Loader2
                className={cn(
                  "h-4 w-4",
                  book.processing_status === "processing" && "animate-spin"
                )}
              />
              <span className="text-sm font-medium">
                {book.processing_status === "queued" && "Queued for processing..."}
                {book.processing_status === "processing" && "Processing book..."}
                {book.processing_status === "failed" && "Processing failed"}
              </span>
            </div>
          </div>
        </section>
      )}

      {book.processing_status === "success" && book.total_chunks > 0 && (
        <section className="px-4 md:px-8 mt-2">
          <div className="p-4 rounded-2xl bg-muted border border-border">
            <p className="text-xs text-muted-foreground">
              {book.total_chunks} chunks extracted
            </p>
          </div>
        </section>
      )}

      {bookCharacters.length > 0 && (
        <section className="px-4 md:px-8 mt-6">
          <h2 className="text-lg font-serif font-bold mb-4">Characters</h2>
          <div className="flex gap-5 overflow-x-auto pb-3 scrollbar-hide">
            {bookCharacters.map((char) => (
              <button
                key={char.id}
                onClick={() => handleCharacterClick(char)}
                disabled={!isInLibrary || createSession.isPending}
                className="flex flex-col items-center shrink-0 w-[100px] group disabled:opacity-50"
              >
                <div className="rounded-full p-0.5 bg-gradient-to-br from-primary/30 to-secondary/50 group-hover:from-primary/50 group-hover:to-secondary/70 transition-all">
                  <CharacterAvatar
                    name={char.name}
                    avatar={char.avatar_url}
                    size="lg"
                    className="border-2 border-card"
                  />
                </div>
                <span className="text-xs font-semibold mt-2 text-foreground line-clamp-1">
                  {char.name}
                </span>
                {char.description && (
                  <span className="text-[10px] text-muted-foreground line-clamp-2 text-center mt-0.5 leading-tight">
                    {char.description}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mx-4 md:mx-8 my-6 border-t border-border" />
    </div>
  );
}
