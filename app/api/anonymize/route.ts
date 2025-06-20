// app/api/anonymize/route.ts
import { NextResponse } from 'next/server';
import { anonymizeCV } from '@/utils/anonymizeCV';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();
    const anonymized = anonymizeCV(text);
    return NextResponse.json({ anonymized });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Anonymization failed' }, { status: 500 });
  }
}
