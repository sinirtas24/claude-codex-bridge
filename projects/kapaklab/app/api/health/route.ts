import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const configured = Boolean(process.env.OPENAI_API_KEY);
  return NextResponse.json({
    ok: true,
    mode: configured ? "ai" : process.env.DEMO_MODE === "true" ? "demo" : "unconfigured",
    textModel: process.env.OPENAI_TEXT_MODEL || "gpt-5.6",
    imageModel: process.env.OPENAI_IMAGE_MODEL || "gpt-image-2",
  });
}
