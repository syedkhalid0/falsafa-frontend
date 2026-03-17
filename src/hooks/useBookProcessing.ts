import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, db } from '@/lib/supabase';
import { api } from '@/lib/api';
import type { Book, BookInsert, BookProcessingStatus } from '@/types/database';
import type { BookProcessingPriority, EnqueueBookResponse } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export interface UploadBookParams {
  file: File;
  coverFile?: File;
  title: string;
  slug: string;
  author?: string;
  description?: string;
  category_id?: string;
  is_public?: boolean;
  priority?: BookProcessingPriority;
}

export interface UploadBookResult {
  book: Book;
  enqueueStatus: EnqueueBookResponse;
}

export function useUploadBook() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: UploadBookParams): Promise<UploadBookResult> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const userId = user.id;
      const timestamp = Date.now();
      const sanitizedFileName = params.file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${userId}/${timestamp}-${sanitizedFileName}`;

      const { data: storageData, error: uploadError } = await supabase.storage
        .from('book-files')
        .upload(filePath, params.file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }

      let coverImageUrl = null;
      if (params.coverFile) {
        const coverExt = params.coverFile.name.split('.').pop() || 'jpg';
        const coverPath = `${userId}/${timestamp}-cover.${coverExt}`;
        const { data: coverData, error: coverError } = await supabase.storage
          .from('book-covers')
          .upload(coverPath, params.coverFile);
        
        if (coverError) {
          console.error('Cover upload error:', coverError);
        } else if (coverData) {
          const { data: publicUrlData } = supabase.storage
            .from('book-covers')
            .getPublicUrl(coverData.path);
          coverImageUrl = publicUrlData.publicUrl;
        }
      }

      const bookInsert: BookInsert = {
        title: params.title,
        slug: params.slug,
        author: params.author || null,
        description: params.description || null,
        cover_image_url: coverImageUrl,
        category_id: params.category_id || null,
        uploader_id: userId,
        file_path: storageData.path,
        processing_status: 'queued',
        is_public: params.is_public ?? false,
        price: 0,
        isbn: null,
        language: 'en',
        page_count: null,
        published_year: null,
        total_chunks: 0,
        average_rating: 0,
        ratings_count: 0,
        reviews_count: 0,
        views_count: 0,
        library_count: 0,
        status: 'approved',
        rejection_reason: null,
        is_featured: false,
        metadata: {},
        deleted_at: null,
      };

      const { data: bookData, error: dbError } = await db
        .from('books')
        .insert(bookInsert)
        .select()
        .single();

      if (dbError || !bookData) {
        console.error('DB insert error:', dbError);
        await supabase.storage.from('book-files').remove([storageData.path]);
        throw new Error(`Failed to create book record: ${dbError?.message || 'Unknown error'}`);
      }

      // Automatically add the uploaded book to the user's library
      const { error: libraryError } = await db.from('user_library').insert({
        user_id: userId,
        book_id: bookData.id,
      });
      if (libraryError) {
        console.error('Failed to add uploaded book to user library:', libraryError);
      }

      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('book-files')
        .createSignedUrl(storageData.path, 3600);

      if (signedUrlError || !signedUrlData) {
        console.error('Signed URL error:', signedUrlError);
        throw new Error('Failed to generate signed URL for file');
      }

      const enqueueResponse = await api.enqueueBook({
        user_id: userId,
        book_id: bookData.id,
        book_url: [signedUrlData.signedUrl],
        priority: params.priority || 'medium',
        book_name: params.title,
        book_author: params.author || undefined,
        book_description: params.description || undefined,
        upload_date: new Date().toISOString().split('T')[0],
      });

      return {
        book: bookData as Book,
        enqueueStatus: enqueueResponse,
      };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['books'] });
      queryClient.invalidateQueries({ queryKey: ['book', result.book.id] });
      toast({
        title: 'Book Uploaded',
        description: `"${result.book.title}" has been queued for processing.`,
      });
    },
    onError: (error) => {
      toast({
        title: 'Upload Failed',
        description: error instanceof Error ? error.message : 'Failed to upload book',
        variant: 'destructive',
      });
    },
  });
}

export function useBookProcessingStatus(bookId: string | undefined) {
  return useQuery({
    queryKey: ['book-processing-status', bookId],
    queryFn: async () => {
      if (!bookId) return null;
      const { data } = await db.from('books').select('processing_status').eq('id', bookId).single();
      return data?.processing_status;
    },
    enabled: !!bookId,
    refetchInterval: (query) => {
      const status = query.state.data;
      if (status === 'queued' || status === 'processing') {
        return 5000;
      }
      return false;
    },
    refetchIntervalInBackground: true,
  });
}

export function usePollBookStatus(bookId: string | undefined) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['book-poll-status', bookId],
    queryFn: async (): Promise<BookProcessingStatus | null> => {
      if (!bookId) return null;

      const { data } = await db.from('books').select('processing_status').eq('id', bookId).single();
      const status = data?.processing_status;

      if (status === 'success' || status === 'failed') {
        queryClient.invalidateQueries({ queryKey: ['books'] });
        queryClient.invalidateQueries({ queryKey: ['book', bookId] });
      }

      return status || null;
    },
    enabled: !!bookId,
    refetchInterval: (query) => {
      const status = query.state.data;
      if (status === 'queued' || status === 'processing') {
        return 5000;
      }
      return false;
    },
    refetchIntervalInBackground: true,
  });
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function useSlugCheck(slug: string) {
  return useQuery({
    queryKey: ['slug-check', slug],
    queryFn: async (): Promise<boolean> => {
      if (!slug || slug.length < 3) return true;

      const { data, error } = await db
        .from('books')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Slug check error:', error);
        return true;
      }

      return !data;
    },
    enabled: !!slug && slug.length >= 3,
  });
}
