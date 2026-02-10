import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { reflection } = await req.json();

    // Simulate "Neo" observing the thought patterns
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const input = reflection.toLowerCase();
    let response = "";

    // Socratic logic for the "beEnough" shift
    if (input.includes("fail") || input.includes("mistake") || input.includes("wrong")) {
      response = "I notice your mind is focusing on the 'doing.' Let's shift to 'being.' If this mistake didn't define your worth, what would the observer say about your resilience in this moment?";
    } else if (input.includes("should") || input.includes("perfect")) {
      response = "The 'should' voice is often the loudest. What happens if we replace 'I should be' with 'I am enough as I am right now'? Notice the shift in your body energy as you say that.";
    } else {
      response = "That is a powerful observation. You are noticing the gap between expectation and reality. How does it feel to simply stand in the truth that your worth is not a performance?";
    }

    return NextResponse.json({
      role: 'neo',
      content: response
    });

  } catch (error) {
    return NextResponse.json({ error: "Reflection paused" }, { status: 500 });
  }
}