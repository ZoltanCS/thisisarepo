"use client";

import { useEditorStore, type Breakpoint } from "@/store/editor-store";
import type { EditorNode } from "@/lib/schema/node";
import { useMemo, useCallback, useState } from "react";
import { Trash2, Copy, Settings, Paintbrush } from "lucide-react";

function findNodeById(nodes: EditorNode[], id: string): EditorNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}

interface StyleFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "color" | "select";
  options?: { label: string; value: string }[];
}

function StyleField({ label, value, onChange, type = "text", options }: StyleFieldProps) {
  if (type === "color") {
    return (
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-gray-500 w-24 shrink-0">{label}</label>
        <div className="flex items-center gap-1 flex-1">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            className="w-6 h-6 rounded border border-gray-200 cursor-pointer"
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
            placeholder="#000000"
          />
        </div>
      </div>
    );
  }

  if (type === "select" && options) {
    return (
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-gray-500 w-24 shrink-0">{label}</label>
        <select
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white"
        >
          <option value="">-</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-gray-500 w-24 shrink-0">{label}</label>
      <input
        type="text"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs"
      />
    </div>
  );
}

function PropsEditor({ node }: { node: EditorNode }) {
  const updateNodeProps = useEditorStore((s) => s.updateNodeProps);

  const handleChange = useCallback(
    (key: string, value: unknown) => {
      updateNodeProps(node.id, { [key]: value });
    },
    [node.id, updateNodeProps]
  );

  switch (node.type) {
    case "heading":
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gray-500 w-24 shrink-0">Level</label>
            <select
              value={node.props.level || 2}
              onChange={(e) => handleChange("level", parseInt(e.target.value))}
              className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white"
            >
              {[1, 2, 3, 4, 5, 6].map((l) => (
                <option key={l} value={l}>
                  H{l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Text</label>
            <textarea
              value={(node.props.text as string) || ""}
              onChange={(e) => handleChange("text", e.target.value)}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs resize-none h-16"
            />
          </div>
        </div>
      );

    case "text":
      return (
        <div>
          <label className="text-[11px] text-gray-500 block mb-1">Text Content</label>
          <textarea
            value={(node.props.text as string) || ""}
            onChange={(e) => handleChange("text", e.target.value)}
            className="w-full px-2 py-1 border border-gray-200 rounded text-xs resize-none h-24"
          />
        </div>
      );

    case "button":
      return (
        <div className="space-y-2">
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Button Text</label>
            <input
              type="text"
              value={(node.props.text as string) || ""}
              onChange={(e) => handleChange("text", e.target.value)}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Link URL</label>
            <input
              type="text"
              value={(node.props.href as string) || ""}
              onChange={(e) => handleChange("href", e.target.value)}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
            />
          </div>
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Image URL</label>
            <input
              type="text"
              value={(node.props.src as string) || ""}
              onChange={(e) => handleChange("src", e.target.value)}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Alt Text</label>
            <input
              type="text"
              value={(node.props.alt as string) || ""}
              onChange={(e) => handleChange("alt", e.target.value)}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
            />
          </div>
        </div>
      );

    case "grid":
    case "columns":
      return (
        <div>
          <div className="flex items-center gap-2">
            <label className="text-[11px] text-gray-500 w-24 shrink-0">Columns</label>
            <select
              value={node.props.columns || 2}
              onChange={(e) => handleChange("columns", parseInt(e.target.value))}
              className="flex-1 px-2 py-1 border border-gray-200 rounded text-xs bg-white"
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
      );

    case "navbar":
      return (
        <div className="space-y-2">
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">Logo Text</label>
            <input
              type="text"
              value={(node.props.logoText as string) || ""}
              onChange={(e) => handleChange("logoText", e.target.value)}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">
              Nav Links (JSON)
            </label>
            <textarea
              value={JSON.stringify(node.props.navLinks || [], null, 2)}
              onChange={(e) => {
                try {
                  const links = JSON.parse(e.target.value);
                  handleChange("navLinks", links);
                } catch {}
              }}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-mono resize-none h-20"
            />
          </div>
        </div>
      );

    case "footer":
      return (
        <div className="space-y-2">
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">
              Copyright Text
            </label>
            <input
              type="text"
              value={(node.props.copyrightText as string) || ""}
              onChange={(e) => handleChange("copyrightText", e.target.value)}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] text-gray-500 block mb-1">
              Footer Links (JSON)
            </label>
            <textarea
              value={JSON.stringify(node.props.footerLinks || [], null, 2)}
              onChange={(e) => {
                try {
                  const links = JSON.parse(e.target.value);
                  handleChange("footerLinks", links);
                } catch {}
              }}
              className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-mono resize-none h-20"
            />
          </div>
        </div>
      );

    default:
      return (
        <p className="text-xs text-gray-400">
          No editable props for this component.
        </p>
      );
  }
}

function StylesEditor({ node }: { node: EditorNode }) {
  const updateNodeStyles = useEditorStore((s) => s.updateNodeStyles);
  const breakpoint = useEditorStore((s) => s.breakpoint);

  const currentStyles = useMemo(
    () => (node.styles?.[breakpoint] || {}) as Record<string, string>,
    [node.styles, breakpoint]
  );

  const handleStyleChange = useCallback(
    (key: string, value: string) => {
      updateNodeStyles(node.id, breakpoint, { [key]: value });
    },
    [node.id, breakpoint, updateNodeStyles]
  );

  const bpLabel = breakpoint === "base" ? "Desktop" : breakpoint === "md" ? "Tablet" : "Mobile";

  return (
    <div className="space-y-3">
      <div className="text-[11px] text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded">
        Editing: {bpLabel} styles
      </div>

      <div>
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Spacing
        </h4>
        <div className="space-y-1.5">
          <StyleField label="Padding" value={currentStyles.padding || ""} onChange={(v) => handleStyleChange("padding", v)} />
          <StyleField label="Margin" value={currentStyles.margin || ""} onChange={(v) => handleStyleChange("margin", v)} />
          <StyleField label="Gap" value={currentStyles.gap || ""} onChange={(v) => handleStyleChange("gap", v)} />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Size
        </h4>
        <div className="space-y-1.5">
          <StyleField label="Width" value={currentStyles.width || ""} onChange={(v) => handleStyleChange("width", v)} />
          <StyleField label="Height" value={currentStyles.height || ""} onChange={(v) => handleStyleChange("height", v)} />
          <StyleField label="Max Width" value={currentStyles.maxWidth || ""} onChange={(v) => handleStyleChange("maxWidth", v)} />
          <StyleField label="Min Height" value={currentStyles.minHeight || ""} onChange={(v) => handleStyleChange("minHeight", v)} />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Typography
        </h4>
        <div className="space-y-1.5">
          <StyleField label="Font Size" value={currentStyles.fontSize || ""} onChange={(v) => handleStyleChange("fontSize", v)} />
          <StyleField
            label="Font Weight"
            value={currentStyles.fontWeight || ""}
            onChange={(v) => handleStyleChange("fontWeight", v)}
            type="select"
            options={[
              { label: "Normal (400)", value: "400" },
              { label: "Medium (500)", value: "500" },
              { label: "Semibold (600)", value: "600" },
              { label: "Bold (700)", value: "700" },
              { label: "Extra Bold (800)", value: "800" },
            ]}
          />
          <StyleField
            label="Text Align"
            value={currentStyles.textAlign || ""}
            onChange={(v) => handleStyleChange("textAlign", v)}
            type="select"
            options={[
              { label: "Left", value: "left" },
              { label: "Center", value: "center" },
              { label: "Right", value: "right" },
            ]}
          />
          <StyleField label="Line Height" value={currentStyles.lineHeight || ""} onChange={(v) => handleStyleChange("lineHeight", v)} />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Colors
        </h4>
        <div className="space-y-1.5">
          <StyleField label="Background" value={currentStyles.backgroundColor || ""} onChange={(v) => handleStyleChange("backgroundColor", v)} type="color" />
          <StyleField label="Color" value={currentStyles.color || ""} onChange={(v) => handleStyleChange("color", v)} type="color" />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Border
        </h4>
        <div className="space-y-1.5">
          <StyleField label="Border Radius" value={currentStyles.borderRadius || ""} onChange={(v) => handleStyleChange("borderRadius", v)} />
          <StyleField label="Border" value={currentStyles.border || ""} onChange={(v) => handleStyleChange("border", v)} />
          <StyleField label="Box Shadow" value={currentStyles.boxShadow || ""} onChange={(v) => handleStyleChange("boxShadow", v)} />
        </div>
      </div>

      <div>
        <h4 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Layout
        </h4>
        <div className="space-y-1.5">
          <StyleField
            label="Display"
            value={currentStyles.display || ""}
            onChange={(v) => handleStyleChange("display", v)}
            type="select"
            options={[
              { label: "Block", value: "block" },
              { label: "Flex", value: "flex" },
              { label: "Grid", value: "grid" },
              { label: "Inline", value: "inline" },
              { label: "Inline Block", value: "inline-block" },
              { label: "None", value: "none" },
            ]}
          />
          <StyleField
            label="Flex Dir"
            value={currentStyles.flexDirection || ""}
            onChange={(v) => handleStyleChange("flexDirection", v)}
            type="select"
            options={[
              { label: "Row", value: "row" },
              { label: "Column", value: "column" },
            ]}
          />
          <StyleField
            label="Justify"
            value={currentStyles.justifyContent || ""}
            onChange={(v) => handleStyleChange("justifyContent", v)}
            type="select"
            options={[
              { label: "Start", value: "flex-start" },
              { label: "Center", value: "center" },
              { label: "End", value: "flex-end" },
              { label: "Between", value: "space-between" },
              { label: "Around", value: "space-around" },
            ]}
          />
          <StyleField
            label="Align"
            value={currentStyles.alignItems || ""}
            onChange={(v) => handleStyleChange("alignItems", v)}
            type="select"
            options={[
              { label: "Start", value: "flex-start" },
              { label: "Center", value: "center" },
              { label: "End", value: "flex-end" },
              { label: "Stretch", value: "stretch" },
            ]}
          />
          <StyleField label="Grid Cols" value={currentStyles.gridTemplateColumns || ""} onChange={(v) => handleStyleChange("gridTemplateColumns", v)} />
        </div>
      </div>
    </div>
  );
}

export default function EditorInspector() {
  const rootNodes = useEditorStore((s) => s.rootNodes);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const removeNode = useEditorStore((s) => s.removeNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const [tab, setTab] = useState<"props" | "styles">("props");

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNodeById(rootNodes, selectedNodeId);
  }, [rootNodes, selectedNodeId]);

  if (!selectedNode) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 shrink-0 flex items-center justify-center">
        <p className="text-xs text-gray-400 text-center px-4">
          Select a component to edit its properties and styles
        </p>
      </div>
    );
  }

  return (
    <div className="w-72 bg-white border-l border-gray-200 shrink-0 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-700 capitalize">
            {selectedNode.type}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => duplicateNode(selectedNode.id)}
              className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              title="Duplicate"
            >
              <Copy size={13} />
            </button>
            <button
              onClick={() => removeNode(selectedNode.id)}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
              title="Delete"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 shrink-0">
        <button
          onClick={() => setTab("props")}
          className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1 ${
            tab === "props"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Settings size={12} />
          Properties
        </button>
        <button
          onClick={() => setTab("styles")}
          className={`flex-1 py-1.5 text-xs font-medium flex items-center justify-center gap-1 ${
            tab === "styles"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Paintbrush size={12} />
          Styles
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto panel-scroll p-3">
        {tab === "props" ? (
          <PropsEditor node={selectedNode} />
        ) : (
          <StylesEditor node={selectedNode} />
        )}
      </div>
    </div>
  );
}
