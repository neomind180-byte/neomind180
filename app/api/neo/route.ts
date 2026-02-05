import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { feeling, intention } = await req.json();

    // Verification log for Vercel
    console.log("--- NEO STATUS: CALLING GEMINI API ---");

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY is missing in Vercel settings." }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are Neo, the core intelligence of NeoMind180. Be assertive and compassionate. Provide a 180-degree shift in under 100 words."
    });

    const prompt = `User feels: ${feeling}. Intention: ${intention}. Provide the shift.`;
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ message: text });

  } catch (error: any) {
    console.error("NEO_ERROR:", error);
    return NextResponse.json(
      { error: "Neo (Gemini) is recharging. Please try again." }, 
      { status: 500 }
    );
  }
}