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
    const { userData, groups, contributions } = await req.json();

    const zai = await getZAI();

    const prompt = `You are a financial advisor AI for AjoSync, a thrift savings platform. Analyze the user's financial data and provide personalized insights.

User Data:
${JSON.stringify(userData, null, 2)}

Groups:
${JSON.stringify(groups, null, 2)}

Contributions:
${JSON.stringify(contributions, null, 2)}

Provide a JSON response with the following structure:
{
  "savingsHealth": {
    "score": number (0-100),
    "status": "excellent" | "good" | "fair" | "needs_attention",
    "summary": "brief summary"
  },
  "insights": [
    {
      "type": "positive" | "warning" | "tip",
      "title": "insight title",
      "message": "detailed message",
      "actionable": boolean
    }
  ],
  "predictions": {
    "nextMonthSavings": number,
    "yearEndProjection": number,
    "payoutReadiness": "on_track" | "behind" | "ahead"
  },
  "recommendations": [
    {
      "priority": "high" | "medium" | "low",
      "title": "recommendation title",
      "description": "detailed description"
    }
  ],
  "motivationalMessage": "an encouraging message based on their progress"
}`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'assistant', content: 'You are a financial advisor AI. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      thinking: { type: 'disabled' }
    });

    const response = completion.choices[0]?.message?.content || '{}';

    // Parse the JSON response
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]);
        return NextResponse.json({
          success: true,
          insights
        });
      }
    } catch (e) {
      console.error('Failed to parse insights JSON:', e);
    }

    return NextResponse.json({
      success: true,
      insights: {
        savingsHealth: { score: 70, status: 'good', summary: 'Your savings habits are progressing well.' },
        insights: [],
        predictions: { nextMonthSavings: 0, yearEndProjection: 0, payoutReadiness: 'on_track' },
        recommendations: [],
        motivationalMessage: 'Keep up the great work with your savings journey!'
      }
    });
  } catch (error) {
    console.error('AI Insights Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate insights'
    }, { status: 500 });
  }
}
