import type { Expression, ThumbnailConcept, ThumbnailStyle } from "./types";

const languageNames = { tr: "Turkish", de: "German", en: "English" } as const;

const styleDirections: Record<ThumbnailStyle, string> = {
  viral: "high-energy creator thumbnail, bold contrast, dramatic lighting, strong curiosity gap",
  professional: "premium documentary thumbnail, confident composition, refined lighting, credible and polished",
  educational: "clear explainer thumbnail, visual before/after or process cues, approachable and authoritative",
  technology: "futuristic technology thumbnail, cyan and orange highlights, cinematic depth, modern devices or UI motifs",
  mystery: "cinematic mystery thumbnail, controlled darkness, red highlights, suspense and unanswered-question energy",
};

const expressionDirections: Record<Expression, string> = {
  natural: "natural confident facial expression",
  excited: "genuinely excited facial expression, energetic but believable",
  surprised: "surprised facial expression, wide eyes, authentic reaction",
  serious: "serious focused facial expression, confident eye contact",
};

export function buildConceptInput(params: {
  topic: string;
  audience: string;
  language: keyof typeof languageNames;
  style: ThumbnailStyle;
}) {
  return [
    `Video topic: ${params.topic}`,
    `Target audience: ${params.audience || "general YouTube audience"}`,
    `Output language: ${languageNames[params.language]}`,
    `Creative direction: ${styleDirections[params.style]}`,
    "Create exactly three substantially different thumbnail concepts. Titles must be short, natural, specific, and click-worthy without making false promises. Use at most 6 words in each thumbnail title. Never use quotation marks. Each scene description must reserve a clean high-contrast area for title overlay and must not request any text inside the AI-generated scene.",
  ].join("\n");
}

export function buildImagePrompt(
  concept: ThumbnailConcept,
  params: { topic: string; style: ThumbnailStyle; expression: Expression; variant: number },
) {
  const titleSafeArea = concept.composition === "subject-left"
    ? "Reserve the right half as a dark or softly blurred title-safe area."
    : concept.composition === "subject-right"
      ? "Reserve the left half as a dark or softly blurred title-safe area."
      : "Keep the presenter in the upper-middle and reserve the lower third as a dark or softly blurred title-safe band.";

  return `
Create a premium, photorealistic YouTube thumbnail scene in an exact 16:9 composition.

REFERENCE PERSON:
- The uploaded photo is the identity reference for the main presenter.
- Preserve the person's recognizable facial identity, age, skin tone, hair, facial hair and key features with high fidelity.
- Show one person only. No duplicate face, no extra fingers, no distorted hands.
- Expression: ${expressionDirections[params.expression]}.

VIDEO CONTEXT:
- Topic: ${params.topic}
- Visual concept: ${concept.scene}
- Style: ${styleDirections[params.style]}
- Composition: ${concept.composition}
- Accent color: ${concept.accentColor}
- Variant number: ${params.variant}; make it clearly different from the other variants.

LAYOUT RULES:
- Strong foreground/background separation and cinematic creator lighting.
- Main face must be large, sharp, emotionally readable and never cropped through the eyes or mouth.
- ${titleSafeArea}
- Keep all important content inside a 5% safe margin.
- Do not generate any letters, words, logos, watermarks, captions, UI text or typographic symbols. The application adds accurate title text later.
`.trim();
}
