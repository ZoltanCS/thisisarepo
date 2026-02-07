import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import type { Metadata } from "next";
import PublishedPageClient from "../PublishedPageClient";

interface Props {
  params: Promise<{ siteSlug: string; pageSlug: string[] }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteSlug, pageSlug } = await params;
  const slug = pageSlug.join("/");
  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
    include: { pages: { where: { slug } } },
  });

  if (!site || site.status !== "published") return {};

  const page = site.pages[0];
  return {
    title: page?.seoTitle || page?.title || site.name,
    description: page?.seoDescription || `${site.name} - Built with SiteForge`,
  };
}

export default async function PublishedSubPage({ params }: Props) {
  const { siteSlug, pageSlug } = await params;
  const slug = pageSlug.join("/");

  const site = await prisma.site.findUnique({
    where: { slug: siteSlug },
    include: { pages: { where: { slug } } },
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
