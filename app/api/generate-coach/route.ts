import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    console.log("1. Starting AI Coach Route...");

    // --- STEP 1: LOAD KEYS ---
    const apiKey = process.env.GEMINI_API_KEY;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // The "Master Key"

    // --- STEP 2: VALIDATE KEYS ---
    if (!apiKey) {
      console.error("ERROR: GEMINI_API_KEY is missing.");
      return NextResponse.json({ success: false, error: "Missing AI Key" }, { status: 500 });
    }
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("ERROR: Supabase Service Role Key is missing.");
      return NextResponse.json({ success: false, error: "Missing DB Key" }, { status: 500 });
    }

    // --- STEP 3: INITIALIZE CLIENTS ---
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Initialize Supabase (with Admin privileges to bypass RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // --- STEP 4: PARSE REQUEST ---
    const body = await request.json();
    const { feeling, intention, mood, userId } = body;
    console.log(`3. Processing request for User: ${userId}`);

    // --- STEP 5: GENERATE CONTENT ---
    console.log("4. Asking Gemini...");
    
    // Using the stable alias that appeared in your list
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    
    const prompt = `
      You are a compassionate, stoic mindset coach named "Neo".
      User Context: Mood ${mood}/10. Feeling: "${feeling}". Intention: "${intention}".
      Goal: Provide a brief, 2-sentence "Mindset Shift".
      Tone: Calm, grounded, assertive.
    `;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();
    console.log("5. Gemini Replied:", aiResponse);

    // --- STEP 6: SAVE TO DB ---
    const { error } = await supabase
      .from('checkins')
      .insert([{
        user_id: userId,
        mood_score: mood,
        feeling_text: feeling,
        intention_text: intention,
        ai_coaching: aiResponse
      }]);

    if (error) {
      console.error("Supabase Error:", error);
      throw error;
    }

    return NextResponse.json({ success: true, coaching: aiResponse });

  } catch (error: any) {
    console.error('CRITICAL ERROR in Route:', error);
    return NextResponse.json({ success: false, error: error.message || 'Unknown error' }, { status: 500 });
  }
}