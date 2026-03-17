import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import type { 
  Profile, 
  Book, 
  BookComment, 
  Report, 
  UserLibrary,
  UserRole,
  UserRoleType
} from '@/types/database';

export interface AdminStats {
  totalBooks: number;
  totalUsers: number;
  activeChats: number;
  pendingReports: number;
  pageViews: number;
  uploadsToday: number;
  avgRating: number;
  growth: number;
}

export interface AdminUser extends Profile {
  user_roles: { role: UserRoleType } | null;
  books_count: number;
}

export interface AdminComment extends BookComment {
  profiles: { display_name: string } | null;
  books: { title: string } | null;
}

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      const [booksRes, usersRes, chatsRes, reportsRes, libraryRes] = await Promise.all([
        db
          .from('books')
          .select('id, average_rating, created_at', { count: 'exact', head: false })
          .is('deleted_at', null),
        db
          .from('profiles')
          .select('id, created_at', { count: 'exact', head: false })
          .is('deleted_at', null),
        db
          .from('chat_sessions')
          .select('session_id', { count: 'exact', head: true })
          .is('deleted_at', null)
          .eq('is_archived', false),
        db
          .from('reports')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open'),
        db
          .from('user_library')
          .select('added_at', { count: 'exact', head: false }),
      ]);

      const books = booksRes.data || [];
      const users = usersRes.data || [];
      
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const uploadsToday = books.filter(
        (b: { created_at: string }) => new Date(b.created_at) > oneDayAgo
      ).length;

      const lastWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const usersLastWeek = users.filter(
        (u: { created_at: string }) => new Date(u.created_at) > lastWeekAgo
      ).length;
      const usersBeforeLastWeek = users.length - usersLastWeek;
      const growth = usersBeforeLastWeek > 0 
        ? Math.round((usersLastWeek / usersBeforeLastWeek) * 100) 
        : 0;

      const avgRating = books.length > 0
        ? books.reduce((sum: number, b: { average_rating: number }) => sum + (b.average_rating || 0), 0) / books.length
        : 0;

      return {
        totalBooks: booksRes.count || 0,
        totalUsers: usersRes.count || 0,
        activeChats: chatsRes.count || 0,
        pendingReports: reportsRes.count || 0,
        pageViews: (libraryRes.count || 0) * 3,
        uploadsToday,
        avgRating: Math.round(avgRating * 10) / 10,
        growth,
      };
    },
  });
}

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<AdminUser[]> => {
      const { data: profiles, error } = await db
        .from('profiles')
        .select(`
          *,
          user_roles (role)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userIds = (profiles || []).map((p: Profile) => p.id);
      
      const { data: booksCount } = await db
        .from('books')
        .select('uploader_id')
        .in('uploader_id', userIds)
        .is('deleted_at', null);

      const booksByUser = new Map<string, number>();
      (booksCount || []).forEach((b: { uploader_id: string }) => {
        booksByUser.set(b.uploader_id, (booksByUser.get(b.uploader_id) || 0) + 1);
      });

      return (profiles || []).map((p: Profile & { user_roles: { role: UserRoleType } | null }) => ({
        ...p,
        books_count: booksByUser.get(p.id) || 0,
      }));
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: UserRoleType }) => {
      const { error } = await db
        .from('user_roles')
        .upsert({ user_id: userId, role }, { onConflict: 'user_id' });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'Role updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update role', variant: 'destructive' });
    },
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: 'active' | 'blocked' }) => {
      const { error } = await db
        .from('profiles')
        .update({ status })
        .eq('id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({ title: 'User status updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update user status', variant: 'destructive' });
    },
  });
}

export function useAdminReports() {
  return useQuery({
    queryKey: ['admin-reports'],
    queryFn: async (): Promise<(Report & { reporter: { display_name: string } | null })[]> => {
      const { data, error } = await db
        .from('reports')
        .select(`
          *,
          profiles:reporter_id (display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((r: Report & { profiles: { display_name: string } | null }) => ({
        ...r,
        reporter: r.profiles,
      }));
    },
  });
}

export function useUpdateReportStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      reportId, 
      status, 
      resolutionNote 
    }: { 
      reportId: string; 
      status: 'open' | 'investigating' | 'resolved' | 'dismissed';
      resolutionNote?: string;
    }) => {
      const { error } = await db
        .from('reports')
        .update({ status, resolution_note: resolutionNote || null })
        .eq('id', reportId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
      toast({ title: 'Report updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update report', variant: 'destructive' });
    },
  });
}

export function useAdminComments() {
  return useQuery({
    queryKey: ['admin-comments'],
    queryFn: async (): Promise<AdminComment[]> => {
      const { data, error } = await db
        .from('book_comments')
        .select(`
          *,
          profiles:user_id (display_name, avatar_url),
          books:book_id (title)
        `)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}

export function useUpdateCommentStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      commentId, 
      status 
    }: { 
      commentId: string; 
      status: 'pending' | 'approved' | 'rejected' | 'hidden';
    }) => {
      const { error } = await db
        .from('book_comments')
        .update({ status })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast({ title: 'Comment updated' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update comment', variant: 'destructive' });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await db
        .from('book_comments')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-comments'] });
      toast({ title: 'Comment deleted' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to delete comment', variant: 'destructive' });
    },
  });
}
