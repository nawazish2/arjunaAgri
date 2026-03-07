import { NextRequest, NextResponse } from 'next/server';
import { extractSoilReport } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const { image, mimeType } = await req.json();
    if (!image) return NextResponse.json({ error: 'Image required' }, { status: 400 });
    const result = await extractSoilReport(image, mimeType || 'image/jpeg');
    return NextResponse.json(result);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ error: 'quota_exhausted' }, { status: 429 });
    }
    console.error('Extract soil error:', error);
    return NextResponse.json({ error: 'Failed to extract soil data' }, { status: 500 });
  }
}
