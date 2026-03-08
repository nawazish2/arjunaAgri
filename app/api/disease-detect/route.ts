import { NextRequest, NextResponse } from 'next/server';
import { detectDisease } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();
    if (!image) return NextResponse.json({ error: 'Image required' }, { status: 400 });
    const result = await detectDisease(image, mimeType || 'image/jpeg');
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ error: 'quota_exhausted' }, { status: 429 });
    }
    console.error('Disease detect error:', error);
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 });
  }
}
