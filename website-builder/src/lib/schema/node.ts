import { z } from "zod/v4";

export const NodeType = {
  SECTION: "section",
  CONTAINER: "container",
  HEADING: "heading",
  TEXT: "text",
  BUTTON: "button",
  IMAGE: "image",
  SPACER: "spacer",
  DIVIDER: "divider",
  GRID: "grid",
  NAVBAR: "navbar",
  FOOTER: "footer",
  COLUMNS: "columns",
  COLUMN: "column",
} as const;

export type NodeTypeValue = (typeof NodeType)[keyof typeof NodeType];

export const StylePropsSchema = z.object({
  width: z.string().optional(),
  height: z.string().optional(),
  minHeight: z.string().optional(),
  maxWidth: z.string().optional(),
  padding: z.string().optional(),
  paddingTop: z.string().optional(),
  paddingBottom: z.string().optional(),
  paddingLeft: z.string().optional(),
  paddingRight: z.string().optional(),
  margin: z.string().optional(),
  marginTop: z.string().optional(),
  marginBottom: z.string().optional(),
  backgroundColor: z.string().optional(),
  color: z.string().optional(),
  fontSize: z.string().optional(),
  fontWeight: z.string().optional(),
  fontFamily: z.string().optional(),
  textAlign: z.string().optional(),
  lineHeight: z.string().optional(),
  letterSpacing: z.string().optional(),
  borderRadius: z.string().optional(),
  border: z.string().optional(),
  borderColor: z.string().optional(),
  display: z.string().optional(),
  flexDirection: z.string().optional(),
  justifyContent: z.string().optional(),
  alignItems: z.string().optional(),
  gap: z.string().optional(),
  gridTemplateColumns: z.string().optional(),
  backgroundImage: z.string().optional(),
  backgroundSize: z.string().optional(),
  backgroundPosition: z.string().optional(),
  opacity: z.string().optional(),
  overflow: z.string().optional(),
  position: z.string().optional(),
  top: z.string().optional(),
  left: z.string().optional(),
  right: z.string().optional(),
  bottom: z.string().optional(),
  zIndex: z.string().optional(),
  boxShadow: z.string().optional(),
  textDecoration: z.string().optional(),
  textTransform: z.string().optional(),
}).passthrough();

export type StyleProps = z.infer<typeof StylePropsSchema>;

export const ResponsiveStylesSchema = z.object({
  base: StylePropsSchema.optional(),
  md: StylePropsSchema.optional(),
  sm: StylePropsSchema.optional(),
});

export type ResponsiveStyles = z.infer<typeof ResponsiveStylesSchema>;

export const ComponentPropsSchema = z.object({
  text: z.string().optional(),
  level: z.number().min(1).max(6).optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
  href: z.string().optional(),
  target: z.string().optional(),
  placeholder: z.string().optional(),
  columns: z.number().optional(),
  logoText: z.string().optional(),
  navLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
  copyrightText: z.string().optional(),
  footerLinks: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
}).passthrough();

export type ComponentProps = z.infer<typeof ComponentPropsSchema>;

export interface EditorNode {
  id: string;
  type: NodeTypeValue;
  props: ComponentProps;
  styles: ResponsiveStyles;
  children: EditorNode[];
}

export const EditorNodeSchema: z.ZodType<EditorNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.string(),
    props: ComponentPropsSchema,
    styles: ResponsiveStylesSchema,
    children: z.array(EditorNodeSchema),
  })
) as z.ZodType<EditorNode>;

export const PageSchemaJson = z.object({
  rootNodes: z.array(EditorNodeSchema),
  version: z.number().default(1),
});

export type PageSchema = z.infer<typeof PageSchemaJson>;

export function createEmptyPageSchema(): PageSchema {
  return { rootNodes: [], version: 1 };
}

export function createNode(
  type: NodeTypeValue,
  overrides?: Partial<EditorNode>
): EditorNode {
  const id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
  const defaults: Record<string, Partial<EditorNode>> = {
    section: {
      props: {},
      styles: {
        base: {
          padding: "48px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: "200px",
        },
      },
      children: [],
    },
    container: {
      props: {},
      styles: {
        base: {
          maxWidth: "1200px",
          width: "100%",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
        },
      },
      children: [],
    },
    heading: {
      props: { text: "Heading", level: 2 },
      styles: {
        base: { fontSize: "32px", fontWeight: "700", marginBottom: "16px" },
      },
      children: [],
    },
    text: {
      props: { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
      styles: {
        base: { fontSize: "16px", lineHeight: "1.6", marginBottom: "12px" },
      },
      children: [],
    },
    button: {
      props: { text: "Click Me", href: "#" },
      styles: {
        base: {
          padding: "12px 24px",
          backgroundColor: "#2563eb",
          color: "#ffffff",
          borderRadius: "8px",
          fontSize: "16px",
          fontWeight: "600",
          textAlign: "center",
          border: "none",
          display: "inline-block",
        },
      },
      children: [],
    },
    image: {
      props: { src: "https://placehold.co/800x400", alt: "Placeholder" },
      styles: {
        base: { width: "100%", height: "auto", borderRadius: "8px" },
      },
      children: [],
    },
    spacer: {
      props: {},
      styles: { base: { height: "48px" } },
      children: [],
    },
    divider: {
      props: {},
      styles: {
        base: {
          width: "100%",
          height: "1px",
          backgroundColor: "#e5e7eb",
          margin: "24px 0",
        },
      },
      children: [],
    },
    grid: {
      props: { columns: 3 },
      styles: {
        base: {
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "24px",
          width: "100%",
        },
        sm: { gridTemplateColumns: "1fr" },
      },
      children: [],
    },
    columns: {
      props: { columns: 2 },
      styles: {
        base: {
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "24px",
          width: "100%",
        },
        sm: { gridTemplateColumns: "1fr" },
      },
      children: [],
    },
    column: {
      props: {},
      styles: {
        base: { display: "flex", flexDirection: "column", padding: "8px" },
      },
      children: [],
    },
    navbar: {
      props: {
        logoText: "MySite",
        navLinks: [
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ],
      },
      styles: {
        base: {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px 24px",
          backgroundColor: "#ffffff",
          borderColor: "#e5e7eb",
          border: "0 0 1px 0",
          width: "100%",
        },
      },
      children: [],
    },
    footer: {
      props: {
        copyrightText: "© 2025 MySite. All rights reserved.",
        footerLinks: [
          { label: "Privacy", href: "/privacy" },
          { label: "Terms", href: "/terms" },
        ],
      },
      styles: {
        base: {
          padding: "32px 24px",
          backgroundColor: "#1f2937",
          color: "#ffffff",
          textAlign: "center",
          width: "100%",
        },
      },
      children: [],
    },
  };

  const def = defaults[type] || { props: {}, styles: { base: {} }, children: [] };
  return {
    id,
    type,
    props: { ...def.props, ...overrides?.props },
    styles: { ...def.styles, ...overrides?.styles },
    children: overrides?.children || def.children || [],
  };
}
