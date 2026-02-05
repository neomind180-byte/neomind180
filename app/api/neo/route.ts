import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// 1. Initialize Supabase Admin (Required for server-side profile updates)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// 2. Initialize Gemini 3 Flash
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userId, feeling, intention } = await req.json();

    if (!userId) throw new Error("User ID is required for grounding.");

    // 3. Fetch User Profile (To determine Coach Mode & Session Limits)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('coach_mode, sessions_this_month, plan')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error("Could not locate your profile. Please ensure you are registered.");
    }

    // 4. Configure the 180° Brain
    // We use gemini-3-flash-preview for maximum 2026 speed and reasoning
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview",
      systemInstruction: `
        You are Neo, the core intelligence of NeoMind180. 
        Your purpose is to provide a 180-degree shift in perspective for the user.

        STRICT LINGUISTIC RULES:
        - Use English (UK) spelling exclusively (e.g., 'your', 'colour', 'realise', 'programme').
        - NEVER use slang or text-speak (e.g., 'yur', 'u', 'r').
        - Ensure perfect professional grammar in every sentence.
        
        COACHING PERSONA:
        - Active Mode: ${profile.coach_mode || 'The Gentle Observer'}.
        - Tone: Assertive, deeply compassionate, and grounded.
        - Structure: Acknowledge the feeling, provide the shift, and offer one grounded reflection.
        - Constraint: Keep response under 100 words.
      `,
    });

    // 5. Generation Settings (Tuned to prevent typos/hallucinations)
    const generationConfig = {
      temperature: 0.7, // High enough for insight, low enough for stability
      topP: 0.95,      // Ensures high-quality word selection
      topK: 40,
      maxOutputTokens: 300,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    // 6. Generate the Shift
    const prompt = `User Feeling: ${feeling}\nUser Intention: ${intention}`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const neoText = result.response.text().trim();

    // 7. Database Operations (Async logging)
    // We update the session count and save the history simultaneously
    await Promise.all([
      supabaseAdmin.from('sessions').insert({
        user_id: userId,
        feeling,
        intention,
        response: neoText,
        mood: 5, // Default middle mood, updated by user later
      }),
      supabaseAdmin
        .from('profiles')
        .update({ sessions_this_month: (profile.sessions_this_month || 0) + 1 })
        .eq('id', userId)
    ]);

    return NextResponse.json({ message: neoText });

  } catch (error: any) {
    console.error("NEO_SYSTEM_FAILURE:", error);
    
    // Detailed error reporting for debugging
    const errorDetail = error.message || "Unknown Connection Error";
    return NextResponse.json(
      { error: `Neo is charging. (Detail: ${errorDetail})` }, 
      { status: 500 }
    );
  }
}