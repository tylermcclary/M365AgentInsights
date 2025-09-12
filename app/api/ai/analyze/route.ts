import { NextRequest, NextResponse } from 'next/server';
import { analyzeClientCommunicationsServer } from '@/services/ai-server-only';
import { AIProcessingMode } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientEmail, communications, mode } = body;

    if (!clientEmail || !communications) {
      return NextResponse.json(
        { error: 'clientEmail and communications are required' },
        { status: 400 }
      );
    }

    // Get the current AI mode from the request or use default
    const aiMode = mode || 'mock';
    
    // Analyze communications using the AI processing system with the specified mode
    const insights = await analyzeClientCommunicationsServer(clientEmail, communications, aiMode);

    return NextResponse.json({
      success: true,
      insights
    });

  } catch (error) {
    console.error('AI analysis error:', error);
    
    return NextResponse.json(
      { 
        error: 'AI analysis failed', 
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
