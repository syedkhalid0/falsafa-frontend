import { useQuery, useQueryClient } from '@tanstack/react-query';
import { db } from '@/lib/supabase';
import type { Message } from '@/types/database';

export function useMessages(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['messages', sessionId],
    queryFn: async (): Promise<Message[]> => {
      if (!sessionId) return [];
      const { data } = await db
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });
      return data || [];
    },
    enabled: !!sessionId,
  });
}

export function useInvalidateMessages() {
  const queryClient = useQueryClient();
  
  return (sessionId: string) => {
    queryClient.invalidateQueries({ queryKey: ['messages', sessionId] });
    queryClient.invalidateQueries({ queryKey: ['chat-sessions'] });
  };
}
