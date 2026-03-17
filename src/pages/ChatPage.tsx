import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, MessageCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { CharacterAvatar } from "@/components/CharacterAvatar";
import { useAuth } from "@/contexts/AuthContext";
import { useChatSessions, useChatSession, useCreateChatSession } from "@/hooks/useChatSessions";
import { useMessages, useInvalidateMessages } from "@/hooks/useMessages";
import { useChatStream } from "@/hooks/useChatStream";
import { useUserLibrary } from "@/hooks/useUserLibrary";
import type { Message } from "@/types/database";

export default function ChatPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  if (sessionId) {
    return (
      <ActiveChatView
        sessionId={sessionId}
        input={input}
        setInput={setInput}
        textareaRef={textareaRef}
        messagesEndRef={messagesEndRef}
      />
    );
  }

  return <ChatListView />;
}

function ChatListView() {
  const { data: sessions, isLoading } = useChatSessions();
  const { data: libraryData } = useUserLibrary();

  const libraryBooks = libraryData?.map((item) => item.books) || [];

  return (
    <div className="px-4 md:px-6 pt-6 pb-8 animate-fade-in">
      <h1 className="text-2xl md:text-3xl font-serif font-bold mb-4">Chats</h1>

      {libraryBooks.length > 0 && (
        <section className="mb-6">
          <p className="text-xs text-muted-foreground mb-2">Your Library</p>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {libraryBooks.map((book) => (
              <Link key={book.id} to={`/book/${book.id}`} className="flex flex-col items-center shrink-0 w-[70px]">
                <div className="w-14 h-[72px] rounded-xl overflow-hidden bg-muted shadow-soft">
                  {book.cover_image_url ? (
                    <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[10px]">
                      No cover
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1 text-foreground line-clamp-1 text-center">{book.title}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground mb-2">Recent Conversations</p>
          {sessions.map((session) => (
            <Link
              key={session.session_id}
              to={`/chat/${session.session_id}`}
              className="flex items-center gap-3 p-3 rounded-2xl bg-card border border-border hover:shadow-soft transition-all"
            >
              <CharacterAvatar
                name={session.characters.name}
                avatar={session.characters.avatar_url}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground">{session.characters.name}</h3>
                  {session.last_message_at && (
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeTime(session.last_message_at)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{session.books.title}</p>
                {session.last_message_preview && (
                  <p className="text-xs text-muted-foreground/80 mt-0.5 line-clamp-1">
                    {session.last_message_preview}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-20 w-20 rounded-full bg-lavender-light flex items-center justify-center mb-4">
            <MessageCircle className="h-9 w-9 text-primary" />
          </div>
          <h3 className="font-serif font-semibold text-lg mb-1">No conversations yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Pick a character from your library and start a conversation.
          </p>
          <Link
            to="/library"
            className="mt-4 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Browse Library
          </Link>
        </div>
      )}
    </div>
  );
}

interface ActiveChatViewProps {
  sessionId: string;
  input: string;
  setInput: (v: string) => void;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

function ActiveChatView({
  sessionId,
  input,
  setInput,
  textareaRef,
  messagesEndRef,
}: ActiveChatViewProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: session, isLoading: sessionLoading } = useChatSession(sessionId);
  const { data: messages, isLoading: messagesLoading } = useMessages(sessionId);
  const invalidateMessages = useInvalidateMessages();
  const chatStream = useChatStream({
    onComplete: () => {
      invalidateMessages(sessionId);
    },
  });

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 180) + "px";
  }, []);

  useEffect(() => {
    resizeTextarea();
  }, [input, resizeTextarea]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  }, [messages, chatStream.response, messagesEndRef]);

  const handleSend = async () => {
    if (!input.trim() || !user || !session) return;

    const messageText = input.trim();
    setInput("");
    resizeTextarea();

    await chatStream.sendMessage({
      message: messageText,
      userId: user.id,
      bookId: session.book_id,
      characterId: session.character_id,
      sessionId: sessionId,
    });
  };

  if (sessionLoading || messagesLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-muted-foreground">Session not found</p>
        <Link to="/chat" className="mt-2 text-primary text-sm hover:underline">
          Back to chats
        </Link>
      </div>
    );
  }

  const charName = session.characters.name;
  const bookTitle = session.books.title;
  const charAvatar = session.characters.avatar_url;

  const allMessages: Array<{ id: string; role: string; content: string; isStreaming?: boolean }> = [
    ...(messages || []).map((m) => ({ id: m.id, role: m.role, content: m.content })),
  ];

  if (chatStream.response) {
    allMessages.push({
      id: 'streaming-response',
      role: 'assistant',
      content: chatStream.response,
      isStreaming: chatStream.isStreaming,
    });
  }

  return (
    <div className="flex flex-col h-dvh md:h-screen animate-fade-in">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
        <Link to="/chat" className="p-1 rounded-lg hover:bg-muted transition-colors">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
        <CharacterAvatar name={charName} avatar={charAvatar} size="md" />
        <div className="min-w-0">
          <h2 className="text-sm font-serif font-semibold text-foreground line-clamp-1">{charName}</h2>
          <p className="text-[10px] text-muted-foreground line-clamp-1">{bookTitle}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {allMessages.length === 0 && !chatStream.isThinking ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="h-16 w-16 rounded-full bg-lavender-light flex items-center justify-center mb-3">
              <MessageCircle className="h-7 w-7 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Say hello to {charName}! Start a conversation about their story.
            </p>
          </div>
        ) : (
          <>
            {allMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2 max-w-[85%]",
                  msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                )}
              >
                {msg.role !== "user" && (
                  <CharacterAvatar name={charName} avatar={charAvatar} size="sm" className="mt-1" />
                )}
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm leading-relaxed",
                    msg.role === "user"
                      ? "bg-chat-user text-foreground rounded-br-md"
                      : "bg-chat-ai text-foreground rounded-bl-md"
                  )}
                >
                  {msg.content}
                  {msg.isStreaming && <span className="animate-pulse">...</span>}
                </div>
              </div>
            ))}

            {chatStream.isThinking && (
              <div className="flex gap-2 max-w-[85%]">
                <CharacterAvatar name={charName} avatar={charAvatar} size="sm" className="mt-1" />
                <div className="px-4 py-2.5 rounded-2xl bg-chat-ai text-foreground rounded-bl-md text-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span className="text-muted-foreground">{chatStream.thinkingMessage}</span>
                  </div>
                </div>
              </div>
            )}

            {chatStream.error && (
              <div className="flex gap-2 max-w-[85%]">
                <CharacterAvatar name={charName} avatar={charAvatar} size="sm" className="mt-1" />
                <div className="px-4 py-2.5 rounded-2xl bg-destructive/10 text-destructive rounded-bl-md text-sm">
                  {chatStream.error}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="px-4 py-3 border-t border-border bg-card/50 backdrop-blur-sm shrink-0">
        <div className="flex items-end gap-2 max-w-3xl mx-auto">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              resizeTextarea();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${charName}...`}
            rows={1}
            disabled={chatStream.isThinking || chatStream.isStreaming}
            className="flex-1 min-h-[44px] max-h-[180px] px-4 py-3 rounded-xl bg-background border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none overflow-y-auto leading-relaxed disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatStream.isThinking || chatStream.isStreaming}
            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 transition-opacity shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {chatStream.isThinking || chatStream.isStreaming ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}
