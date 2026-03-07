import { NextRequest, NextResponse } from 'next/server';
import { getVoiceChatResponse } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { message, context } = await req.json();
    const query = message || '';
    if (!query) return NextResponse.json({ error: 'Message required' }, { status: 400 });
    const response = await getVoiceChatResponse(query, context);
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Voice chat error:', error);
    return NextResponse.json({ error: 'Failed to get answer' }, { status: 500 });
  }
}
