import { useQuery } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import type { Category } from '@/types/database';

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await db
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .is('deleted_at', null)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data, error } = await db
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data as Category;
    },
    enabled: !!slug,
  });
}

export function useCategoryById(id: string) {
  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      const { data, error } = await db
        .from('categories')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .is('deleted_at', null)
        .single();

      if (error) throw error;
      return data as Category;
    },
    enabled: !!id,
  });
}
