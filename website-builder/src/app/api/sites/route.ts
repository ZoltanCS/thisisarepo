import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod/v4";

const createSiteSchema = z.object({
  name: z.string().min(1).max(100),
  templateId: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        memberships: { some: { userId: session.user.id } },
      },
      include: {
        sites: {
          include: { pages: { select: { id: true, title: true, slug: true } } },
          orderBy: { updatedAt: "desc" },
        },
      },
    });

    const sites = workspaces.flatMap((w) => w.sites);
    return NextResponse.json({ sites });
  } catch (error) {
    console.error("Get sites error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createSiteSchema.parse(body);

    const workspace = await prisma.workspace.findFirst({
      where: { ownerId: session.user.id },
    });
    if (!workspace) {
      return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    }

    // Generate slug from name
    const baseSlug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.site.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    let templatePages: { title: string; slug: string; schemaJson: unknown }[] = [];
    if (data.templateId) {
      const template = await prisma.template.findUnique({
        where: { id: data.templateId },
      });
      if (template?.templateJson) {
        const tmpl = template.templateJson as { pages?: { title: string; slug: string; schemaJson: unknown }[] };
        templatePages = tmpl.pages || [];
      }
    }

    const site = await prisma.site.create({
      data: {
        name: data.name,
        slug,
        workspaceId: workspace.id,
        pages: {
          create:
            templatePages.length > 0
              ? templatePages.map((p, i) => ({
                  title: p.title,
                  slug: p.slug,
                  schemaJson: p.schemaJson as any,
                  sortOrder: i,
                }))
              : [
                  {
                    title: "Home",
                    slug: "index",
                    schemaJson: { rootNodes: [], version: 1 },
                    sortOrder: 0,
                  },
                ],
        },
      },
      include: { pages: true },
    });

    return NextResponse.json({ site }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }
    console.error("Create site error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
