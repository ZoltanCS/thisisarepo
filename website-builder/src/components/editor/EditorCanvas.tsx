"use client";

import { useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useState } from "react";
import { useEditorStore, type Breakpoint } from "@/store/editor-store";
import SiteRenderer from "@/components/renderer/SiteRenderer";
import type { EditorNode, NodeTypeValue } from "@/lib/schema/node";
import { createNode } from "@/lib/schema/node";
import { isContainerType } from "@/lib/schema/renderer-map";

function getCanvasWidth(breakpoint: Breakpoint): string {
  switch (breakpoint) {
    case "sm":
      return "375px";
    case "md":
      return "768px";
    case "base":
    default:
      return "100%";
  }
}

export default function EditorCanvas() {
  const rootNodes = useEditorStore((s) => s.rootNodes);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const hoveredNodeId = useEditorStore((s) => s.hoveredNodeId);
  const selectNode = useEditorStore((s) => s.selectNode);
  const hoverNode = useEditorStore((s) => s.hoverNode);
  const addNode = useEditorStore((s) => s.addNode);
  const addNodeFromData = useEditorStore((s) => s.addNodeFromData);
  const moveNode = useEditorStore((s) => s.moveNode);
  const breakpoint = useEditorStore((s) => s.breakpoint);
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const canvasWidth = useMemo(() => getCanvasWidth(breakpoint), [breakpoint]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragId(null);
      const { active, over } = event;

      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      // Check if this is a new component being added from the palette
      const paletteType = active.data?.current?.type as NodeTypeValue | undefined;
      const isFromPalette = active.data?.current?.fromPalette;

      if (isFromPalette && paletteType) {
        // Determine the target: if over a container, add as child; otherwise add to root
        if (overId === "canvas-drop-zone") {
          addNode(paletteType);
        } else {
          // Find if the over target is a container
          const targetIsContainer = isContainerType(overId.split("-")[0] || "");
          if (targetIsContainer) {
            addNode(paletteType, overId);
          } else {
            addNode(paletteType);
          }
        }
        return;
      }

      // Moving existing nodes
      if (activeId !== overId) {
        if (overId === "canvas-drop-zone") {
          moveNode(activeId, null, rootNodes.length);
        }
      }
    },
    [addNode, moveNode, rootNodes.length]
  );

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div
          id="canvas-drop-zone"
          className="mx-auto bg-white min-h-[calc(100vh-80px)] shadow-sm transition-all duration-200"
          style={{ maxWidth: canvasWidth }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              selectNode(null);
            }
          }}
        >
          {isPreviewMode ? (
            <SiteRenderer nodes={rootNodes} />
          ) : (
            <>
              <SiteRenderer
                nodes={rootNodes}
                isEditor
                selectedNodeId={selectedNodeId}
                hoveredNodeId={hoveredNodeId}
                onSelectNode={selectNode}
                onHoverNode={hoverNode}
              />
              {rootNodes.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-gray-300">
                  <p className="text-lg mb-2">Your canvas is empty</p>
                  <p className="text-sm">
                    Drag components from the left panel or use AI to generate content
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <DragOverlay>
        {activeDragId && (
          <div className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium shadow-lg opacity-80">
            Moving component
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
