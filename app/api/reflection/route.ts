import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, history } = await req.json();

    // 1. Simulate "AI Thinking" time for a grounded feel
    await new Promise((resolve) => setTimeout(resolve, 1800));

    // 2. Persona Logic: Grounded, Observational, Compassionate
    let response = "";
    const input = message.toLowerCase();

    if (input.includes("stress") || input.includes("overthink")) {
      response = "I notice that your 'observer' is identifying a heavy pattern right now. If you were to look at this stress from 180 degrees away, what small piece of clarity emerges?";
    } else if (input.includes("decide") || input.includes("choice")) {
      response = "Decision-making often feels heavy when we are in the 'noisy' mind state. Let's pause. What does your 'balanced' body state tell you about this choice?";
    } else {
      response = "I hear you. As we reflect on your shifts this week, I'm curious: which of the 5 phases (Breathe, Notice, Separate, Understand, Choose) felt most natural to you today?";
    }

    return NextResponse.json({
      role: 'neo',
      content: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json({ error: "Reflection interrupted" }, { status: 500 });
  }
}