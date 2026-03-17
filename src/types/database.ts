export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      books: {
        Row: Book;
        Insert: BookInsert;
        Update: BookUpdate;
      };
      book_files: {
        Row: BookFile;
        Insert: BookFileInsert;
        Update: BookFileUpdate;
      };
      characters: {
        Row: Character;
        Insert: CharacterInsert;
        Update: CharacterUpdate;
      };
      user_library: {
        Row: UserLibrary;
        Insert: UserLibraryInsert;
        Update: UserLibraryUpdate;
      };
      user_wishlist: {
        Row: UserWishlist;
        Insert: UserWishlistInsert;
        Update: UserWishlistUpdate;
      };
      book_purchases: {
        Row: BookPurchase;
        Insert: BookPurchaseInsert;
        Update: BookPurchaseUpdate;
      };
      book_ratings: {
        Row: BookRating;
        Insert: BookRatingInsert;
        Update: BookRatingUpdate;
      };
      book_reviews: {
        Row: BookReview;
        Insert: BookReviewInsert;
        Update: BookReviewUpdate;
      };
      book_comments: {
        Row: BookComment;
        Insert: BookCommentInsert;
        Update: BookCommentUpdate;
      };
      chat_sessions: {
        Row: ChatSession;
        Insert: ChatSessionInsert;
        Update: ChatSessionUpdate;
      };
      messages: {
        Row: Message;
        Insert: MessageInsert;
        Update: MessageUpdate;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: ReportUpdate;
      };
      user_roles: {
        Row: UserRole;
        Insert: UserRoleInsert;
        Update: UserRoleUpdate;
      };
      audit_logs: {
        Row: AuditLog;
        Insert: AuditLogInsert;
        Update: AuditLogUpdate;
      };
      app_settings: {
        Row: AppSetting;
        Insert: AppSettingInsert;
        Update: AppSettingUpdate;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_status: UserStatus;
      user_role: UserRoleType;
      book_status: BookStatus;
      book_processing_status: BookProcessingStatus;
      reading_status: ReadingStatus;
      content_status: ContentStatus;
      report_status: ReportStatus;
      report_type: ReportType;
      notification_type: NotificationType;
      chat_role: ChatRole;
      file_type: FileType;
    };
  };
}

export type UserStatus = 'active' | 'blocked';
export type UserRoleType = 'user' | 'moderator' | 'admin';
export type BookStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'disabled';
export type BookProcessingStatus = 'queued' | 'processing' | 'success' | 'failed';
export type ReadingStatus = 'unread' | 'reading' | 'finished' | 'dropped';
export type ContentStatus = 'pending' | 'approved' | 'rejected' | 'hidden';
export type ReportStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';
export type ReportType = 'spam' | 'harassment' | 'inappropriate' | 'copyright' | 'other';
export type NotificationType = 'chat' | 'book' | 'system' | 'moderation' | 'review';
export type ChatRole = 'user' | 'assistant' | 'character';
export type FileType = 'pdf' | 'epub' | 'mobi';

export interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  is_public: boolean;
  status: UserStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type ProfileInsert = Omit<Profile, 'created_at' | 'updated_at'>;
export type ProfileUpdate = Partial<ProfileInsert>;

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
export type CategoryUpdate = Partial<CategoryInsert>;

export interface Book {
  id: string;
  title: string;
  slug: string;
  author: string | null;
  description: string | null;
  cover_image_url: string | null;
  category_id: string | null;
  uploader_id: string | null;
  file_path: string | null;
  price: number;
  isbn: string | null;
  language: string;
  page_count: number | null;
  published_year: number | null;
  total_chunks: number;
  average_rating: number;
  ratings_count: number;
  reviews_count: number;
  views_count: number;
  library_count: number;
  status: BookStatus;
  processing_status: BookProcessingStatus;
  rejection_reason: string | null;
  is_featured: boolean;
  is_public: boolean;
  metadata: Json;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type BookInsert = Omit<Book, 'id' | 'created_at' | 'updated_at'>;
export type BookUpdate = Partial<BookInsert>;

export interface BookFile {
  id: string;
  book_id: string;
  file_type: FileType | null;
  file_url: string;
  file_size_bytes: number | null;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type BookFileInsert = Omit<BookFile, 'id' | 'created_at' | 'updated_at'>;
export type BookFileUpdate = Partial<BookFileInsert>;

export interface Character {
  id: string;
  book_id: string;
  name: string;
  description: string | null;
  avatar_url: string | null;
  aliases: string[];
  role: string | null;
  mention_count: number;
  personality_traits: Json;
  system_prompt: string | null;
  processing_version: number;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CharacterInsert = Omit<Character, 'id' | 'created_at' | 'updated_at'>;
export type CharacterUpdate = Partial<CharacterInsert>;

export interface UserLibrary {
  id: string;
  user_id: string;
  book_id: string;
  reading_status: ReadingStatus;
  reading_progress: number;
  current_page: number;
  last_read_at: string | null;
  personal_notes: string | null;
  is_favorite: boolean;
  added_at: string;
  updated_at: string;
}

export type UserLibraryInsert = Omit<UserLibrary, 'id' | 'added_at' | 'updated_at'>;
export type UserLibraryUpdate = Partial<UserLibraryInsert>;

export interface UserWishlist {
  id: string;
  user_id: string;
  book_id: string;
  added_at: string;
}

export type UserWishlistInsert = Omit<UserWishlist, 'id' | 'added_at'>;
export type UserWishlistUpdate = Partial<UserWishlistInsert>;

export interface BookPurchase {
  id: string;
  user_id: string;
  book_id: string;
  price_paid: number;
  purchased_at: string;
  payment_status: string;
  payment_reference: string | null;
}

export type BookPurchaseInsert = Omit<BookPurchase, 'id' | 'purchased_at'>;
export type BookPurchaseUpdate = Partial<BookPurchaseInsert>;

export interface BookRating {
  id: string;
  user_id: string;
  book_id: string;
  rating: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type BookRatingInsert = Omit<BookRating, 'id' | 'created_at' | 'updated_at'>;
export type BookRatingUpdate = Partial<BookRatingInsert>;

export interface BookReview {
  id: string;
  user_id: string;
  book_id: string;
  title: string | null;
  content: string;
  is_spoiler: boolean;
  status: ContentStatus;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type BookReviewInsert = Omit<BookReview, 'id' | 'created_at' | 'updated_at'>;
export type BookReviewUpdate = Partial<BookReviewInsert>;

export interface BookComment {
  id: string;
  book_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  status: ContentStatus;
  reports_count: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type BookCommentInsert = Omit<BookComment, 'id' | 'created_at' | 'updated_at'>;
export type BookCommentUpdate = Partial<BookCommentInsert>;

export interface ChatSession {
  session_id: string;
  user_id: string;
  character_id: string;
  book_id: string;
  title: string | null;
  last_message_at: string | null;
  last_message_preview: string | null;
  message_count: number;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type ChatSessionInsert = Omit<ChatSession, 'session_id' | 'created_at' | 'updated_at'>;
export type ChatSessionUpdate = Partial<ChatSessionInsert>;

export interface Message {
  id: string;
  session_id: string;
  role: ChatRole;
  content: string;
  metadata: Json;
  created_at: string;
}

export type MessageInsert = Omit<Message, 'id' | 'created_at'>;
export type MessageUpdate = Partial<MessageInsert>;

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Json;
  read_at: string | null;
  created_at: string;
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;
export type NotificationUpdate = Partial<NotificationInsert>;

export interface Report {
  id: string;
  reporter_id: string | null;
  reported_user_id: string | null;
  reported_book_id: string | null;
  reported_review_id: string | null;
  reported_comment_id: string | null;
  report_type: ReportType;
  reason: string;
  status: ReportStatus;
  resolved_by: string | null;
  resolution_note: string | null;
  created_at: string;
  updated_at: string;
}

export type ReportInsert = Omit<Report, 'id' | 'created_at' | 'updated_at'>;
export type ReportUpdate = Partial<ReportInsert>;

export interface UserRole {
  id: string;
  user_id: string;
  role: UserRoleType;
  assigned_by: string | null;
  assigned_at: string;
}

export type UserRoleInsert = Omit<UserRole, 'id' | 'assigned_at'>;
export type UserRoleUpdate = Partial<UserRoleInsert>;

export interface AuditLog {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  old_values: Json | null;
  new_values: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type AuditLogInsert = Omit<AuditLog, 'id' | 'created_at'>;
export type AuditLogUpdate = Partial<AuditLogInsert>;

export interface AppSetting {
  id: string;
  key: string;
  value: Json;
  description: string | null;
  updated_by: string | null;
  updated_at: string;
}

export type AppSettingInsert = Omit<AppSetting, 'id' | 'updated_at'>;
export type AppSettingUpdate = Partial<AppSettingInsert>;

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
