import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use Service Role Key for secure server-side writing
);

export async function POST(req: Request) {
  try {
    const { userId, mood, feeling, intention } = await req.json();

    // 1. Generate the Neo Shift
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are Neo, the core intelligence of NeoMind180. Provide a 180-degree shift in under 100 words."
    });

    const result = await model.generateContent(`Feeling: ${feeling}. Intention: ${intention}.`);
    const neoShift = result.response.text();

    // 2. Save to Supabase Sessions Table
    const { error } = await supabase
      .from('sessions')
      .insert([
        { user_id: userId, mood, feeling, intention, neo_shift: neoShift }
      ]);

    if (error) throw error;

    return NextResponse.json({ message: neoShift });

  } catch (error: any) {
    console.error("NEO_SAVE_ERROR:", error);
    return NextResponse.json({ error: "Neo saved the insight but hit a glitch." }, { status: 500 });
  }
}