import { describe, it, expect } from "vitest";
import { createNode } from "@/lib/schema/node";

describe("Renderer Node Mapping", () => {
  it("should create section with correct structure", () => {
    const section = createNode("section");
    expect(section.type).toBe("section");
    expect(section.styles.base).toBeDefined();
    expect(section.styles.base?.display).toBe("flex");
    expect(section.styles.base?.flexDirection).toBe("column");
    expect(Array.isArray(section.children)).toBe(true);
  });

  it("should create heading with text and level props", () => {
    const heading = createNode("heading");
    expect(heading.type).toBe("heading");
    expect(heading.props.text).toBe("Heading");
    expect(heading.props.level).toBe(2);
    expect(heading.styles.base?.fontSize).toBe("32px");
  });

  it("should create text with paragraph-like styles", () => {
    const text = createNode("text");
    expect(text.type).toBe("text");
    expect(typeof text.props.text).toBe("string");
    expect(text.styles.base?.lineHeight).toBe("1.6");
  });

  it("should create button with link props and styled", () => {
    const btn = createNode("button");
    expect(btn.type).toBe("button");
    expect(btn.props.text).toBe("Click Me");
    expect(btn.props.href).toBe("#");
    expect(btn.styles.base?.backgroundColor).toBe("#2563eb");
    expect(btn.styles.base?.color).toBe("#ffffff");
  });

  it("should create image with src and alt", () => {
    const img = createNode("image");
    expect(img.type).toBe("image");
    expect(img.props.src).toBeDefined();
    expect(img.props.alt).toBeDefined();
    expect(img.styles.base?.width).toBe("100%");
  });

  it("should create grid with column template", () => {
    const grid = createNode("grid");
    expect(grid.type).toBe("grid");
    expect(grid.styles.base?.display).toBe("grid");
    expect(grid.styles.base?.gridTemplateColumns).toContain("repeat");
  });

  it("should create grid with responsive breakpoints", () => {
    const grid = createNode("grid");
    expect(grid.styles.sm).toBeDefined();
    expect(grid.styles.sm?.gridTemplateColumns).toBe("1fr");
  });

  it("should create navbar with logo and links", () => {
    const navbar = createNode("navbar");
    expect(navbar.type).toBe("navbar");
    expect(navbar.props.logoText).toBe("MySite");
    expect(Array.isArray(navbar.props.navLinks)).toBe(true);
  });

  it("should create footer with copyright and links", () => {
    const footer = createNode("footer");
    expect(footer.type).toBe("footer");
    expect(footer.props.copyrightText).toBeDefined();
    expect(Array.isArray(footer.props.footerLinks)).toBe(true);
  });

  it("should create spacer with only height style", () => {
    const spacer = createNode("spacer");
    expect(spacer.type).toBe("spacer");
    expect(spacer.styles.base?.height).toBe("48px");
  });

  it("should create divider as horizontal line", () => {
    const divider = createNode("divider");
    expect(divider.type).toBe("divider");
    expect(divider.styles.base?.height).toBe("1px");
    expect(divider.styles.base?.backgroundColor).toBe("#e5e7eb");
  });
});
