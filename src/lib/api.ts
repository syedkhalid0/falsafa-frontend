import type {
  EnqueueBookRequest,
  EnqueueBookResponse,
  ChatStreamRequest,
  APIError,
} from '@/types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7001';
const API_TOKEN = import.meta.env.VITE_API_TOKEN;

if (!API_TOKEN) {
  console.warn('VITE_API_TOKEN is not set. API calls will fail.');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (API_TOKEN) {
    headers['Authorization'] = `Bearer ${API_TOKEN}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error: APIError = await response.json().catch(() => ({
      error: `HTTP ${response.status}`,
    }));
    throw new Error(error.error || error.message || 'API request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const api = {
  async enqueueBook(data: EnqueueBookRequest): Promise<EnqueueBookResponse> {
    return request<EnqueueBookResponse>('/book/enqueue', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async healthCheck(): Promise<string> {
    return request<string>('/health');
  },

  async statusCheck(): Promise<{
    status: string;
    redis: string;
    neo4j: string;
    qdrant: string;
    typesense: string;
    dip_pipeline: string;
  }> {
    return request('/status');
  },

  async *streamChat(
    data: ChatStreamRequest
  ): AsyncGenerator<{ type: string; content?: string }> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_TOKEN) {
      headers['Authorization'] = `Bearer ${API_TOKEN}`;
    }

    const response = await fetch(`${API_URL}/chat/converse`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: APIError = await response.json().catch(() => ({
        error: `HTTP ${response.status}`,
      }));
      throw new Error(error.error || error.message || 'Chat stream failed');
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.trim()) continue;
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            yield { type: 'done' };
          } else {
            try {
              const parsed = JSON.parse(data);
              if (parsed.error) {
                yield { type: 'error', content: parsed.error };
              } else {
                yield { type: 'content', content: typeof parsed === 'string' ? parsed : data };
              }
            } catch {
              yield { type: 'content', content: data };
            }
          }
        }
      }
    }

    if (buffer.trim()) {
      const line = buffer;
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data !== '[DONE]') {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              yield { type: 'error', content: parsed.error };
            } else {
              yield { type: 'content', content: parsed };
            }
          } catch {
            yield { type: 'content', content: data };
          }
        }
      }
    }
  },
};

export { API_URL, API_TOKEN };
