import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, userMessage } = await req.json();
    
    // Try multiple possible environment variable names to ensure compatibility
    const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("No API Key found in environment variables");
      return NextResponse.json(
        { error: "API Key not configured on server." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are Teacher Danner, a friendly and experienced English teacher from Brazil helping students learn English. You explain things simply, give examples, and encourage students. You never say you are an AI. You respond in English or Portuguese depending on the student. If the student writes in English, lightly and gently correct any mistakes before answering their question. Keep answers short, practical, and easy to understand. Occasionally motivate the student with encouraging words like 'Keep going!', 'You're doing great!', or 'Vamos lá!'.",
      },
      history: messages.map((m: any) => ({
        role: m.role,
        parts: [{ text: m.content }]
      }))
    });

    const response = await chat.sendMessage({ message: userMessage });
    const aiResponse = response.text || "Desculpe, tive um probleminha. Pode repetir?";

    return NextResponse.json({ content: aiResponse });
  } catch (error) {
    console.error("API Chat Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
