import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      throw new Error("Gemini API key is not configured.");
    }

    // 1. Initialize the model with the persona
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `
        You are "Neo", a grounded and compassionate AI guide for NeoMind180.
        Your goal is to help users reflect on their internal state and achieve a "180-degree shift" in their perspective.
        
        FRAMEWORK:
        - Rethink: Observe the current thought pattern.
        - Rewire: Find a new perspective or a "shift".
        - Renew: Integrate this as a new habit or state of being.
        
        Pillars of Observation:
        - Mind: Current thoughts and mental noise.
        - Body: Physical sensations and tension.
        - Energy: Vitality and presence levels.
        
        STYLE:
        - Be concise, calm, and observational.
        - Avoid flowery language or generic optimism.
        - Use "I notice..." or "I'm curious..." rather than prescriptive advice.
        - NEVER refer to "5 phases" like (Breathe, Notice, etc.). Those are outdated.
        - Focus on the user's "Internal Climate" and "Clarity".
        
        If the user shares a check-in or a struggle, ask a gentle question that helps them move from the Mind to the Body, or helps them find the '180' version of their current thought.
      `
    });

    // 2. Format history for Gemini
    // Gemini expectation: Array of { role: "user" | "model", parts: [{ text: string }] }
    const chatHistory = history.map((msg: any) => ({
      role: msg.role === 'neo' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    // 3. Start chat and get response
    const chat = model.startChat({
      history: chatHistory,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response.text();

    return NextResponse.json({
      role: 'neo',
      content: response,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({
      role: 'neo',
      content: "I'm pausing for a moment to find clarity. Let's try that reflection once more.",
      error: error.message
    }, { status: 500 });
  }
}