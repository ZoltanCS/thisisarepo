import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod/v4";

const createPageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const pages = await prisma.page.findMany({
      where: { siteId },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error("Get pages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const body = await req.json();
    const data = createPageSchema.parse(body);

    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

    const pageCount = await prisma.page.count({ where: { siteId } });

    const page = await prisma.page.create({
      data: {
        siteId,
        title: data.title,
        slug,
        schemaJson: { rootNodes: [], version: 1 },
        sortOrder: pageCount,
      },
    });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("Create page error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
