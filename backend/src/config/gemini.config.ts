import { HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Gemini AI Configuration
export const geminiConfig = {
  model: "gemini-2.5-flash",
  
  generationConfig: {
    temperature: 0.7,           // Creativity: 0.0 (deterministic) - 2.0 (very creative)
    maxOutputTokens: 2000,      // Maximum response length (tokens)
    topP: 0.95,                 // Nucleus sampling: probability mass to consider
    topK: 40,                   // Top-K sampling: top k tokens to consider
  },
  
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE
    }
  ],
  
  // System prompt for evaluation generation
  systemPrompt: "You are a professional evaluation assistant. Create brief, positive, and constructive evaluations based on the given prompt. Be specific, encouraging, and highlight achievements while suggesting areas for growth."
};

// Alternative configurations for different use cases
export const geminiConfigCreative = {
  ...geminiConfig,
  generationConfig: {
    ...geminiConfig.generationConfig,
    temperature: 1.2,  // More creative
    maxOutputTokens: 800
  }
};

export const geminiConfigPrecise = {
  ...geminiConfig,
  generationConfig: {
    ...geminiConfig.generationConfig,
    temperature: 0.3,  // More deterministic
    maxOutputTokens: 300
  }
};
