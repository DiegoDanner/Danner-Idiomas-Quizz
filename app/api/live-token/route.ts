import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured on server" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const token = await ai.authTokens.create({
      config: {
        uses: 1,
        expireTime: expireTime,
        liveConnectConstraints: {
          model: 'gemini-3.1-flash-live-preview',
          config: {
            sessionResumption: {},
            responseModalities: ['AUDIO' as any]
          }
        },
      }
    });

    if (!token || !token.name) {
      return NextResponse.json({ error: "Failed to generate ephemeral token" }, { status: 500 });
    }

    return NextResponse.json({ token: token.name });
  } catch (error: any) {
    console.error("Error creating ephemeral token:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
