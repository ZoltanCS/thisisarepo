import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { STARTER_TEMPLATES } from "../src/lib/templates/starter-templates";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Create demo user
  const passwordHash = await bcrypt.hash("password123", 12);
  const user = await prisma.user.upsert({
    where: { email: "demo@siteforge.dev" },
    update: {},
    create: {
      email: "demo@siteforge.dev",
      name: "Demo User",
      passwordHash,
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: "demo-workspace" },
    update: {},
    create: {
      id: "demo-workspace",
      name: "Demo Workspace",
      ownerId: user.id,
      memberships: {
        create: {
          userId: user.id,
          role: "owner",
        },
      },
    },
  });

  // Seed templates
  for (const template of STARTER_TEMPLATES) {
    const existing = await prisma.template.findFirst({
      where: { name: template.name },
    });
    if (!existing) {
      await prisma.template.create({
        data: {
          name: template.name,
          description: template.description,
          category: template.category,
          templateJson: {
            pages: template.pages,
          },
        },
      });
      console.log(`  Created template: ${template.name}`);
    }
  }

  // Create a demo site from the Landing Page template
  const landingTemplate = STARTER_TEMPLATES.find(
    (t) => t.name === "Landing Page"
  );
  if (landingTemplate) {
    const existingSite = await prisma.site.findFirst({
      where: { slug: "demo-site" },
    });
    if (!existingSite) {
      await prisma.site.create({
        data: {
          name: "Demo Site",
          slug: "demo-site",
          workspaceId: workspace.id,
          status: "published",
          publishedAt: new Date(),
          pages: {
            create: landingTemplate.pages.map((p, i) => ({
              title: p.title,
              slug: p.slug,
              schemaJson: p.schemaJson as any,
              sortOrder: i,
            })),
          },
        },
      });
      console.log("  Created demo site");
    }
  }

  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
