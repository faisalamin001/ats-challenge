// app/api/reformat/route.ts
import { NextResponse } from "next/server";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
  baseOptions: {
    timeout: 60000, // Set timeout to 60 seconds (60000 milliseconds)
  },
});
const openai = new OpenAIApi(configuration);

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    const systemPrompt = `
You are a professional CV formatter.
Given the following anonymized CV, produce a polished, well-structured, and visually appealing formatted CV in HTML.

Requirements:
- Include a header with the candidate's name and location. Preserve the location exactly as given.
- Clearly define sections such as "Summary", "Key Skills", "Electrical Skills", "Work History" (or "Experience"), and "References".
- Use bullet points or HTML lists for any list items.
- Retain any placeholders (like "[Phone Removed]") if present.
- Use modern design elements: add ample padding, spacing between sections, color accents (e.g. for headings), and rounded borders.
- Use inline styles for styling.
- Return only the inner HTML (do not include <html>, <head>, or <body> tags).

Anonymized CV:
${text}
    `;

    const response = await openai.createChatCompletion({
      model: "gpt-4o-mini", // adjust if needed
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
    });

    let formattedCV = response.data.choices[0].message?.content?.trim() || "";

    // Remove Markdown code fences if present.
    if (formattedCV.startsWith("```")) {
      formattedCV = formattedCV
        .replace(/^```(?:html)?\n/, '')
        .replace(/\n```$/, '');
    }

    // If a full HTML document is returned, extract only the inner content.
    if (formattedCV.includes("<html")) {
      const bodyMatch = formattedCV.match(/<body[^>]*>([\s\S]*)<\/body>/i);
      if (bodyMatch && bodyMatch[1]) {
        formattedCV = bodyMatch[1].trim();
      }
    }

    return NextResponse.json({ formatted: formattedCV });
  } catch (error) {
    console.error("Error in reformat API:", error);
    return NextResponse.json({ error: 'Reformatting failed' }, { status: 500 });
  }
}
