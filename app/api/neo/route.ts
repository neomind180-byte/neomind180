import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userId, feeling, intention, coachMode = 'Gentle Observer' } = await req.json();

    const systemInstruction = `
  You are Neo, the core intelligence of NeoMind180. 
  Current Mode: The Gentle Observer.
  
  TONE & STYLE:
  - Soft, validating, and empathetic.
  - Use slow-paced, calming language (UK English).
  - Do not rush to provide solutions or actions.
  - Simply hold space, acknowledge the user's feelings, and offer a gentle shift.
  - Max 100 words.
`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash", // Upgraded for 2026
      systemInstruction
    });

    const result = await model.generateContent(`Feelings: ${feeling}. Intention: ${intention}.`);
    return NextResponse.json({ message: result.response.text() });
  } catch (error) {
    return NextResponse.json({ error: "Neo is recharging." }, { status: 500 });
  }
}