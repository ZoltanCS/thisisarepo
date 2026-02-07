import { describe, it, expect } from "vitest";
import {
  EditorNodeSchema,
  PageSchemaJson,
  createNode,
  createEmptyPageSchema,
  NodeType,
} from "@/lib/schema/node";
import { isContainerType, COMPONENT_PALETTE } from "@/lib/schema/renderer-map";

describe("EditorNode Schema Validation", () => {
  it("should validate a valid heading node", () => {
    const node = createNode("heading");
    const result = EditorNodeSchema.safeParse(node);
    expect(result.success).toBe(true);
  });

  it("should validate a valid section node with children", () => {
    const section = createNode("section");
    section.children = [createNode("heading"), createNode("text")];
    const result = EditorNodeSchema.safeParse(section);
    expect(result.success).toBe(true);
  });

  it("should validate a valid button node", () => {
    const node = createNode("button");
    expect(node.props.text).toBe("Click Me");
    expect(node.props.href).toBe("#");
    const result = EditorNodeSchema.safeParse(node);
    expect(result.success).toBe(true);
  });

  it("should validate all component types", () => {
    const types = Object.values(NodeType);
    for (const type of types) {
      const node = createNode(type);
      const result = EditorNodeSchema.safeParse(node);
      expect(result.success).toBe(true);
    }
  });

  it("should reject a node without an id", () => {
    const node = { type: "heading", props: {}, styles: {}, children: [] };
    const result = EditorNodeSchema.safeParse(node);
    expect(result.success).toBe(false);
  });

  it("should reject a node without a type", () => {
    const node = { id: "test", props: {}, styles: {}, children: [] };
    const result = EditorNodeSchema.safeParse(node);
    expect(result.success).toBe(false);
  });

  it("should validate nested node trees", () => {
    const tree = createNode("section");
    const container = createNode("container");
    const heading = createNode("heading");
    const text = createNode("text");
    container.children = [heading, text];
    tree.children = [container];

    const result = EditorNodeSchema.safeParse(tree);
    expect(result.success).toBe(true);
  });

  it("should validate responsive styles", () => {
    const node = createNode("heading");
    node.styles = {
      base: { fontSize: "32px", color: "#000000" },
      md: { fontSize: "24px" },
      sm: { fontSize: "18px" },
    };
    const result = EditorNodeSchema.safeParse(node);
    expect(result.success).toBe(true);
  });
});

describe("PageSchema Validation", () => {
  it("should validate an empty page schema", () => {
    const schema = createEmptyPageSchema();
    const result = PageSchemaJson.safeParse(schema);
    expect(result.success).toBe(true);
  });

  it("should validate a page with multiple root nodes", () => {
    const schema = {
      rootNodes: [createNode("navbar"), createNode("section"), createNode("footer")],
      version: 1,
    };
    const result = PageSchemaJson.safeParse(schema);
    expect(result.success).toBe(true);
  });

  it("should add default version if missing", () => {
    const schema = { rootNodes: [] };
    const result = PageSchemaJson.safeParse(schema);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.version).toBe(1);
    }
  });
});

describe("Component Registry", () => {
  it("should have all node types in the palette", () => {
    const paletteTypes = COMPONENT_PALETTE.map((c) => c.type);
    // column is not directly in palette (it's auto-created)
    expect(paletteTypes).toContain("section");
    expect(paletteTypes).toContain("heading");
    expect(paletteTypes).toContain("text");
    expect(paletteTypes).toContain("button");
    expect(paletteTypes).toContain("image");
    expect(paletteTypes).toContain("navbar");
    expect(paletteTypes).toContain("footer");
  });

  it("should correctly identify container types", () => {
    expect(isContainerType("section")).toBe(true);
    expect(isContainerType("container")).toBe(true);
    expect(isContainerType("grid")).toBe(true);
    expect(isContainerType("columns")).toBe(true);
    expect(isContainerType("column")).toBe(true);
    expect(isContainerType("navbar")).toBe(true);
    expect(isContainerType("footer")).toBe(true);
    expect(isContainerType("heading")).toBe(false);
    expect(isContainerType("text")).toBe(false);
    expect(isContainerType("button")).toBe(false);
    expect(isContainerType("image")).toBe(false);
  });
});

describe("createNode factory", () => {
  it("should create unique ids for each node", () => {
    const node1 = createNode("heading");
    const node2 = createNode("heading");
    expect(node1.id).not.toBe(node2.id);
  });

  it("should apply overrides to props", () => {
    const node = createNode("heading", {
      props: { text: "Custom", level: 1 },
    });
    expect(node.props.text).toBe("Custom");
    expect(node.props.level).toBe(1);
  });

  it("should create image with placeholder src", () => {
    const node = createNode("image");
    expect(node.props.src).toContain("placehold.co");
    expect(node.props.alt).toBe("Placeholder");
  });

  it("should create navbar with default links", () => {
    const node = createNode("navbar");
    expect(Array.isArray(node.props.navLinks)).toBe(true);
    expect((node.props.navLinks as unknown[]).length).toBeGreaterThan(0);
  });

  it("should create footer with copyright text", () => {
    const node = createNode("footer");
    expect(typeof node.props.copyrightText).toBe("string");
  });
});
