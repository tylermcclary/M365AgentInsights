import { NextRequest, NextResponse } from 'next/server';
import { initializeAIProcessingServer, getCurrentAIModeServer } from '@/services/ai-server-only';
import { AIProcessingMode } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = body;

    initializeAIProcessingServer(mode as AIProcessingMode);

    return NextResponse.json({
      success: true,
      mode: getCurrentAIModeServer()
    });

  } catch (error) {
    console.error('Failed to initialize AI processing:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to initialize AI processing',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
