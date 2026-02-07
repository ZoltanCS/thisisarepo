"use client";

import { useEditorStore } from "@/store/editor-store";
import ComponentPalette from "./ComponentPalette";
import LayersPanel from "./LayersPanel";

export default function EditorLeftPanel() {
  const leftPanel = useEditorStore((s) => s.leftPanel);
  const setLeftPanel = useEditorStore((s) => s.setLeftPanel);

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
      <div className="flex border-b border-gray-200 shrink-0">
        <button
          onClick={() => setLeftPanel("components")}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            leftPanel === "components"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Components
        </button>
        <button
          onClick={() => setLeftPanel("layers")}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            leftPanel === "layers"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Layers
        </button>
      </div>
      <div className="flex-1 overflow-auto panel-scroll">
        {leftPanel === "components" ? <ComponentPalette /> : <LayersPanel />}
      </div>
    </div>
  );
}
