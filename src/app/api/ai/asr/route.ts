import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    const commandMode = formData.get('mode') as string || 'transcribe';

    if (!audioFile) {
      return NextResponse.json({ error: 'Audio file is required' }, { status: 400 });
    }

    const zai = await getZAI();

    // Convert audio to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');

    // Transcribe audio
    const response = await zai.audio.asr.create({
      file_base64: base64Audio
    });

    const transcription = response.text;

    // Process based on mode
    if (commandMode === 'command') {
      // Parse as voice command
      const command = parseVoiceCommand(transcription);
      return NextResponse.json({
        success: true,
        transcription,
        command
      });
    }

    return NextResponse.json({
      success: true,
      transcription,
      wordCount: transcription.split(/\s+/).length
    });
  } catch (error) {
    console.error('ASR Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to transcribe audio'
    }, { status: 500 });
  }
}

function parseVoiceCommand(text: string): { action: string; params: Record<string, unknown> } {
  const lowerText = text.toLowerCase();
  
  // Payment commands
  if (lowerText.includes('pay') || lowerText.includes('contribute')) {
    const amountMatch = text.match(/(\d+)/);
    return {
      action: 'pay',
      params: {
        amount: amountMatch ? parseInt(amountMatch[1]) : null,
        rawText: text
      }
    };
  }
  
  // Group commands
  if (lowerText.includes('join') && lowerText.includes('group')) {
    const codeMatch = text.match(/[A-Z]{3,}\d*/i);
    return {
      action: 'join_group',
      params: {
        code: codeMatch ? codeMatch[0].toUpperCase() : null,
        rawText: text
      }
    };
  }
  
  if (lowerText.includes('create') && lowerText.includes('group')) {
    return {
      action: 'create_group',
      params: { rawText: text }
    };
  }
  
  // Navigation commands
  if (lowerText.includes('go to') || lowerText.includes('open')) {
    if (lowerText.includes('dashboard')) {
      return { action: 'navigate', params: { page: 'dashboard' } };
    }
    if (lowerText.includes('group')) {
      return { action: 'navigate', params: { page: 'groups' } };
    }
    if (lowerText.includes('contribution')) {
      return { action: 'navigate', params: { page: 'contributions' } };
    }
    if (lowerText.includes('payout')) {
      return { action: 'navigate', params: { page: 'payouts' } };
    }
    if (lowerText.includes('setting')) {
      return { action: 'navigate', params: { page: 'settings' } };
    }
  }
  
  // Help command
  if (lowerText.includes('help') || lowerText.includes('assist')) {
    return { action: 'help', params: { rawText: text } };
  }
  
  // Balance check
  if (lowerText.includes('balance') || lowerText.includes('savings')) {
    return { action: 'check_balance', params: {} };
  }
  
  // Default: unknown command
  return {
    action: 'unknown',
    params: { rawText: text }
  };
}
