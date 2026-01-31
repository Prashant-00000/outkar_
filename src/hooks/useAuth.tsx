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
  signUp: (email: string, password: string, fullName: string, role: 'worker' | 'customer') => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to translate text
async function translateText(texts: { field: string; value: string }[]): Promise<TranslationResult[]> {
  const validTexts = texts.filter(t => t.value && t.value.trim().length > 0);
  if (validTexts.length === 0) return [];

  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: { texts: validTexts },
    });

    if (error) throw error;
    return data?.results || validTexts.map(t => ({
      field: t.field,
      original: t.value,
      translated: t.value,
      detectedLanguage: 'en',
      isTranslated: false,
    }));
  } catch (err) {
    console.error('Translation error during signup:', err);
    // Graceful fallback - use original values
    return validTexts.map(t => ({
      field: t.field,
      original: t.value,
      translated: t.value,
      detectedLanguage: null,
      isTranslated: false,
    }));
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: 'worker' | 'customer') => {
    try {
      // Translate the full name if it's in an Indian language
      const translationResults = await translateText([{ field: 'full_name', value: fullName }]);
      const nameTranslation = translationResults.find(r => r.field === 'full_name');
      
      const translatedName = nameTranslation?.translated || fullName;
      const originalName = nameTranslation?.isTranslated ? fullName : null;
      const detectedLanguage = nameTranslation?.detectedLanguage || null;

      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: translatedName,
            role: role,
          }
        }
      });

      if (error) throw error;

      // Create profile after signup with translation data
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          user_id: data.user.id,
          email: email,
          full_name: translatedName,
          full_name_original: originalName,
          full_name_language: detectedLanguage,
          role: role,
        });

        if (profileError) throw profileError;

        // If worker, create worker profile
        if (role === 'worker') {
          const { error: workerError } = await supabase.from('worker_profiles').insert({
            user_id: data.user.id,
          });

          if (workerError) throw workerError;
        }
      }

      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
