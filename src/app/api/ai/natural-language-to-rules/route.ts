import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: Request) {
  try {
    const { naturalLanguage } = await request.json();

    if (!naturalLanguage) {
      return NextResponse.json(
        { error: "Natural language description is required" },
        { status: 400 }
      );
    }

    // Call OpenRouter API
    const orResponse = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [
          { 
            role: "system", 
            content: "You are an assistant that converts natural language segment descriptions into JSON rules for a CRM. Output a flat JSON object with keys like country, minOrders, minTotalSpent, etc. IMPORTANT: Use EXACT numbers as mentioned in the input. If someone says '$200', use 200, not 2000. Example: { \"country\": \"India\", \"minOrders\": 3, \"minTotalSpent\": 200 }. Do not use nested objects or arrays. Return only the JSON." 
          },
          { role: "user", content: naturalLanguage }
        ],
        max_tokens: 256,
        temperature: 0.2
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000",
          "X-Title": "Xeno CRM AI"
        },
      }
    );

    const output = orResponse.data.choices[0]?.message?.content || "";

    // Try to parse the output as JSON
    let rules;
    try {
      rules = typeof output === "string" ? JSON.parse(output) : output;
    } catch (e) {
      return NextResponse.json({ error: "Model did not return valid JSON" }, { status: 500 });
    }

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error in OpenRouter AI conversion:", error);
    return NextResponse.json(
      { error: "Failed to convert natural language to rules" },
      { status: 500 }
    );
  }
} 