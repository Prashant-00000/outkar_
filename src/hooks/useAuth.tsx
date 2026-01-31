import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface TranslationResult {
  field: string;
  original: string;
  translated: string;
  detectedLanguage: string | null;
  isTranslated: boolean;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: 'worker' | 'customer'
  ) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------- Translation helper ----------
async function translateText(
  texts: { field: string; value: string }[]
): Promise<TranslationResult[]> {
  const validTexts = texts.filter(t => t.value?.trim());
  if (validTexts.length === 0) return [];

  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { texts: validTexts },
    });

    if (error) throw error;

    return (
      data?.results ||
      validTexts.map(t => ({
        field: t.field,
        original: t.value,
        translated: t.value,
        detectedLanguage: 'en',
        isTranslated: false,
      }))
    );
  } catch {
    return validTexts.map(t => ({
      field: t.field,
      original: t.value,
      translated: t.value,
      detectedLanguage: null,
      isTranslated: false,
    }));
  }
}

// ---------- Provider ----------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // ---------- SIGN UP ----------
  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: 'worker' | 'customer'
  ) => {
    try {
      const translation = await translateText([
        { field: 'full_name', value: fullName },
      ]);

      const nameData = translation[0];
      const translatedName = nameData?.translated ?? fullName;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: translatedName,
            role,
          },
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('User not created');

      // ✅ CORRECT PROFILE INSERT
     const { error: profileError } = await supabase
  .from('profiles')
  .insert([
    {
      user_id: data.user.id,
      email,
      full_name: translatedName,
      full_name_original: nameData?.isTranslated ? fullName : null,
      full_name_language: nameData?.detectedLanguage ?? null,
      role,
    },
  ]);

if (profileError) throw profileError;

      // Worker profile (only if worker)
      if (role === 'worker') {
        await supabase.from('worker_profiles').insert({
          user_id: data.user.id, // OK if this column exists
        });
      }

      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // ---------- SIGN IN ----------
  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return { error: null };
    } catch (err) {
      return { error: err as Error };
    }
  };

  // ---------- SIGN OUT ----------
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------- Hook ----------
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
