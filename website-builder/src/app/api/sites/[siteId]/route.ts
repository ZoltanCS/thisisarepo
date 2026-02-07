import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod/v4";

async function verifySiteOwnership(siteId: string, userId: string) {
  const site = await prisma.site.findFirst({
    where: {
      id: siteId,
      workspace: {
        memberships: { some: { userId } },
      },
    },
  });
  return site;
}

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
    const site = await verifySiteOwnership(siteId, session.user.id);
    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const fullSite = await prisma.site.findUnique({
      where: { id: siteId },
      include: {
        pages: { orderBy: { sortOrder: "asc" } },
        assets: { orderBy: { createdAt: "desc" } },
      },
    });

    return NextResponse.json({ site: fullSite });
  } catch (error) {
    console.error("Get site error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

const updateSiteSchema = z.object({
  name: z.string().min(1).max(100).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const site = await verifySiteOwnership(siteId, session.user.id);
    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const data = updateSiteSchema.parse(body);

    const updated = await prisma.site.update({
      where: { id: siteId },
      data,
    });

    return NextResponse.json({ site: updated });
  } catch (error) {
    console.error("Update site error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;
    const site = await verifySiteOwnership(siteId, session.user.id);
    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.site.delete({ where: { id: siteId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete site error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
