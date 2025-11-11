# AI Integration

How Google Gemini AI powers palette and vibe generation.

## Overview

This app uses **Google Gemini 2.5 Flash** to generate:
1. **Color Palettes**: 5 hex codes inspired by a text prompt
2. **Vibes**: Palette + simulation parameters (density, velocity, viscosity) tuned to a theme

## Gemini SDK Setup

### Installation
```bash
npm install @google/genai
```

### API Key
Set in `.env.local`:
```bash
GEMINI_API_KEY=your_api_key_here
```

### Initialization
```typescript
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
```

---

## Generate Color Palette

### Function: `generateColorPalette(prompt: string)`

**Purpose**: Returns 5 hex codes inspired by the user's prompt

**Implementation**:
```typescript
export async function generateColorPalette(prompt: string): Promise<string[]> {
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
  const parsed = JSON.parse(jsonText);
  return parsed.colors;  // ['#ff00ff', '#00ffff', ...]
}
```

**Example Prompts**:
- "Bioluminescent forest"
- "Sunset over a neon city"
- "Deep ocean abyss"
- "Cherry blossom storm"

**Response Example**:
```json
{
  "colors": ["#00ffaa", "#0088ff", "#4400ff", "#ff00ff", "#ff0088"]
}
```

---

## Generate Vibe

### Function: `generateVibe(prompt: string)`

**Purpose**: Returns palette + simulation parameters for a complete "vibe"

**Implementation**:
```typescript
export async function generateVibe(prompt: string): Promise<{
  colors: string[];
  config: Partial<LiquidConfig>;
} | null> {
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

  return {
    colors: parsed.colors,
    config: {
      density: parsed.density,
      velocity: parsed.velocity,
      viscosity: parsed.viscosity,
    },
  };
}
```

**Example Response**:
```json
{
  "colors": ["#ff4500", "#ff8c00", "#ffd700", "#ff6347", "#dc143c"],
  "density": 0.7,
  "velocity": 0.85,
  "viscosity": 0.15
}
```

**Interpretation**:
- **Warm colors** → Fire/energy theme
- **High velocity** → Fast, chaotic motion
- **Low viscosity** → Thin, runny fluid

---

## Error Handling

```typescript
try {
  const colors = await generateColorPalette(prompt);
  updateConfig({ colors });
  triggerToast("New palette generated!");
} catch (e) {
  console.error(e);
  triggerToast("Failed to generate palette. Please try again.", 'error');
}
```

**Common Errors**:
- **API Key Missing**: Check `.env.local`
- **Rate Limiting**: Gemini API has usage quotas
- **JSON Parse Error**: Malformed response (rare with structured output)

---

## UI Integration

### In ColorPanel Component

```tsx
<input
  type="text"
  value={prompt}
  onChange={(e) => setPrompt(e.target.value)}
  placeholder="e.g., Bioluminescent forest"
/>
<button
  onClick={() => onGeneratePalette(prompt)}
  disabled={isGenerating}
>
  {isGenerating ? 'Generating...' : 'Palette'}
</button>
<button
  onClick={() => onGenerateVibe(prompt)}
  disabled={isGenerating}
>
  {isGenerating ? 'Generating...' : 'Vibe'}
</button>
```

---

## Cost & Quotas

Gemini 2.5 Flash pricing (as of 2025):
- **Free tier**: 15 requests/minute, 1500 requests/day
- **Paid tier**: $0.000075 per 1K characters input

**Typical request**:
- Input: ~200 characters (prompt + schema)
- Output: ~100 characters (5 colors + params)
- Cost: ~$0.000015 per request (paid tier)

---

## Future Improvements

- **Caching**: Store generated palettes/vibes in localStorage
- **History**: Browse past AI-generated results
- **Variations**: "Generate similar" button
- **Batch Generation**: Generate 3–5 options at once
- **Fine-Tuning**: Train model on curated palettes

---

## Next Steps

- See [Components](./components.md) for ColorPanel details
- Read [Development](./development.md) for API key setup
- Check [Troubleshooting](./troubleshooting.md) for AI-related issues
