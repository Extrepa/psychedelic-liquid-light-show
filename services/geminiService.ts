
import { GoogleGenAI, Type } from "@google/genai";
import type { LiquidConfig } from '../types';

// Per coding guidelines, the API key is expected to be available in the environment
// variables and is used directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateColorPalette(prompt: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a vibrant color palette of 5 hex codes inspired by the theme '${prompt}'. The colors should be aesthetically pleasing and suitable for a psychedelic liquid light show.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              description: "An array of 5 hex color code strings.",
              items: {
                type: Type.STRING,
                description: "A hex color code, e.g., '#RRGGBB'",
              },
            },
          },
          required: ["colors"],
        },
      },
    });

    const jsonText = response.text.trim();
    
    try {
      const parsed = JSON.parse(jsonText);
      if (parsed.colors && Array.isArray(parsed.colors) && parsed.colors.length > 0) {
        return parsed.colors;
      }
    } catch(e) {
      console.error("Failed to parse JSON response from AI:", jsonText, e);
      throw new Error("Failed to parse palette from AI response.");
    }
    
    return [];

  } catch (error) {
    console.error("Error generating color palette:", error);
    throw new Error("Failed to generate palette from AI");
  }
}

export async function generateVibe(prompt: string): Promise<{ colors: string[], config: Partial<LiquidConfig> } | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate a "vibe" for a psychedelic liquid light show based on the theme '${prompt}'. Provide a 5-color palette and simulation parameters that match the theme.
- density: How thick the fluid feels (0.0 to 1.0).
- velocity: How fast the fluid moves (0.0 to 1.0).
- viscosity: How much the fluid resists flowing, like syrup (0.0 to 1.0).
For example, for a "calm ocean" theme, you might use blues and greens, low velocity, and high viscosity. For a "chaotic fire" theme, use reds and oranges, high velocity, and low viscosity.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            colors: {
              type: Type.ARRAY,
              description: "An array of 5 hex color code strings.",
              items: { type: Type.STRING },
            },
            density: {
              type: Type.NUMBER,
              description: "A number between 0.0 and 1.0 for fluid density.",
            },
            velocity: {
              type: Type.NUMBER,
              description: "A number between 0.0 and 1.0 for fluid velocity.",
            },
            viscosity: {
              type: Type.NUMBER,
              description: "A number between 0.0 and 1.0 for fluid viscosity.",
            },
          },
          required: ["colors", "density", "velocity", "viscosity"],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsed = JSON.parse(jsonText);

    if (parsed.colors && parsed.density !== undefined) {
      return {
        colors: parsed.colors,
        config: {
          density: parsed.density,
          velocity: parsed.velocity,
          viscosity: parsed.viscosity,
        }
      };
    }
    
    return null;

  } catch (error) {
    console.error("Error generating vibe:", error);
    throw new Error("Failed to generate vibe from AI");
  }
}
