import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { AIService } from "@/lib/services/aiService";
import { authOptions } from "@/lib/auth";

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

    const rules = await AIService.naturalLanguageToRules(naturalLanguage);
    return NextResponse.json(rules);
  } catch (error) {
    console.error("[AI_NATURAL_LANGUAGE_TO_RULES]", error);
    return NextResponse.json(
      { error: "Failed to convert natural language to rules" },
      { status: 500 }
    );
  }
} 