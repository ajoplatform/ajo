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
    const { imageBase64, analysisType, context } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const zai = await getZAI();

    // Determine the prompt based on analysis type
    let prompt = '';
    switch (analysisType) {
      case 'proof_verification':
        prompt = `Analyze this payment proof image for a thrift savings platform. Extract and verify:
1. Payment reference/transaction ID (if visible)
2. Amount paid (if visible)
3. Date of payment (if visible)
4. Bank or payment service name
5. Whether this appears to be a legitimate payment proof

Expected contribution context: ${context?.expectedAmount || 'Unknown amount'} ${context?.currency || 'NGN'}

Respond in JSON format:
{
  "hasReference": boolean,
  "referenceNumber": "extracted reference or 'Not found'",
  "hasAmount": boolean,
  "extractedAmount": "extracted amount or 'Not found'",
  "hasDate": boolean,
  "paymentDate": "extracted date or 'Not found'",
  "bankName": "identified bank or 'Unknown'",
  "isLegitimate": boolean,
  "confidenceScore": number between 0-100,
  "observations": ["list of observations"],
  "recommendation": "approve" | "reject" | "manual_review"
}`;
        break;
      
      case 'document_extract':
        prompt = 'Extract all text from this document. Preserve the layout and formatting as much as possible.';
        break;
      
      case 'general':
      default:
        prompt = 'Describe this image in detail. What do you see?';
        break;
    }

    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      thinking: { type: 'disabled' }
    });

    const analysis = response.choices[0]?.message?.content || 'Could not analyze image';

    // Try to parse JSON if it's a proof verification
    if (analysisType === 'proof_verification') {
      try {
        const jsonMatch = analysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            success: true,
            analysis: parsed,
            raw: analysis
          });
        }
      } catch {
        // Return raw analysis if JSON parsing fails
      }
    }

    return NextResponse.json({
      success: true,
      analysis: analysis
    });
  } catch (error) {
    console.error('AI Vision Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze image'
    }, { status: 500 });
  }
}
