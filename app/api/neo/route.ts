import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize the Service Role client (Safe for server-side routes)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userId, feeling, intention } = await req.json();

    if (!userId) throw new Error("Missing User ID.");

    // 1. Check if the profile exists
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found in database for ID: ${userId.substring(0, 5)}...`);
    }

    // 2. Setup Neo with the correct 2026 model ID
    // We use gemini-3-flash-preview as the primary 2026 standard
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3-flash-preview", 
      systemInstruction: `
        You are Neo. Mode: ${profile.coach_mode || 'The Gentle Observer'}. 
        Use English (UK). Max 100 words.
      `
    });

    const result = await model.generateContent(`Feelings: ${feeling}. Intention: ${intention}.`);
    const neoText = result.response.text();

    // 3. Log the session for the user's history
    await supabaseAdmin.from('sessions').insert({
      user_id: userId,
      feeling,
      intention,
      response: neoText,
      mood: 5 // Default middle mood
    });

    // 4. Update the session counter
    await supabaseAdmin
      .from('profiles')
      .update({ sessions_this_month: (profile.sessions_this_month || 0) + 1 })
      .eq('id', userId);

    return NextResponse.json({ message: neoText });

  } catch (error: any) {
    console.error("NEO_ERROR:", error);
    // Return the SPECIFIC error detail so you can see it on mobile
    return NextResponse.json(
      { error: `Neo Error: ${error.message}` }, 
      { status: 500 }
    );
  }
}