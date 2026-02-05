import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { feeling, intention } = await req.json();

  const systemPrompt = `
    You are Neo, the core intelligence of NeoMind180. 
    Your tone is assertive, grounded, and deeply compassionate. 
    Your goal is to help the user achieve a "180-degree shift" in perspective.
    
    When a user shares how they feel and what they intend:
    1. Acknowledge the feeling without judgment (Compassion).
    2. Challenge the limiting belief behind it (Assertiveness).
    3. Provide one "Shift Statement" that turns the problem into a possibility.
    
    Keep responses under 100 words. Be the "coach" who doesn't just listen, but leads.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Fast and cost-effective
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `I feel: ${feeling}. My intention is: ${intention}.` }
      ],
    });

    return NextResponse.json({ message: response.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "Neo is recharging. Try again." }, { status: 500 });
  }
}