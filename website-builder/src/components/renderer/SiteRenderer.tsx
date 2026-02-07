"use client";

import React, { memo, useMemo, CSSProperties } from "react";
import type { EditorNode, ResponsiveStyles } from "@/lib/schema/node";

function sanitizeText(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function resolveStyles(styles: ResponsiveStyles): CSSProperties {
  // For published renderer, we merge base styles
  // Responsive styles are handled via CSS classes in a real implementation
  // For MVP, we use base styles directly
  return (styles?.base || {}) as CSSProperties;
}

interface NodeRendererProps {
  node: EditorNode;
  isEditor?: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  onClick?: (e: React.MouseEvent, nodeId: string) => void;
  onMouseEnter?: (nodeId: string) => void;
  onMouseLeave?: () => void;
}

const NodeRenderer = memo(function NodeRenderer({
  node,
  isEditor = false,
  isSelected = false,
  isHovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: NodeRendererProps) {
  const style = useMemo(() => resolveStyles(node.styles), [node.styles]);

  const editorProps = isEditor
    ? {
        onClick: (e: React.MouseEvent) => {
          e.stopPropagation();
          onClick?.(e, node.id);
        },
        onMouseEnter: (e: React.MouseEvent) => {
          e.stopPropagation();
          onMouseEnter?.(node.id);
        },
        onMouseLeave: (e: React.MouseEvent) => {
          e.stopPropagation();
          onMouseLeave?.();
        },
        className: `${isSelected ? "node-selected" : ""} ${
          isHovered && !isSelected ? "node-hovered" : ""
        }`,
        "data-node-id": node.id,
      }
    : {};

  const childrenElements = node.children?.map((child) => (
    <NodeRenderer
      key={child.id}
      node={child}
      isEditor={isEditor}
      isSelected={false}
      isHovered={false}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  ));

  switch (node.type) {
    case "section":
      return (
        <section style={style} {...editorProps}>
          {childrenElements}
          {isEditor && node.children.length === 0 && (
            <div className="text-gray-300 text-sm py-8 text-center w-full">
              Drop components here
            </div>
          )}
        </section>
      );

    case "container":
      return (
        <div style={style} {...editorProps}>
          {childrenElements}
          {isEditor && node.children.length === 0 && (
            <div className="text-gray-300 text-sm py-4 text-center w-full">
              Drop components here
            </div>
          )}
        </div>
      );

    case "heading": {
      const Tag = `h${node.props.level || 2}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
      const text = typeof node.props.text === "string" ? node.props.text : "";
      return React.createElement(
        Tag,
        { style, ...editorProps },
        sanitizeText(text)
      );
    }

    case "text": {
      const text = typeof node.props.text === "string" ? node.props.text : "";
      return (
        <p style={style} {...editorProps}>
          {text.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {sanitizeText(line)}
            </React.Fragment>
          ))}
        </p>
      );
    }

    case "button": {
      const text = typeof node.props.text === "string" ? node.props.text : "Button";
      const href = typeof node.props.href === "string" ? node.props.href : "#";
      if (isEditor) {
        return (
          <span
            style={{ ...style, cursor: "pointer" }}
            {...editorProps}
          >
            {sanitizeText(text)}
          </span>
        );
      }
      return (
        <a href={href} style={style}>
          {sanitizeText(text)}
        </a>
      );
    }

    case "image": {
      const src = typeof node.props.src === "string" ? node.props.src : "";
      const alt = typeof node.props.alt === "string" ? node.props.alt : "";
      return (
        <img
          src={src}
          alt={sanitizeText(alt)}
          style={style}
          loading="lazy"
          {...editorProps}
        />
      );
    }

    case "spacer":
      return <div style={style} {...editorProps} />;

    case "divider":
      return <hr style={style} {...editorProps} />;

    case "grid":
    case "columns":
      return (
        <div style={style} {...editorProps}>
          {childrenElements}
          {isEditor && node.children.length === 0 && (
            <div className="text-gray-300 text-sm py-4 text-center w-full col-span-full">
              Drop columns or components here
            </div>
          )}
        </div>
      );

    case "column":
      return (
        <div style={style} {...editorProps}>
          {childrenElements}
          {isEditor && node.children.length === 0 && (
            <div className="text-gray-300 text-sm py-4 text-center w-full">
              Drop components here
            </div>
          )}
        </div>
      );

    case "navbar": {
      const logoText =
        typeof node.props.logoText === "string" ? node.props.logoText : "Logo";
      const navLinks = Array.isArray(node.props.navLinks)
        ? node.props.navLinks
        : [];
      return (
        <nav style={style} {...editorProps}>
          <span style={{ fontWeight: "700", fontSize: "18px" }}>
            {sanitizeText(logoText)}
          </span>
          <div style={{ display: "flex", gap: "24px" }}>
            {navLinks.map((link: { label: string; href: string }, i: number) =>
              isEditor ? (
                <span key={i} style={{ fontSize: "14px", color: "#4b5563" }}>
                  {sanitizeText(link.label)}
                </span>
              ) : (
                <a
                  key={i}
                  href={link.href}
                  style={{ fontSize: "14px", color: "#4b5563", textDecoration: "none" }}
                >
                  {sanitizeText(link.label)}
                </a>
              )
            )}
          </div>
        </nav>
      );
    }

    case "footer": {
      const copyright =
        typeof node.props.copyrightText === "string"
          ? node.props.copyrightText
          : "";
      const footerLinks = Array.isArray(node.props.footerLinks)
        ? node.props.footerLinks
        : [];
      return (
        <footer style={style} {...editorProps}>
          <p style={{ marginBottom: "8px", fontSize: "14px" }}>
            {sanitizeText(copyright)}
          </p>
          <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
            {footerLinks.map(
              (link: { label: string; href: string }, i: number) =>
                isEditor ? (
                  <span
                    key={i}
                    style={{ fontSize: "13px", opacity: 0.7 }}
                  >
                    {sanitizeText(link.label)}
                  </span>
                ) : (
                  <a
                    key={i}
                    href={link.href}
                    style={{
                      fontSize: "13px",
                      opacity: 0.7,
                      color: "inherit",
                      textDecoration: "none",
                    }}
                  >
                    {sanitizeText(link.label)}
                  </a>
                )
            )}
          </div>
        </footer>
      );
    }

    default:
      return (
        <div style={style} {...editorProps}>
          Unknown component: {node.type}
        </div>
      );
  }
});

interface SiteRendererProps {
  nodes: EditorNode[];
  isEditor?: boolean;
  selectedNodeId?: string | null;
  hoveredNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  onHoverNode?: (nodeId: string | null) => void;
}

export default function SiteRenderer({
  nodes,
  isEditor = false,
  selectedNodeId,
  hoveredNodeId,
  onSelectNode,
  onHoverNode,
}: SiteRendererProps) {
  return (
    <div className="editor-canvas">
      {nodes.map((node) => (
        <NodeRenderer
          key={node.id}
          node={node}
          isEditor={isEditor}
          isSelected={selectedNodeId === node.id}
          isHovered={hoveredNodeId === node.id}
          onClick={(e, id) => onSelectNode?.(id)}
          onMouseEnter={(id) => onHoverNode?.(id)}
          onMouseLeave={() => onHoverNode?.(null)}
        />
      ))}
    </div>
  );
}

export { NodeRenderer };
