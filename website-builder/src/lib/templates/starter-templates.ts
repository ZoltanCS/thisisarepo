import type { EditorNode } from "@/lib/schema/node";

interface TemplateDefinition {
  name: string;
  description: string;
  category: string;
  pages: {
    title: string;
    slug: string;
    schemaJson: { rootNodes: EditorNode[]; version: number };
  }[];
}

function node(
  type: string,
  props: Record<string, unknown>,
  styles: Record<string, Record<string, string>>,
  children: EditorNode[] = []
): EditorNode {
  return {
    id: `tpl-${Math.random().toString(36).slice(2, 10)}`,
    type: type as EditorNode["type"],
    props,
    styles,
    children,
  };
}

const heroSection = (
  title: string,
  subtitle: string,
  ctaText: string,
  bgColor: string
): EditorNode =>
  node("section", {}, { base: { padding: "80px 24px", backgroundColor: bgColor, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" } }, [
    node("heading", { text: title, level: 1 }, { base: { fontSize: "48px", fontWeight: "800", marginBottom: "16px", color: "#111827" }, sm: { fontSize: "32px" } }),
    node("text", { text: subtitle }, { base: { fontSize: "20px", lineHeight: "1.6", color: "#4b5563", maxWidth: "600px", marginBottom: "32px" }, sm: { fontSize: "16px" } }),
    node("button", { text: ctaText, href: "#" }, { base: { padding: "14px 32px", backgroundColor: "#2563eb", color: "#ffffff", borderRadius: "8px", fontSize: "18px", fontWeight: "600" } }),
  ]);

const featuresSection = (features: { title: string; desc: string }[]): EditorNode =>
  node("section", {}, { base: { padding: "64px 24px", backgroundColor: "#ffffff", display: "flex", flexDirection: "column", alignItems: "center" } }, [
    node("heading", { text: "Features", level: 2 }, { base: { fontSize: "36px", fontWeight: "700", marginBottom: "48px", textAlign: "center" } }),
    node("grid", { columns: 3 }, { base: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", maxWidth: "1000px", width: "100%" }, sm: { gridTemplateColumns: "1fr" } },
      features.map((f) =>
        node("container", {}, { base: { padding: "24px", textAlign: "center" } }, [
          node("heading", { text: f.title, level: 3 }, { base: { fontSize: "20px", fontWeight: "600", marginBottom: "8px" } }),
          node("text", { text: f.desc }, { base: { fontSize: "15px", lineHeight: "1.6", color: "#6b7280" } }),
        ])
      )
    ),
  ]);

const standardNavbar: EditorNode = node(
  "navbar",
  { logoText: "MySite", navLinks: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] },
  { base: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", backgroundColor: "#ffffff", width: "100%" } }
);

const standardFooter: EditorNode = node(
  "footer",
  { copyrightText: "© 2025 MySite. All rights reserved.", footerLinks: [{ label: "Privacy", href: "/privacy" }, { label: "Terms", href: "/terms" }] },
  { base: { padding: "32px 24px", backgroundColor: "#111827", color: "#d1d5db", textAlign: "center", width: "100%" } }
);

export const STARTER_TEMPLATES: TemplateDefinition[] = [
  {
    name: "Blank",
    description: "Start from scratch with an empty page",
    category: "general",
    pages: [{ title: "Home", slug: "index", schemaJson: { rootNodes: [], version: 1 } }],
  },
  {
    name: "Landing Page",
    description: "Modern landing page with hero, features, and CTA",
    category: "marketing",
    pages: [
      {
        title: "Home",
        slug: "index",
        schemaJson: {
          rootNodes: [
            standardNavbar,
            heroSection("Build Something Amazing", "The all-in-one platform to launch your next big idea. Fast, beautiful, and effortless.", "Get Started Free", "#f0f9ff"),
            featuresSection([
              { title: "Lightning Fast", desc: "Optimized performance that loads in milliseconds." },
              { title: "Beautiful Design", desc: "Pixel-perfect templates crafted by top designers." },
              { title: "Easy to Use", desc: "No coding required. Drag, drop, and publish." },
            ]),
            node("section", {}, { base: { padding: "64px 24px", backgroundColor: "#2563eb", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" } }, [
              node("heading", { text: "Ready to get started?", level: 2 }, { base: { fontSize: "36px", fontWeight: "700", color: "#ffffff", marginBottom: "16px" } }),
              node("text", { text: "Join thousands of creators building with our platform." }, { base: { fontSize: "18px", color: "#dbeafe", marginBottom: "32px" } }),
              node("button", { text: "Start Building", href: "#" }, { base: { padding: "14px 32px", backgroundColor: "#ffffff", color: "#2563eb", borderRadius: "8px", fontSize: "18px", fontWeight: "600" } }),
            ]),
            standardFooter,
          ],
          version: 1,
        },
      },
    ],
  },
  {
    name: "Portfolio",
    description: "Showcase your work with a clean portfolio layout",
    category: "portfolio",
    pages: [
      {
        title: "Home",
        slug: "index",
        schemaJson: {
          rootNodes: [
            standardNavbar,
            node("section", {}, { base: { padding: "80px 24px", backgroundColor: "#fafafa", display: "flex", flexDirection: "column", alignItems: "center" } }, [
              node("heading", { text: "Jane Designer", level: 1 }, { base: { fontSize: "48px", fontWeight: "800", marginBottom: "8px" }, sm: { fontSize: "32px" } }),
              node("text", { text: "UI/UX Designer & Creative Director" }, { base: { fontSize: "20px", color: "#6b7280", marginBottom: "32px" } }),
            ]),
            node("section", {}, { base: { padding: "48px 24px", display: "flex", flexDirection: "column", alignItems: "center" } }, [
              node("heading", { text: "Selected Work", level: 2 }, { base: { fontSize: "32px", fontWeight: "700", marginBottom: "32px" } }),
              node("grid", { columns: 2 }, { base: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "24px", maxWidth: "900px", width: "100%" }, sm: { gridTemplateColumns: "1fr" } }, [
                node("image", { src: "https://placehold.co/600x400/e2e8f0/475569?text=Project+1", alt: "Project 1" }, { base: { width: "100%", borderRadius: "12px" } }),
                node("image", { src: "https://placehold.co/600x400/dbeafe/1e40af?text=Project+2", alt: "Project 2" }, { base: { width: "100%", borderRadius: "12px" } }),
                node("image", { src: "https://placehold.co/600x400/fef3c7/92400e?text=Project+3", alt: "Project 3" }, { base: { width: "100%", borderRadius: "12px" } }),
                node("image", { src: "https://placehold.co/600x400/d1fae5/065f46?text=Project+4", alt: "Project 4" }, { base: { width: "100%", borderRadius: "12px" } }),
              ]),
            ]),
            standardFooter,
          ],
          version: 1,
        },
      },
    ],
  },
  {
    name: "Business",
    description: "Professional business website with services and about sections",
    category: "business",
    pages: [
      {
        title: "Home",
        slug: "index",
        schemaJson: {
          rootNodes: [
            node("navbar", { logoText: "Acme Corp", navLinks: [{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: "About", href: "/about" }, { label: "Contact", href: "/contact" }] }, { base: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", backgroundColor: "#ffffff", width: "100%" } }),
            heroSection("Growing Businesses Since 2010", "We provide tailored solutions to help your business thrive in the digital age.", "Learn More", "#f8fafc"),
            featuresSection([
              { title: "Strategy", desc: "Data-driven strategies that deliver measurable results." },
              { title: "Design", desc: "Beautiful, functional designs that convert visitors into customers." },
              { title: "Growth", desc: "Scalable solutions that grow alongside your business." },
            ]),
            node("section", {}, { base: { padding: "64px 24px", backgroundColor: "#f9fafb", display: "flex", flexDirection: "column", alignItems: "center" } }, [
              node("heading", { text: "About Us", level: 2 }, { base: { fontSize: "36px", fontWeight: "700", marginBottom: "24px" } }),
              node("text", { text: "Acme Corp has been at the forefront of digital innovation for over a decade. Our team of experts combines creativity with technical excellence to deliver solutions that make a real difference." }, { base: { fontSize: "18px", lineHeight: "1.8", color: "#4b5563", maxWidth: "700px", textAlign: "center" } }),
            ]),
            standardFooter,
          ],
          version: 1,
        },
      },
    ],
  },
  {
    name: "Restaurant",
    description: "Restaurant or cafe website with menu highlights",
    category: "food",
    pages: [
      {
        title: "Home",
        slug: "index",
        schemaJson: {
          rootNodes: [
            node("navbar", { logoText: "The Kitchen", navLinks: [{ label: "Menu", href: "/menu" }, { label: "About", href: "/about" }, { label: "Reserve", href: "/reserve" }] }, { base: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", backgroundColor: "#1c1917", color: "#ffffff", width: "100%" } }),
            node("section", {}, { base: { padding: "100px 24px", backgroundColor: "#292524", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" } }, [
              node("heading", { text: "The Kitchen", level: 1 }, { base: { fontSize: "56px", fontWeight: "800", color: "#fbbf24", marginBottom: "16px", fontFamily: "Georgia, serif" }, sm: { fontSize: "36px" } }),
              node("text", { text: "Farm-to-table dining in the heart of the city" }, { base: { fontSize: "20px", color: "#d6d3d1", marginBottom: "32px" } }),
              node("button", { text: "Reserve a Table", href: "#" }, { base: { padding: "14px 32px", backgroundColor: "#fbbf24", color: "#1c1917", borderRadius: "4px", fontSize: "16px", fontWeight: "700" } }),
            ]),
            node("section", {}, { base: { padding: "64px 24px", backgroundColor: "#fafaf9", display: "flex", flexDirection: "column", alignItems: "center" } }, [
              node("heading", { text: "Today's Specials", level: 2 }, { base: { fontSize: "32px", fontWeight: "700", marginBottom: "40px" } }),
              node("grid", { columns: 3 }, { base: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", maxWidth: "1000px", width: "100%" }, sm: { gridTemplateColumns: "1fr" } }, [
                node("container", {}, { base: { textAlign: "center", padding: "16px" } }, [
                  node("image", { src: "https://placehold.co/400x300/fef3c7/92400e?text=Dish+1", alt: "Truffle Risotto" }, { base: { width: "100%", borderRadius: "8px", marginBottom: "12px" } }),
                  node("heading", { text: "Truffle Risotto", level: 3 }, { base: { fontSize: "18px", fontWeight: "600" } }),
                  node("text", { text: "$28" }, { base: { fontSize: "16px", color: "#a16207" } }),
                ]),
                node("container", {}, { base: { textAlign: "center", padding: "16px" } }, [
                  node("image", { src: "https://placehold.co/400x300/fef3c7/92400e?text=Dish+2", alt: "Grilled Salmon" }, { base: { width: "100%", borderRadius: "8px", marginBottom: "12px" } }),
                  node("heading", { text: "Grilled Salmon", level: 3 }, { base: { fontSize: "18px", fontWeight: "600" } }),
                  node("text", { text: "$32" }, { base: { fontSize: "16px", color: "#a16207" } }),
                ]),
                node("container", {}, { base: { textAlign: "center", padding: "16px" } }, [
                  node("image", { src: "https://placehold.co/400x300/fef3c7/92400e?text=Dish+3", alt: "Wagyu Steak" }, { base: { width: "100%", borderRadius: "8px", marginBottom: "12px" } }),
                  node("heading", { text: "Wagyu Steak", level: 3 }, { base: { fontSize: "18px", fontWeight: "600" } }),
                  node("text", { text: "$55" }, { base: { fontSize: "16px", color: "#a16207" } }),
                ]),
              ]),
            ]),
            node("footer", { copyrightText: "© 2025 The Kitchen. All rights reserved.", footerLinks: [{ label: "Menu", href: "/menu" }, { label: "Privacy", href: "/privacy" }] }, { base: { padding: "32px 24px", backgroundColor: "#1c1917", color: "#a8a29e", textAlign: "center", width: "100%" } }),
          ],
          version: 1,
        },
      },
    ],
  },
  {
    name: "Blog",
    description: "Clean blog layout with featured posts",
    category: "blog",
    pages: [
      {
        title: "Home",
        slug: "index",
        schemaJson: {
          rootNodes: [
            standardNavbar,
            node("section", {}, { base: { padding: "48px 24px", maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column" } }, [
              node("heading", { text: "The Blog", level: 1 }, { base: { fontSize: "42px", fontWeight: "800", marginBottom: "8px" } }),
              node("text", { text: "Thoughts on design, development, and building products." }, { base: { fontSize: "18px", color: "#6b7280", marginBottom: "48px" } }),
              node("divider", {}, { base: { width: "100%", height: "1px", backgroundColor: "#e5e7eb", margin: "0 0 32px 0" } }),
              node("container", {}, { base: { marginBottom: "40px", display: "flex", flexDirection: "column" } }, [
                node("text", { text: "January 15, 2025" }, { base: { fontSize: "14px", color: "#9ca3af", marginBottom: "8px" } }),
                node("heading", { text: "Getting Started with Design Systems", level: 2 }, { base: { fontSize: "24px", fontWeight: "700", marginBottom: "12px" } }),
                node("text", { text: "Design systems help teams build consistent, scalable products. Here's how to start building yours from the ground up..." }, { base: { fontSize: "16px", lineHeight: "1.7", color: "#4b5563" } }),
              ]),
              node("divider", {}, { base: { width: "100%", height: "1px", backgroundColor: "#e5e7eb", margin: "0 0 32px 0" } }),
              node("container", {}, { base: { marginBottom: "40px", display: "flex", flexDirection: "column" } }, [
                node("text", { text: "January 8, 2025" }, { base: { fontSize: "14px", color: "#9ca3af", marginBottom: "8px" } }),
                node("heading", { text: "The Future of Web Development", level: 2 }, { base: { fontSize: "24px", fontWeight: "700", marginBottom: "12px" } }),
                node("text", { text: "From server components to AI-powered tools, the landscape of web development is shifting rapidly..." }, { base: { fontSize: "16px", lineHeight: "1.7", color: "#4b5563" } }),
              ]),
            ]),
            standardFooter,
          ],
          version: 1,
        },
      },
    ],
  },
  {
    name: "SaaS Product",
    description: "Software product page with pricing and features",
    category: "saas",
    pages: [
      {
        title: "Home",
        slug: "index",
        schemaJson: {
          rootNodes: [
            node("navbar", { logoText: "FlowApp", navLinks: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "Docs", href: "/docs" }] }, { base: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", backgroundColor: "#ffffff", width: "100%" } }),
            node("section", {}, { base: { padding: "100px 24px", backgroundColor: "#eef2ff", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" } }, [
              node("heading", { text: "Workflow automation, simplified", level: 1 }, { base: { fontSize: "52px", fontWeight: "800", color: "#312e81", marginBottom: "16px", maxWidth: "700px" }, sm: { fontSize: "32px" } }),
              node("text", { text: "Automate repetitive tasks, connect your tools, and ship faster. No code required." }, { base: { fontSize: "20px", color: "#4338ca", marginBottom: "32px", maxWidth: "500px" } }),
              node("button", { text: "Start Free Trial", href: "#" }, { base: { padding: "14px 32px", backgroundColor: "#4f46e5", color: "#ffffff", borderRadius: "8px", fontSize: "18px", fontWeight: "600" } }),
            ]),
            node("section", {}, { base: { padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center" } }, [
              node("heading", { text: "Pricing", level: 2 }, { base: { fontSize: "36px", fontWeight: "700", marginBottom: "48px" } }),
              node("grid", { columns: 3 }, { base: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", maxWidth: "900px", width: "100%" }, sm: { gridTemplateColumns: "1fr" } }, [
                node("container", {}, { base: { padding: "32px", border: "1px solid #e5e7eb", borderRadius: "12px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" } }, [
                  node("heading", { text: "Free", level: 3 }, { base: { fontSize: "20px", fontWeight: "600", marginBottom: "8px" } }),
                  node("heading", { text: "$0/mo", level: 3 }, { base: { fontSize: "36px", fontWeight: "800", marginBottom: "16px" } }),
                  node("text", { text: "Up to 100 tasks/month\n1 workspace\nCommunity support" }, { base: { fontSize: "15px", lineHeight: "2", color: "#6b7280" } }),
                ]),
                node("container", {}, { base: { padding: "32px", border: "2px solid #4f46e5", borderRadius: "12px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#eef2ff" } }, [
                  node("heading", { text: "Pro", level: 3 }, { base: { fontSize: "20px", fontWeight: "600", marginBottom: "8px" } }),
                  node("heading", { text: "$29/mo", level: 3 }, { base: { fontSize: "36px", fontWeight: "800", marginBottom: "16px", color: "#4f46e5" } }),
                  node("text", { text: "Unlimited tasks\n10 workspaces\nPriority support" }, { base: { fontSize: "15px", lineHeight: "2", color: "#6b7280" } }),
                ]),
                node("container", {}, { base: { padding: "32px", border: "1px solid #e5e7eb", borderRadius: "12px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" } }, [
                  node("heading", { text: "Enterprise", level: 3 }, { base: { fontSize: "20px", fontWeight: "600", marginBottom: "8px" } }),
                  node("heading", { text: "Custom", level: 3 }, { base: { fontSize: "36px", fontWeight: "800", marginBottom: "16px" } }),
                  node("text", { text: "Unlimited everything\nCustom integrations\nDedicated support" }, { base: { fontSize: "15px", lineHeight: "2", color: "#6b7280" } }),
                ]),
              ]),
            ]),
            standardFooter,
          ],
          version: 1,
        },
      },
    ],
  },
];
