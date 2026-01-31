import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TranslationResult {
  field: string;
  original: string;
  translated: string;
  detectedLanguage: string | null;
  isTranslated: boolean;
}

interface TranslationResponse {
  results: TranslationResult[];
  error?: string;
}

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const translateTexts = async (
    texts: { field: string; value: string }[]
  ): Promise<TranslationResult[]> => {
    // Filter out empty values
    const validTexts = texts.filter(t => t.value && t.value.trim().length > 0);
    
    if (validTexts.length === 0) {
      return [];
    }

    setIsTranslating(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke<TranslationResponse>('translate', {
        body: { texts: validTexts },
      });

      if (invokeError) {
        throw invokeError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.results || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Translation failed';
      setError(message);
      console.error('Translation error:', err);
      
      // Return original values on error (graceful degradation)
      return validTexts.map(t => ({
        field: t.field,
        original: t.value,
        translated: t.value,
        detectedLanguage: null,
        isTranslated: false,
      }));
    } finally {
      setIsTranslating(false);
    }
  };

  const translateSingle = async (
    field: string,
    value: string
  ): Promise<TranslationResult | null> => {
    const results = await translateTexts([{ field, value }]);
    return results.length > 0 ? results[0] : null;
  };

  return {
    translateTexts,
    translateSingle,
    isTranslating,
    error,
  };
}
