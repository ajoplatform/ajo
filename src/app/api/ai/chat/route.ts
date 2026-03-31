import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// Store conversations in memory (use database in production)
const conversations = new Map<string, Array<{ role: string; content: string }>>();

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

const SYSTEM_PROMPT = `You are AjoBot, the AI assistant for AjoSync - a thrift savings platform (Ajo/Esusu). You are helpful, friendly, and knowledgeable about:

1. How thrift savings groups work (Ajo/Esusu traditional savings)
2. Creating and managing savings groups
3. Contribution schedules and payment processes
4. Payout rotations and positions
5. Platform features like referrals, penalties, and admin charges
6. Financial tips for better savings habits

Keep responses concise (under 150 words), helpful, and conversational. Use Nigerian Pidgin occasionally to connect with users. Always encourage good savings habits.

If users ask about technical issues, guide them to the appropriate section or action in the app.`;

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId, context } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const zai = await getZAI();

    // Get or create conversation history
    let history = conversations.get(sessionId) || [
      { role: 'assistant', content: SYSTEM_PROMPT }
    ];

    // Build context-aware prompt
    let contextPrompt = '';
    if (context) {
      contextPrompt = `\n\nCurrent user context: ${JSON.stringify(context)}`;
    }

    // Add user message
    history.push({ role: 'user', content: message + contextPrompt });

    // Get completion
    const completion = await zai.chat.completions.create({
      messages: history.map(m => ({
        role: m.role as 'assistant' | 'user',
        content: m.content
      })),
      thinking: { type: 'disabled' }
    });

    const aiResponse = completion.choices[0]?.message?.content || 'I apologize, I could not process that. Please try again.';

    // Add AI response to history
    history.push({ role: 'assistant', content: aiResponse });

    // Keep only last 20 messages to avoid token limits
    if (history.length > 20) {
      history = [history[0], ...history.slice(-19)];
    }

    // Save updated history
    conversations.set(sessionId, history);

    return NextResponse.json({
      success: true,
      response: aiResponse,
      messageCount: history.length - 1
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process message'
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  
  if (sessionId) {
    conversations.delete(sessionId);
  }
  
  return NextResponse.json({ success: true, message: 'Conversation cleared' });
}
