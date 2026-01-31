import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supported Indian languages for detection
const INDIAN_LANGUAGES = [
  'hi', // Hindi
  'kn', // Kannada
  'te', // Telugu
  'ta', // Tamil
  'ml', // Malayalam
  'mr', // Marathi
  'bn', // Bengali
  'gu', // Gujarati
  'pa', // Punjabi
  'or', // Odia
  'as', // Assamese
  'ur', // Urdu
];

interface TranslationRequest {
  texts: { field: string; value: string }[];
}

interface TranslationResult {
  field: string;
  original: string;
  translated: string;
  detectedLanguage: string | null;
  isTranslated: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { texts } = await req.json() as TranslationRequest;

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: texts array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Filter out empty values
    const validTexts = texts.filter(t => t.value && t.value.trim().length > 0);
    
    if (validTexts.length === 0) {
      return new Response(
        JSON.stringify({ results: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create the prompt for translation and language detection
    const textsToProcess = validTexts.map((t, i) => `[${i}] ${t.field}: "${t.value}"`).join('\n');
    
    const systemPrompt = `You are a translation expert specializing in Indian languages. Your task is to:
1. Detect if the text is in any Indian language (Hindi, Kannada, Telugu, Tamil, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Odia, Assamese, Urdu)
2. If the text is in an Indian language, translate it to English
3. If the text is already in English or uses English words written in Roman script, return it as-is
4. Preserve proper nouns, names, and places as much as possible

IMPORTANT: You must respond ONLY with a valid JSON array, no additional text or explanation.`;

    const userPrompt = `Process the following texts. For each text:
- Detect the language
- Translate to English if it's in an Indian language
- Return the original if it's already English

Texts to process:
${textsToProcess}

Respond with a JSON array where each item has:
- "index": the number in brackets
- "detectedLanguage": ISO 639-1 code (e.g., "hi" for Hindi, "en" for English, "kn" for Kannada, etc.)
- "translated": the English translation (or original if already English)
- "isTranslated": boolean indicating if translation was performed

Example response format:
[{"index": 0, "detectedLanguage": "hi", "translated": "Hello", "isTranslated": true}]`;

    console.log('Sending translation request to Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Service credits exhausted. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('AI response:', content);

    // Parse the AI response
    let translationData;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      let jsonString = content;
      if (content.includes('```')) {
        const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (match) {
          jsonString = match[1].trim();
        }
      }
      translationData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Fallback: return original texts without translation
      const results: TranslationResult[] = validTexts.map(t => ({
        field: t.field,
        original: t.value,
        translated: t.value,
        detectedLanguage: 'en',
        isTranslated: false,
      }));
      return new Response(
        JSON.stringify({ results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Map results back to original fields
    const results: TranslationResult[] = validTexts.map((t, index) => {
      const translation = translationData.find((tr: any) => tr.index === index);
      return {
        field: t.field,
        original: t.value,
        translated: translation?.translated || t.value,
        detectedLanguage: translation?.detectedLanguage || 'en',
        isTranslated: translation?.isTranslated || false,
      };
    });

    console.log('Translation results:', results);

    return new Response(
      JSON.stringify({ results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Translation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
