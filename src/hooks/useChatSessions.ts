import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import type { ChatSession, Character, Book } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export interface ChatSessionWithRelations extends ChatSession {
  characters: Character;
  books: Book;
}

export function useChatSessions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['chat-sessions'],
    queryFn: async (): Promise<ChatSessionWithRelations[]> => {
      if (!user) return [];

      const { data: sessionsData, error: sessionsError } = await db
        .from('chat_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null);

      if (sessionsError || !sessionsData || sessionsData.length === 0) return [];

      const sessionIds = sessionsData.map((s) => s.session_id);
      const characterIds = [...new Set(sessionsData.map((s) => s.character_id))];
      const bookIds = [...new Set(sessionsData.map((s) => s.book_id))];

      const [charactersRes, booksRes] = await Promise.all([
        db
          .from('characters')
          .select('*')
          .in('id', characterIds)
          .is('deleted_at', null),
        db
          .from('books')
          .select('*')
          .in('id', bookIds)
          .is('deleted_at', null),
      ]);

      const charactersMap = new Map<string, Record<string, unknown>>(
        (charactersRes.data || []).map((c: Record<string, unknown>) => [c.id as string, c])
      );
      const booksMap = new Map<string, Record<string, unknown>>(
        (booksRes.data || []).map((b: Record<string, unknown>) => [b.id as string, b])
      );

      return sessionsData
        .map((session) => {
          const character = charactersMap.get(session.character_id);
          const book = booksMap.get(session.book_id);
          
          if (!character || !book) return null;
          
          return {
            ...session,
            characters: character as unknown as Character,
            books: book as unknown as Book,
          } as ChatSessionWithRelations;
        })
        .filter((s): s is ChatSessionWithRelations => s !== null && !s.is_archived)
        .sort((a, b) => {
          const aTime = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
          const bTime = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
          return bTime - aTime;
        });
    },
    enabled: !!user,
  });
}

export function useChatSession(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['chat-session', sessionId],
    queryFn: async (): Promise<ChatSessionWithRelations | null> => {
      if (!sessionId) return null;

      const { data, error } = await db
        .from('chat_sessions')
        .select(`
          *,
          characters (*),
          books (*)
        `)
        .eq('session_id', sessionId)
        .is('deleted_at', null)
        .single();

      if (error || !data) return null;
      return data as ChatSessionWithRelations;
    },
    enabled: !!sessionId,
  });
}

export function useCreateChatSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      characterId,
      bookId,
    }: {
      characterId: string;
      bookId: string;
    }): Promise<string> => {
      if (!user) throw new Error('User not authenticated');

      const { data: existing } = await db
        .from('chat_sessions')
        .select('session_id')
        .eq('user_id', user.id)
        .eq('character_id', characterId)
        .is('deleted_at', null)
        .maybeSingle();

      if (existing?.session_id) {
        return existing.session_id;
      }

      const sessionId = crypto.randomUUID();

      const sessionInsert = {
        session_id: sessionId,
        user_id: user.id,
        character_id: characterId,
        book_id: bookId,
        title: null,
        last_message_at: null,
        last_message_preview: null,
        message_count: 0,
        is_archived: false,
      };

      const { error } = await db
        .from('chat_sessions')
        .insert(sessionInsert);

      if (error) {
        console.error('Session insert error:', error);
        throw new Error(`Failed to create session: ${error.message}`);
      }

      return sessionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Unable to create chat session.',
        variant: 'destructive',
      });
    },
  });
}

export function useArchiveChatSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await db
        .from('chat_sessions')
        .update({ is_archived: true })
        .eq('session_id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      toast({
        title: 'Chat Archived',
        description: 'Chat has been archived.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Unable to archive chat.',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteChatSession() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await db
        .from('chat_sessions')
        .update({ deleted_at: new Date().toISOString() })
        .eq('session_id', sessionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast({
        title: 'Chat Deleted',
        description: 'Chat and all messages have been deleted.',
      });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Unable to delete chat.',
        variant: 'destructive',
      });
    },
  });
}
