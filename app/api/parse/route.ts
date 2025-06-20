// app/api/parse/route.ts
import { NextResponse } from 'next/server';
import pdf from 'pdf-parse';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as Blob;

    if (!file) {
      return NextResponse.json({ error: 'No file received' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const data = await pdf(Buffer.from(arrayBuffer));

    return NextResponse.json({ text: data.text });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Parsing failed' }, { status: 500 });
  }
}
