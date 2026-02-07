import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { callCerebras } from "@/lib/cerebras";
import { z } from "zod/v4";

const generateSchema = z.object({
  prompt: z.string().min(1).max(2000),
  context: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = generateSchema.parse(body);

    const messages = [];
    if (data.context) {
      messages.push({
        role: "user" as const,
        content: `Current page structure context:\n${data.context}`,
      });
      messages.push({
        role: "assistant" as const,
        content: "I understand the current page structure. What would you like me to create or modify?",
      });
    }
    messages.push({ role: "user" as const, content: data.prompt });

    const response = await callCerebras(messages);

    const content = response.choices[0]?.message?.content || "[]";

    // Try to parse as JSON to validate
    let nodes;
    try {
      nodes = JSON.parse(content);
    } catch {
      // If AI returned non-JSON, wrap in an error response
      return NextResponse.json(
        { error: "AI returned invalid JSON", raw: content },
        { status: 422 }
      );
    }

    return NextResponse.json({
      nodes,
      usage: response.usage,
    });
  } catch (error) {
    console.error("AI generate error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
