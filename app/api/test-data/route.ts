import { NextResponse } from 'next/server';

export const dynamic = 'force-static';
export const revalidate = false;
import { clients, getCommunicationsByClient } from '@/data/sampleData';

export async function GET() {
  try {
    const firstClient = clients[0];
    const comms = getCommunicationsByClient(firstClient.id);
    
    return NextResponse.json({
      success: true,
      data: {
        totalClients: clients.length,
        firstClient: {
          id: firstClient.id,
          name: firstClient.name,
          email: firstClient.email
        },
        communications: {
          emails: comms.emails.length,
          events: comms.events.length,
          chats: comms.chats.length,
          firstEmail: comms.emails[0] ? {
            id: comms.emails[0].id,
            subject: comms.emails[0].subject,
            body: comms.emails[0].body.substring(0, 100) + '...'
          } : null
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
