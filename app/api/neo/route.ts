import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Initialize Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { userId, mood, feeling, intention } = await req.json();

    // 1. INPUT VALIDATION
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    if (!feeling || !intention) {
      return NextResponse.json(
        { error: "Please provide both feeling and intention." },
        { status: 400 }
      );
    }

    // 2. Generate the Neo Shift
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      systemInstruction: `
    You are Neo, the core intelligence of NeoMind180. 
    Your tone is assertive, grounded, and deeply compassionate. 
    
    STRICT RULES:
    1. Use English (UK) spelling and grammar (e.g., 'colour', 'realise', 'your' NOT 'yur').
    2. Provide a 180-degree shift in perspective.
    3. Keep responses under 100 words.
    4. Speak with the authority of a professional life coach.
  `
    });

    const result = await model.generateContent(`Feeling: ${feeling}. Intention: ${intention}.`);
    const neoShift = result.response.text();

    if (!neoShift) {
      return NextResponse.json(
        { error: "Neo couldn't generate a response. Please try again." },
        { status: 500 }
      );
    }

    // 3. Save to Supabase Sessions Table
    const { error } = await supabase
      .from('sessions')
      .insert([
        { 
          user_id: userId, 
          mood: mood || "default", 
          feeling, 
          intention, 
          neo_shift: neoShift,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error("SUPABASE_SAVE_ERROR:", error);
      // Still return the Neo response even if save fails
      return NextResponse.json({ message: neoShift });
    }

    return NextResponse.json({ message: neoShift });

  } catch (error: any) {
    console.error("NEO_API_ERROR:", error.message || error);
    return NextResponse.json(
      { error: "Neo is thinking deeply. Try again in a moment." }, 
      { status: 500 }
    );
  }
}