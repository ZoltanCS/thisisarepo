import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { siteId } = await params;

    const site = await prisma.site.findFirst({
      where: {
        id: siteId,
        workspace: {
          memberships: { some: { userId: session.user.id } },
        },
      },
      include: { pages: true },
    });

    if (!site) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (site.pages.length === 0) {
      return NextResponse.json(
        { error: "Site must have at least one page to publish" },
        { status: 400 }
      );
    }

    const updated = await prisma.site.update({
      where: { id: siteId },
      data: {
        status: "published",
        publishedAt: new Date(),
      },
    });

    const siteUrl = `/site/${updated.slug}`;

    return NextResponse.json({
      site: updated,
      url: siteUrl,
      message: "Site published successfully",
    });
  } catch (error) {
    console.error("Publish error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
