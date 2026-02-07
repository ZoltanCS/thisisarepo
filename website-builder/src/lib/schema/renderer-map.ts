export const COMPONENT_PALETTE = [
  { type: "section", label: "Section", icon: "LayoutDashboard", category: "layout" },
  { type: "container", label: "Container", icon: "Box", category: "layout" },
  { type: "columns", label: "Columns", icon: "Columns3", category: "layout" },
  { type: "grid", label: "Grid", icon: "Grid3x3", category: "layout" },
  { type: "heading", label: "Heading", icon: "Type", category: "content" },
  { type: "text", label: "Text", icon: "AlignLeft", category: "content" },
  { type: "button", label: "Button", icon: "MousePointerClick", category: "content" },
  { type: "image", label: "Image", icon: "ImageIcon", category: "content" },
  { type: "spacer", label: "Spacer", icon: "MoveVertical", category: "content" },
  { type: "divider", label: "Divider", icon: "Minus", category: "content" },
  { type: "navbar", label: "Navbar", icon: "Navigation", category: "layout" },
  { type: "footer", label: "Footer", icon: "PanelBottom", category: "layout" },
] as const;

export const CONTAINER_TYPES = new Set([
  "section",
  "container",
  "grid",
  "columns",
  "column",
  "navbar",
  "footer",
]);

export function isContainerType(type: string): boolean {
  return CONTAINER_TYPES.has(type);
}
