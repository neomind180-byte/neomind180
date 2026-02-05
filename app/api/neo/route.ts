import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { feeling, intention } = await req.json();

    // 1. Initialize the model (Flash is fast and free)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are Neo, the core intelligence of NeoMind180. Your tone is assertive, grounded, and deeply compassionate. Your goal is to provide a '180-degree shift' in perspective. Acknowledge the feeling, challenge the limiting belief, and provide a punchy 'Shift Statement'. Keep it under 100 words."
    });

    // 2. Generate the shift
    const prompt = `User feels: ${feeling}. User intention: ${intention}. Provide the 180-degree shift.`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ message: response });

  } catch (error: any) {
    console.error("GEMINI_API_CRASH:", error);
    return NextResponse.json(
      { error: "Neo is momentarily recharging. Please try again." }, 
      { status: 500 }
    );
  }
}