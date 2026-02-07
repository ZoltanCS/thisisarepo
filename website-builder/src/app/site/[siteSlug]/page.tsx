import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";
import PublishedPageClient from "./PublishedPageClient";

interface Props {
  params: Promise<{ siteSlug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug } = await params;
  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
    include: { pages: { where: { slug: "index" } } },
  });

  if (!site || site.status !== "published") return {};

  const page = site.pages[0];
  return {
    title: page?.seoTitle || page?.title || site.name,
    description: page?.seoDescription || `${site.name} - Built with SiteForge`,
  };
}

export default async function PublishedSitePage({ params }: Props) {
  const { siteSlug } = await params;

  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
    include: {
      pages: { where: { slug: "index" } },
    },
  });

  if (!site || site.status !== "published") {
    notFound();
  }

  const page = site.pages[0];
  if (!page) {
    notFound();
  }

  const schema = page.schemaJson as { rootNodes: unknown[] };
  return <PublishedPageClient schema={schema} />;
}
