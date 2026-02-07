"use client";

import { useEditorStore } from "@/store/editor-store";
import type { EditorNode } from "@/lib/schema/node";
import { ChevronRight, ChevronDown, Trash2, Copy, Eye } from "lucide-react";
import { useState, useCallback } from "react";

interface LayerItemProps {
  node: EditorNode;
  depth: number;
}

function LayerItem({ node, depth }: LayerItemProps) {
  const [expanded, setExpanded] = useState(true);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const removeNode = useEditorStore((s) => s.removeNode);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const hoverNode = useEditorStore((s) => s.hoverNode);

  const isSelected = selectedNodeId === node.id;
  const hasChildren = node.children && node.children.length > 0;

  const label =
    node.type === "heading"
      ? `H${node.props.level || 2}: ${(node.props.text as string)?.slice(0, 20) || "Heading"}`
      : node.type === "text"
      ? `Text: ${(node.props.text as string)?.slice(0, 20) || ""}`
      : node.type === "button"
      ? `Button: ${(node.props.text as string)?.slice(0, 20) || ""}`
      : node.type === "image"
      ? `Image`
      : node.type === "navbar"
      ? `Navbar: ${node.props.logoText || ""}`
      : node.type.charAt(0).toUpperCase() + node.type.slice(1);

  return (
    <div>
      <div
        className={`flex items-center gap-1 px-2 py-1 cursor-pointer group text-xs ${
          isSelected ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => selectNode(node.id)}
        onMouseEnter={() => hoverNode(node.id)}
        onMouseLeave={() => hoverNode(null)}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="shrink-0"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <span className="truncate flex-1 font-medium">{label}</span>
        <div className="hidden group-hover:flex items-center gap-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              duplicateNode(node.id);
            }}
            className="p-0.5 hover:bg-gray-200 rounded"
            title="Duplicate"
          >
            <Copy size={11} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              removeNode(node.id);
            }}
            className="p-0.5 hover:bg-red-100 text-red-500 rounded"
            title="Delete"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div>
          {node.children.map((child) => (
            <LayerItem key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LayersPanel() {
  const rootNodes = useEditorStore((s) => s.rootNodes);

  if (rootNodes.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-gray-400">
        No components yet. Add components from the Components tab.
      </div>
    );
  }

  return (
    <div className="py-1">
      {rootNodes.map((node) => (
        <LayerItem key={node.id} node={node} depth={0} />
      ))}
    </div>
  );
}
