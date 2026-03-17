import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, db } from '@/lib/supabase';

type UserRole = 'user' | 'moderator' | 'admin';

interface Profile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  email: string | null;
  is_public: boolean;
  status: 'active' | 'blocked';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data } = await db
      .from('profiles')
      .select('id, display_name, avatar_url, bio, email, is_public, status')
      .eq('id', userId)
      .single();
    if (data) setProfile(data);
  };

  const fetchRole = async (userId: string) => {
    const { data } = await db
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    setRole(data?.role || 'user');
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        if (session?.user && mounted) {
          // Fetch profile and role in the background so it doesn't block the UI
          Promise.all([fetchProfile(session.user.id), fetchRole(session.user.id)])
            .catch(err => console.error("Error fetching user data on init:", err));
        }
      } catch (err) {
        console.error("Error getting session:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      try {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        if (session?.user && mounted) {
          // Background fetch
          Promise.all([fetchProfile(session.user.id), fetchRole(session.user.id)])
            .catch(err => console.error("Error fetching user data on auth change:", err));
        } else if (mounted) {
          setProfile(null);
          setRole('user');
        }
      } catch (err) {
        console.error("Error on auth state change:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, role, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
