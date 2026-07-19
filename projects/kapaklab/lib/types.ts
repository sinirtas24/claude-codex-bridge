export const STYLE_OPTIONS = ["viral", "professional", "educational", "technology", "mystery"] as const;
export const EXPRESSION_OPTIONS = ["natural", "excited", "surprised", "serious"] as const;
export const LANGUAGE_OPTIONS = ["tr", "de", "en"] as const;

export type ThumbnailStyle = (typeof STYLE_OPTIONS)[number];
export type Expression = (typeof EXPRESSION_OPTIONS)[number];
export type Language = (typeof LANGUAGE_OPTIONS)[number];

export type ThumbnailConcept = {
  title: string;
  hook: string;
  scene: string;
  accentColor: string;
  composition: "subject-left" | "subject-right" | "subject-center";
};

export type GeneratedThumbnail = {
  id: string;
  title: string;
  hook: string;
  image: string;
};

export type GenerateResponse = {
  mode: "ai" | "demo";
  thumbnails: GeneratedThumbnail[];
};
