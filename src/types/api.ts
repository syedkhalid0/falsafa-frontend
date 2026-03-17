export type BookProcessingPriority = 'low' | 'medium' | 'high';
export type BookProcessingStatus = 'queued' | 'processing' | 'success' | 'failed';

export interface EnqueueBookRequest {
  user_id: string;
  book_id: string;
  book_url: string[];
  priority?: BookProcessingPriority;
  book_name?: string;
  book_author?: string;
  book_description?: string;
  upload_date?: string;
  top?: number;
  min_mentions?: number;
}

export interface EnqueueBookResponse {
  book_id: string;
}

export interface ChatStreamRequest {
  userUID: string;
  sessionID: string;
  characterID: string;
  userMessage: string;
}

export interface APIError {
  error: string;
  message?: string;
}
