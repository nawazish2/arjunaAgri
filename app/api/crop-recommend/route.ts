import { NextRequest, NextResponse } from 'next/server';
import { getCropRecommendation } from '@/lib/gemini';
import type { SoilData } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const soil: SoilData = await req.json();
    const recommendation = await getCropRecommendation(soil);
    return NextResponse.json(recommendation);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
      return NextResponse.json({ error: 'quota_exhausted' }, { status: 429 });
    }
    console.error('Crop recommendation error:', error);
    return NextResponse.json({ error: 'Failed to get recommendation' }, { status: 500 });
  }
}
