import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { articles, query } = await request.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GEMINI_API_KEY is not configured in .env" }, { status: 500 });
    }
    const prompt = `
You are SWISS KNIFE, an advanced OSINT AI assistant.
Analyze the following live global news articles and extract actionable intelligence.

Articles Data:
${JSON.stringify(articles.map((a: any) => ({ title: a.title, desc: a.description, country: a.country, source: a.source })), null, 2)}

User Request: ${query || "Provide a tactical summary of the most critical global events and potential geopolitical threats. Classify by severity."}

Respond in a highly structured, tactical, military-intel style format. Use bullet points and bold text for clarity.
Keep it concise and focus strictly on intelligence value.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 2048,
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("Gemini API error:", data);
      return NextResponse.json({ error: "Failed to generate intel report from AI." }, { status: 500 });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No actionable intelligence generated.";

    return NextResponse.json({ result: text });
  } catch (error) {
    console.error("RAG Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
