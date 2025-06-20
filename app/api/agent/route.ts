// app/api/agent/route.ts
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
    const { currentCV, userInstructions } = await request.json();

    // Instruct the AI to output only JSON.
    // However, if it returns a plain string, we will handle that.
    const systemPrompt = `
                            You are a CV refinement agent.
                            The user has provided a CV and instructions for modifications.

                            User Instructions: "${userInstructions}"

                            The current CV is:
                            """
                            ${currentCV}
                            """

                            Please output up to 5 suggestions as a JSON array. Each suggestion should be an object with exactly two properties:
                              - "summary": a short description of the change.
                              - "modifiedCV": the full updated CV text after applying the change.

                            Output only the JSON array (nothing else). For example:
                            [
                              {
                                "summary": "Removed work history section",
                                "modifiedCV": "<p>New CV content without work history</p>"
                              },
                              {
                                "summary": "Renamed 'Work History' to 'Experience'",
                                "modifiedCV": "<p>New CV content with 'Experience' section</p>"
                              }
                            ]
                          `;

    const response = await openai.createChatCompletion({
      model: "gpt-4o-mini", // adjust as needed
      messages: [{ role: "system", content: systemPrompt }],
      temperature: 0.7,
    });

    const aiContent = response.data.choices[0].message?.content || "";
    
    let suggestions;
    try {
      // First, try to extract a JSON array using a regular expression
      const jsonMatch = aiContent.match(/\[.*\]/s);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      } else {
        // If no JSON array is found, try parsing the whole content
        suggestions = JSON.parse(aiContent);
      }
    } catch (error) {
      console.error("Error parsing suggestions:", error);
      // Fallback: If parsing fails, assume the returned string is a plain suggestion.
      suggestions = [
        { 
          summary: "Single suggestion from plain text", 
          modifiedCV: aiContent 
        }
      ];
    }
    
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Agentic AI failed" }, { status: 500 });
  }
}
