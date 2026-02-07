import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ siteSlug: string }> }
) {
  const { siteSlug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
    include: { pages: true },
  });

  if (!site || site.status !== "published") {
    return new NextResponse("Not found", { status: 404 });
  }

  const baseUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/site/${site.slug}`;

  const urls = site.pages.map((page) => {
    const loc = page.slug === "index" ? baseUrl : `${baseUrl}/${page.slug}`;
    return `  <url>
    <loc>${loc}</loc>
    <lastmod>${page.updatedAt.toISOString()}</lastmod>
  </url>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
