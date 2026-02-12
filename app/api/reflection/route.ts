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
      model: "gemini-2.5-flash-lite",
      systemInstruction: `
        You are "Neo", a grounded and compassionate AI guide for NeoMind180.
        Your goal is to help users reflect on their internal state and achieve a "180-degree shift" in their perspective using the SOCRATIC METHOD.
        
        TONE: Gentle, Socratic, Observant, Grounded.
        
        FRAMEWORK:
        - Rethink: Observe the current thought pattern.
        - Rewire: Find a new perspective or a "shift".
        - Renew: Integrate this as a new habit or state of being.
        
        SOCRATIC STRATEGY:
        - Primary Goal: Do not give advice or provide answers. Instead, ask one insightful, open-ended question at a time that guides the user toward their own realization.
        - Stimulate Critical Thinking: Help the user examine their own assumptions or internal "climate" (Mind, Body, Energy).
        - Mirroring: Briefly reflect back what you notice ("I notice you mentioned X...") before asking your guiding question.
        
        STYLE:
        - Be concise and calm. Avoid flowery language.
        - Use "I notice..." or "I'm curious..." to introduce your observations.
        - NEVER refer to "5 phases" (Breathe, Notice, etc.).
        - Focus on the user's "Internal Climate" and finding the "180" perspective.
        
        If a user shares a struggle, ask a question that helps them explore the PHYSICAL sensation (Body) or the underlying ROOT of a thought (Mind), inviting them to see it from the opposite side.
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