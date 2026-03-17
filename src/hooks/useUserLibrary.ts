import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, db } from '@/lib/supabase';
import type { UserLibrary, Book } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export interface LibraryItem extends UserLibrary {
  books: Book;
}

export function useUserLibrary() {
  return useQuery({
    queryKey: ['user-library'],
    queryFn: async () => {
      const { data, error } = await db
        .from('user_library')
        .select('*, books (*)')
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data as LibraryItem[];
    },
  });
}

export function useAddToLibrary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await db
        .from('user_library')
        .insert({ book_id: bookId, user_id: userId });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
      toast({
        title: 'Added to Library',
        description: 'Book has been added to your library.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Unable to add book to library.',
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveFromLibrary() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('User not authenticated');
      const { error } = await db
        .from('user_library')
        .delete()
        .eq('book_id', bookId)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
      toast({
        title: 'Removed from Library',
        description: 'Book has been removed from your library.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Unable to remove book from library.',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateLibraryItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ bookId, updates }: { bookId: string; updates: Partial<UserLibrary> }) => {
      const { error } = await db
        .from('user_library')
        .update(updates)
        .eq('book_id', bookId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-library'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Unable to update library item.',
        variant: 'destructive',
      });
    },
  });
}

export function useIsInLibrary(bookId: string) {
  return useQuery({
    queryKey: ['in-library', bookId],
    queryFn: async () => {
      const { data, error } = await db
        .from('user_library')
        .select('id')
        .eq('book_id', bookId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!bookId,
  });
}
