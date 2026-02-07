"use client";

import { useEditorStore } from "@/store/editor-store";
import { COMPONENT_PALETTE } from "@/lib/schema/renderer-map";
import type { NodeTypeValue } from "@/lib/schema/node";
import {
  LayoutDashboard,
  Box,
  Columns3,
  Grid3x3,
  Type,
  AlignLeft,
  MousePointerClick,
  ImageIcon,
  MoveVertical,
  Minus,
  Navigation,
  PanelBottom,
} from "lucide-react";

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard,
  Box,
  Columns3,
  Grid3x3,
  Type,
  AlignLeft,
  MousePointerClick,
  ImageIcon,
  MoveVertical,
  Minus,
  Navigation,
  PanelBottom,
};

export default function ComponentPalette() {
  const addNode = useEditorStore((s) => s.addNode);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);

  const layoutComponents = COMPONENT_PALETTE.filter(
    (c) => c.category === "layout"
  );
  const contentComponents = COMPONENT_PALETTE.filter(
    (c) => c.category === "content"
  );

  function handleAdd(type: string) {
    addNode(type as NodeTypeValue, selectedNodeId || undefined);
  }

  return (
    <div className="p-3">
      <div className="mb-4">
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Layout
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {layoutComponents.map((comp) => {
            const Icon = iconMap[comp.icon];
            return (
              <button
                key={comp.type}
                onClick={() => handleAdd(comp.type)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
              >
                {Icon && <Icon size={18} />}
                <span className="text-[11px] font-medium">{comp.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <h3 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Content
        </h3>
        <div className="grid grid-cols-2 gap-1.5">
          {contentComponents.map((comp) => {
            const Icon = iconMap[comp.icon];
            return (
              <button
                key={comp.type}
                onClick={() => handleAdd(comp.type)}
                className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
              >
                {Icon && <Icon size={18} />}
                <span className="text-[11px] font-medium">{comp.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
