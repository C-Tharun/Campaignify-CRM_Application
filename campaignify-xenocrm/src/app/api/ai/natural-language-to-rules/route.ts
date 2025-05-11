import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import axios from "axios";

// Map of country names to ISO codes
const countryCodeMap: { [key: string]: string } = {
  "UNITED STATES": "US",
  "USA": "US",
  "U.S.A.": "US",
  "U.S.": "US",
  "UNITED KINGDOM": "UK",
  "U.K.": "UK",
  "GREAT BRITAIN": "UK",
  "INDIA": "IN",
  "CANADA": "CA",
  "AUSTRALIA": "AU",
  "GERMANY": "DE",
  "FRANCE": "FR",
  "SPAIN": "ES",
  "ITALY": "IT",
  "JAPAN": "JP",
  "CHINA": "CN",
  "BRAZIL": "BR",
  "MEXICO": "MX",
  "RUSSIA": "RU",
  "SOUTH KOREA": "KR",
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
          { role: "system", content: "You are an assistant that converts natural language segment descriptions into JSON rules. Return only the JSON." },
          { role: "user", content: naturalLanguage }
        ],
        max_tokens: 256,
        temperature: 0.2
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": "http://localhost:3000", // or your deployed domain
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