import { z } from "zod";
import { EXPRESSION_OPTIONS, LANGUAGE_OPTIONS, STYLE_OPTIONS } from "./types";

export const generateFieldsSchema = z.object({
  topic: z.string().trim().min(5, "Video konusu en az 5 karakter olmalı.").max(500, "Video konusu çok uzun."),
  audience: z.string().trim().max(120, "Hedef kitle çok uzun.").default(""),
  style: z.enum(STYLE_OPTIONS),
  expression: z.enum(EXPRESSION_OPTIONS),
  language: z.enum(LANGUAGE_OPTIONS),
});

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function validateImage(file: File) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("Fotoğraf JPG, PNG veya WebP formatında olmalı.");
  }
  if (file.size === 0 || file.size > MAX_IMAGE_BYTES) {
    throw new Error("Fotoğraf 8 MB'dan küçük olmalı.");
  }
}
