import { useState, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

export type ChatStreamStatus = 'idle' | 'thinking' | 'streaming' | 'error' | 'done';

interface UseChatStreamOptions {
  onComplete?: (response: string) => void;
  onError?: (error: string) => void;
}

export function useChatStream(options?: UseChatStreamOptions) {
  const [status, setStatus] = useState<ChatStreamStatus>('idle');
  const [thinkingMessage, setThinkingMessage] = useState<string>('');
  const [thinkingStep, setThinkingStep] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const sendMessage = useCallback(
    async (params: {
      message: string;
      userId: string;
      bookId: string;
      characterId: string;
      sessionId: string;
    }) => {
      setStatus('thinking');
      setThinkingMessage('Starting...');
      setThinkingStep('init');
      setResponse('');
      setError(null);

      try {
        const stream = api.streamChat({
          userUID: params.userId,
          sessionID: params.sessionId,
          characterID: params.characterId,
          userMessage: params.message,
        });

        let accumulatedResponse = '';

        for await (const chunk of stream) {
          if (chunk.type === 'error') {
            setStatus('error');
            setError(chunk.content || 'An error occurred');
            optionsRef.current?.onError?.(chunk.content || 'An error occurred');
            break;
          } else if (chunk.type === 'content') {
            setStatus('streaming');
            accumulatedResponse += (chunk.content || '');
            setResponse(accumulatedResponse);
          } else if (chunk.type === 'done') {
            setStatus('done');
            setThinkingStep('complete');
            if (accumulatedResponse) {
              optionsRef.current?.onComplete?.(accumulatedResponse);
            }
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setStatus('error');
        setError(errorMessage);
        optionsRef.current?.onError?.(errorMessage);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setThinkingMessage('');
    setThinkingStep('');
    setResponse('');
    setError(null);
  }, []);

  return {
    status,
    thinkingMessage,
    thinkingStep,
    response,
    error,
    sendMessage,
    reset,
    isThinking: status === 'thinking',
    isStreaming: status === 'streaming',
    isDone: status === 'done',
    isError: status === 'error',
    isIdle: status === 'idle',
  };
}
