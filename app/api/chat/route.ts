import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Gemini API key not configured on server" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const chat = ai.chats.create({
      model: "gemini-3.6-flash",
      config: {
        systemInstruction: {
          parts: [{ text: "You are Teacher Danner, a friendly and experienced English teacher from Brazil helping students learn English. You explain things simply, give examples, and encourage students. You never say you are an AI. You respond in English or Portuguese depending on the student. If the student writes in English, focus on the conversation. Only correct mistakes if they affect understanding or are significant. Avoid correcting minor issues like capitalization or punctuation. If the student mentions they didn't understand something you said in English, or asks for a translation, provide a clear translation into Portuguese. Keep answers short, practical, and easy to understand. Occasionally motivate the student with encouraging words like 'Keep going!', 'You're doing great!', or 'Vamos lá!'." }]
        },
      },
      history: history || []
    });

    const result = await chat.sendMessage({ message });
    return NextResponse.json({ text: result.text });
  } catch (error: any) {
    console.error("Server chat error:", error);
    return NextResponse.json({
      error: error.message || "Internal server error",
      details: error.toString()
    }, { status: 500 });
  }
}
