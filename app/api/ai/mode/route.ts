import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;
import { getAIProcessingManagerServer, getCurrentAIModeServer, switchAIModeServer } from '@/services/ai-server-only';
import { AIProcessingMode } from '@/types';

export async function GET() {
  try {
    const currentMode = getCurrentAIModeServer();
    
    return NextResponse.json({
      success: true,
      mode: currentMode
    });

  } catch (error) {
    console.error('Failed to get current AI mode:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get current AI mode',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode } = body;

    if (!mode) {
      return NextResponse.json(
        { error: 'mode is required' },
        { status: 400 }
      );
    }

    switchAIModeServer(mode);

    return NextResponse.json({
      success: true,
      mode
    });

  } catch (error) {
    console.error('Failed to switch AI mode:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to switch AI mode',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
