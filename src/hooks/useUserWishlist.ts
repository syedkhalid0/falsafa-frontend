import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, db } from '@/lib/supabase';
import type { UserWishlist, Book } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

export interface WishlistItem extends UserWishlist {
  books: Book;
}

export function useUserWishlist() {
  return useQuery({
    queryKey: ['user-wishlist'],
    queryFn: async () => {
      const { data, error } = await db
        .from('user_wishlist')
        .select('*, books (*)')
        .order('added_at', { ascending: false });

      if (error) throw error;
      return data as WishlistItem[];
    },
  });
}

export function useAddToWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const { error } = await db
        .from('user_wishlist')
        .insert({ book_id: bookId, user_id: userId });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wishlist'] });
      toast({
        title: 'Added to Wishlist',
        description: 'Book has been added to your wishlist.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Unable to add book to wishlist.',
        variant: 'destructive',
      });
    },
  });
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (bookId: string) => {
      const { error } = await db
        .from('user_wishlist')
        .delete()
        .eq('book_id', bookId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-wishlist'] });
      toast({
        title: 'Removed from Wishlist',
        description: 'Book has been removed from your wishlist.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Unable to remove book from wishlist.',
        variant: 'destructive',
      });
    },
  });
}

export function useIsInWishlist(bookId: string) {
  return useQuery({
    queryKey: ['in-wishlist', bookId],
    queryFn: async () => {
      const { data, error } = await db
        .from('user_wishlist')
        .select('id')
        .eq('book_id', bookId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    },
    enabled: !!bookId,
  });
}
