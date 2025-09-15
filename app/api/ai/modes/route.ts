import { NextResponse } from 'next/server';
import { getAvailableModes } from '@/lib/ai-config';

export const dynamic = 'force-static';
export const revalidate = false;

export async function GET() {
  try {
    const modes = getAvailableModes();
    
    return NextResponse.json({
      success: true,
      modes
    });

  } catch (error) {
    console.error('Failed to get available modes:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get available modes',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
