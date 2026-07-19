import { NextResponse } from "next/server";
import OpenAI, { toFile } from "openai";
import { fallbackConcepts } from "@/lib/concepts";
import { buildConceptInput, buildImagePrompt } from "@/lib/prompts";
import { createDemoThumbnail, finalizeThumbnail } from "@/lib/text-overlay";
import type { GenerateResponse, ThumbnailConcept } from "@/lib/types";
import { generateFieldsSchema, validateImage } from "@/lib/validation";

export const runtime = "nodejs";
export const maxDuration = 300;

const conceptSchema = {
  type: "object",
  additionalProperties: false,
  required: ["concepts"],
  properties: {
    concepts: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "hook", "scene", "accentColor", "composition"],
        properties: {
          title: { type: "string", minLength: 3, maxLength: 52 },
          hook: { type: "string", minLength: 2, maxLength: 34 },
          scene: { type: "string", minLength: 20, maxLength: 500 },
          accentColor: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$" },
          composition: { type: "string", enum: ["subject-left", "subject-right", "subject-center"] },
        },
      },
    },
  },
} as const;

async function createConcepts(openai: OpenAI, fields: ReturnType<typeof generateFieldsSchema.parse>) {
  const response = await openai.responses.create({
    model: process.env.OPENAI_TEXT_MODEL || "gpt-5.6",
    reasoning: { effort: "low" },
    store: false,
    instructions: "You are an expert YouTube packaging strategist. Return commercially strong but honest concepts. Follow the requested JSON schema exactly.",
    input: buildConceptInput(fields),
    text: {
      format: {
        type: "json_schema",
        name: "thumbnail_concepts",
        strict: true,
        schema: conceptSchema,
      },
    },
  });
  const parsed = JSON.parse(response.output_text) as { concepts: ThumbnailConcept[] };
  if (parsed.concepts.length !== 3) throw new Error("AI did not return three concepts.");
  return parsed.concepts;
}

async function generateAiThumbnail(
  openai: OpenAI,
  photoBuffer: Buffer,
  photo: File,
  concept: ThumbnailConcept,
  fields: ReturnType<typeof generateFieldsSchema.parse>,
  index: number,
) {
  const imageFile = await toFile(photoBuffer, photo.name || "portrait.jpg", { type: photo.type });
  const result = await openai.images.edit({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
    image: imageFile,
    prompt: buildImagePrompt(concept, { ...fields, variant: index + 1 }),
    size: "1280x720" as "1536x1024",
    quality: (process.env.OPENAI_IMAGE_QUALITY || "medium") as "medium",
    output_format: "jpeg",
    output_compression: 88,
    n: 1,
  });
  const base64 = result.data?.[0]?.b64_json;
  if (!base64) throw new Error(`Variant ${index + 1} did not return image data.`);
  return finalizeThumbnail(Buffer.from(base64, "base64"), concept);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const photo = formData.get("photo");
    if (!(photo instanceof File)) throw new Error("Bir fotoğraf yüklemelisin.");
    validateImage(photo);

    const fields = generateFieldsSchema.parse({
      topic: formData.get("topic"),
      audience: formData.get("audience") || "",
      style: formData.get("style"),
      expression: formData.get("expression"),
      language: formData.get("language"),
    });
    const photoBuffer = Buffer.from(await photo.arrayBuffer());
    const demoMode = !process.env.OPENAI_API_KEY && process.env.DEMO_MODE === "true";

    if (!process.env.OPENAI_API_KEY && !demoMode) {
      return NextResponse.json({ error: "OPENAI_API_KEY ayarlanmamış. .env.example dosyasındaki kurulumu tamamla." }, { status: 503 });
    }

    const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
    const concepts = openai ? await createConcepts(openai, fields) : fallbackConcepts(fields.topic, fields.language);

    const images = openai
      ? await Promise.all(concepts.map((concept, index) => generateAiThumbnail(openai, photoBuffer, photo, concept, fields, index)))
      : await Promise.all(concepts.map((concept, index) => createDemoThumbnail(photoBuffer, concept, index)));

    const payload: GenerateResponse = {
      mode: openai ? "ai" : "demo",
      thumbnails: images.map((image, index) => ({
        id: crypto.randomUUID(),
        title: concepts[index].title,
        hook: concepts[index].hook,
        image: `data:image/jpeg;base64,${image.toString("base64")}`,
      })),
    };
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Thumbnail generation failed", error);
    const message = error instanceof Error ? error.message : "Kapaklar oluşturulamadı.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
