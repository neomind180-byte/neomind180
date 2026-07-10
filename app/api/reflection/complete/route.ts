import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  getCompletionSystemInstruction 
} from '@/lib/ai/gemini-context';
import { runNeoBackgroundTask, parseJson } from '@/lib/ai/openrouter';

// Allow up to 60s for AI-powered session completion (Vercel Hobby supports up to 60s)
export const maxDuration = 60;

interface ChatMessage {
  role: string;
  content: string;
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    // Initialize Supabase with user's authenticated token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 401 });
    }

    const { reflectionId, history } = await req.json();

    if (!reflectionId) {
      return NextResponse.json({ error: 'Missing reflectionId parameter' }, { status: 400 });
    }

    const rawHistory: ChatMessage[] = history || [];
    if (rawHistory.length === 0) {
      return NextResponse.json({ error: 'Cannot summarize empty session' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error("Server Configuration Error: OPENROUTER_API_KEY is not set.");
      return NextResponse.json({ error: 'OpenRouter is not configured on the server.' }, { status: 500 });
    }

    // 2. Format history (filtering out any system completions or metadata)
    const cleanHistory = rawHistory.filter(msg => msg.role === 'user' || msg.role === 'neo');
    const firstUserIndex = cleanHistory.findIndex(msg => msg.role !== 'neo');

    const formattedHistory = firstUserIndex === -1
      ? []
      : cleanHistory.slice(firstUserIndex).map(msg => ({
        role: msg.role === 'neo' ? 'assistant' as const : 'user' as const,
        content: msg.content || "",
      }));

    // Construct the full messages array for standard chat completion background task
    const messages = [
      { role: 'system' as const, content: getCompletionSystemInstruction() },
      ...formattedHistory,
      { role: 'user' as const, content: "Please perform the session analysis now and return the structured JSON containing 'summary' and 'checkInQuestions'." }
    ];

    // 3. Request structured JSON summary from OpenRouter using Flash-lite
    const responseText = await runNeoBackgroundTask(messages);
    const parsedData = parseJson(responseText);

    // 4. Retrieve current session messages from Supabase to preserve concurrent updates
    const { data: refData, error: refError } = await supabase
      .from('reflections')
      .select('messages')
      .eq('id', reflectionId)
      .single();

    if (refError || !refData) {
      return NextResponse.json({ error: 'Session not found in database' }, { status: 404 });
    }

    // 5. Append completion metadata to messages array
    const currentMessages = refData.messages || [];
    
    // Check if there is already a completion metadata block in the messages, if so, update or overwrite it
    const cleanCurrentMessages = currentMessages.filter((m: ChatMessage) => m.role !== 'session_completion');

    const completionMeta = {
      role: 'session_completion',
      content: 'Session Completed',
      summary: parsedData.summary,
      checkInQuestions: parsedData.checkInQuestions,
      timestamp: new Date().toISOString()
    };

    const finalMessages = [...cleanCurrentMessages, completionMeta];

    // 6. Save updated messages array back to Supabase
    const { error: updateError } = await supabase
      .from('reflections')
      .update({
        messages: finalMessages,
        last_message: "Session Completed"
      })
      .eq('id', reflectionId);

    if (updateError) {
      console.error('Error updating reflection completion:', updateError);
      return NextResponse.json({ error: 'Failed to update session completion in database' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      summary: parsedData.summary,
      checkInQuestions: parsedData.checkInQuestions,
      timestamp: completionMeta.timestamp
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error("Session Completion Endpoint Error:", err);
    return NextResponse.json({ 
      error: 'Failed to complete session analysis due to a server-side error.', 
      message: 'A temporary issue occurred while processing your request.' 
    }, { status: 500 });
  }
}
