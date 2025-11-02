import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      service: 'BizManager API',
      database: 'connected'
    });
  } catch (error) {
    return NextResponse.json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      service: 'BizManager API',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 });
  }
}