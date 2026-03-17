import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import type { Book, Category, Character } from '@/types/database';

export interface BookWithRelations extends Book {
  categories: Category | null;
  characters: Character[];
}

interface BooksFilters {
  categoryId?: string;
  status?: string;
  isFeatured?: boolean;
  search?: string;
  limit?: number;
}

export function useBooks(filters?: BooksFilters) {
  return useQuery({
    queryKey: ['books', filters],
    queryFn: async () => {
      let query = db
        .from('books')
        .select(`
          *,
          categories (*),
          characters (*)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (filters?.categoryId) {
        query = query.eq('category_id', filters.categoryId);
      }
      if (filters?.isFeatured) {
        query = query.eq('is_featured', true);
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%`);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as BookWithRelations[];
    },
  });
}

export function useBook(slug: string) {
  return useQuery({
    queryKey: ['book', slug],
    queryFn: async () => {
      const { data, error } = await db
        .from('books')
        .select(`
          *,
          categories (*),
          characters (*)
        `)
        .eq('slug', slug)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data as BookWithRelations;
    },
    enabled: !!slug,
  });
}

export function useBookById(id: string) {
  return useQuery({
    queryKey: ['book', id],
    queryFn: async () => {
      const { data, error } = await db
        .from('books')
        .select(`
          *,
          categories (*),
          characters (*)
        `)
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data as BookWithRelations;
    },
    enabled: !!id,
  });
}

export function useBookCharacters(bookId: string | undefined) {
  return useQuery({
    queryKey: ['book-characters', bookId],
    queryFn: async (): Promise<Character[]> => {
      if (!bookId) return [];
      const { data } = await db.from('characters').select('*').eq('book_id', bookId).is('deleted_at', null);
      return data || [];
    },
    enabled: !!bookId,
  });
}
