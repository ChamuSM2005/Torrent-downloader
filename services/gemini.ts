
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

export const searchTorrentInfo = async (query: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Search for detailed information, reviews, and technical specifications for: ${query}. Provide a concise summary and key details.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  return {
    text: response.text || '',
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const editMediaImage = async (base64Image: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/png',
          },
        },
        { text: prompt },
      ],
    },
  });

  let imageUrl = '';
  const parts = response.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData) {
      imageUrl = `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return imageUrl;
};
