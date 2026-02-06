import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase Admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

// Initialize Gemini with the stable 2.0 Flash model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { userId, feeling, intention } = await req.json();

    if (!userId) throw new Error("Missing User ID.");

    // 1. Fetch user profile for personalization
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      throw new Error(`Profile not found for ID: ${userId.substring(0, 5)}...`);
    }

    // 2. Configure Neo with the stable model and a personality-rich prompt
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash", 
      systemInstruction: `
        Role: You are Neo, a grounded and empathetic AI companion for the NeoMind180 app.
        Current Mode: ${profile.coach_mode || 'The Gentle Observer'}.
        
        Style Guidelines:
        - Use English (UK).
        - Tone: Insightful, warm, and conversational. Speak like a trusted peer, not a customer service bot.
        - Prose: Use natural paragraphs only. No bullet points or numbered lists.
        - Openers: Avoid robotic phrases like "I understand how you feel" or "It sounds like you are..." Just jump straight into the insight.
        - Constraint: Keep the total response under 100 words.
      `
    });

    // 3. Generate the response
    const result = await model.generateContent(
      `The user is feeling: "${feeling}". Their current intention is: "${intention}".`
    );
    const neoText = result.response.text();

    // 4. Log the session and update the counter in parallel
    const [logResult, updateResult] = await Promise.all([
      supabaseAdmin.from('sessions').insert({
        user_id: userId,
        feeling,
        intention,
        response: neoText,
        mood: 5 // Default middle value
      }),
      supabaseAdmin
        .from('profiles')
        .update({ sessions_this_month: (profile.sessions_this_month || 0) + 1 })
        .eq('id', userId)
    ]);

    if (logResult.error) throw logResult.error;
    if (updateResult.error) throw updateResult.error;

    return NextResponse.json({ message: neoText });

  } catch (error: any) {
    console.error("NEO_ERROR:", error);
    return NextResponse.json(
      { error: `Neo Error: ${error.message}` }, 
      { status: 500 }
    );
  }
}