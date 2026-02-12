import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, Part } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        role: 'neo',
        content: "I'm pausing for a moment to find clarity. (Error: GEMINI_API_KEY is missing. Please add it to your environment variables.)"
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // 1. Initialize the model with the persona
    const model = genAI.getGenerativeModel({
      model: "models/gemini-1.5-flash",
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
    // Gemini requires the first message to be from the 'user'.
    // We slice the history to start from the first user message.
    const rawHistory = history || [];
    const firstUserIndex = rawHistory.findIndex((msg: any) => msg.role !== 'neo');

    const formattedHistory = firstUserIndex === -1
      ? []
      : rawHistory.slice(firstUserIndex).map((msg: any) => ({
        role: msg.role === 'neo' ? 'model' : 'user',
        parts: [{ text: msg.content || "" }] as Part[],
      }));

    // 3. Start chat and get response
    const chat = model.startChat({
      history: formattedHistory,
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

    // Check for common errors
    let errorMessage = error.message || "Unknown error";
    if (errorMessage.includes("403")) errorMessage = "Access Denied (Invalid API Key or Geo-restriction)";
    if (errorMessage.includes("404")) errorMessage = "Model not found";

    return NextResponse.json({
      role: 'neo',
      content: `I'm pausing for a moment to find clarity. (Error: ${errorMessage})`,
      error: error.message
    }, { status: 500 });
  }
}