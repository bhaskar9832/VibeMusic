import { GoogleGenAI, Type } from "@google/genai";
import { UserContext, Playlist, Song } from "../types";
import { searchYouTubeVideo } from "./youtubeService";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MOOD_MODEL = "gemini-2.5-flash";
const RECOMMENDATION_MODEL = "gemini-2.5-flash";

// =======================
// 1) IMAGE MOOD DETECTION
// =======================
export const analyzeMoodFromImage = async (base64Image: string): Promise<string> => {
  try {
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

    const response = await ai.models.generateContent({
      model: MOOD_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: "Analyze the facial expression. Return exactly one word (Happy, Sad, Energetic, Focused, Tired, Calm)."
          }
        ]
      }
    });

    return response.text?.trim() || "Neutral";
  } catch (error) {
    console.error("Gemini Mood Detection Error:", error);
    return "Neutral";
  }
};

// =======================
// 2) HELPER: FIND YOUTUBE ID VIA GROUNDING
// =======================
// Uses Gemini's Google Search tool to find the exact official video URL
const findYoutubeIdWithGrounding = async (title: string, artist: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the official YouTube video URL for "${title}" by "${artist}".`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    // Check Grounding Metadata for Links
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      for (const chunk of chunks) {
        if (chunk.web?.uri && chunk.web.uri.includes('youtube.com/watch?v=')) {
          try {
            const urlObj = new URL(chunk.web.uri);
            const videoId = urlObj.searchParams.get('v');
            if (videoId && videoId.length === 11) {
              return videoId;
            }
          } catch (e) {
            continue;
          }
        }
      }
    }
    
    return null;
  } catch (error) {
    console.warn(`Failed to resolve ID for ${title}:`, error);
    return null;
  }
};

// =======================
// 3) PLAYLIST GENERATION
// =======================
export const generatePlaylist = async (context: UserContext): Promise<Playlist> => {
  try {
    const prompt = `
      Create a music playlist based on:
      - Weather: ${context.weather?.condition}, ${context.weather?.temperature}°C
      - Mood: ${context.mood}
      - Activity: ${context.activity}
      - Language: ${context.language}

      Prioritize songs in "${context.language}".
      If language = Instrumental → no lyrics.

      Return JSON with 5 songs.
    `;

    const response = await ai.models.generateContent({
      model: RECOMMENDATION_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            coverGradient: { type: Type.STRING },
            songs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  artist: { type: Type.STRING },
                  vibe: { type: Type.STRING },
                  duration: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No AI response");
    }

    const parsed = JSON.parse(response.text) as Playlist;

    // ============================
    // 4) ATTACH EXACT YOUTUBE IDs
    // ============================
    // We process these in parallel to speed up loading
    const songsWithIds = await Promise.all(
      parsed.songs.map(async (song) => {
        // 1. Try API First (User Request)
        // This uses the specific youtubeService with the API key provided
        let videoId = await searchYouTubeVideo(`${song.title} ${song.artist} official audio`);

        // 2. Fallback to Grounding if API fails or returns null
        if (!videoId) {
           console.log(`API failed for ${song.title}, trying grounding...`);
           videoId = await findYoutubeIdWithGrounding(song.title, song.artist);
        }
        
        return {
          ...song,
          youtubeId: videoId || undefined,
          url: videoId
            ? `https://www.youtube.com/watch?v=${videoId}`
            : `https://www.youtube.com/results?search_query=${encodeURIComponent(song.title + ' ' + song.artist)}`
        };
      })
    );

    parsed.songs = songsWithIds;

    return parsed;

  } catch (error) {
    console.error("Gemini Playlist Generation Error:", error);

    // =======================
    // 5) FALLBACK PLAYLIST
    // =======================
    const fallbackSongs: Song[] = [
      {
        title: "Lofi Hip Hop Radio",
        artist: "Lofi Girl",
        vibe: "Relaxing",
        duration: "LIVE",
        youtubeId: "jfKfPfyJRdk",
        url: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
      },
      {
        title: "Blinding Lights",
        artist: "The Weeknd",
        vibe: "Driving",
        duration: "3:20",
        youtubeId: "4NRXx6U8ABQ",
        url: "https://www.youtube.com/watch?v=4NRXx6U8ABQ"
      }
    ];

    return {
      name: "Offline Vibes",
      description: "AI unavailable, but here are some classics.",
      coverGradient: "linear-gradient(to right, #4b5563, #1f2937)",
      songs: fallbackSongs
    };
  }
};
