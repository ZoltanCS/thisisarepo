"use client";

import { useEffect, useState, useCallback, useRef, use } from "react";
import { useEditorStore } from "@/store/editor-store";
import EditorTopBar from "@/components/editor/EditorTopBar";
import EditorLeftPanel from "@/components/editor/panels/EditorLeftPanel";
import EditorCanvas from "@/components/editor/EditorCanvas";
import EditorInspector from "@/components/editor/panels/EditorInspector";
import type { PageSchema } from "@/lib/schema/node";

interface Props {
  params: Promise<{ siteId: string; pageId: string }>;
}

export default function EditorPage({ params }: Props) {
  const { siteId, pageId } = use(params);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [siteName, setSiteName] = useState("");
  const [pages, setPages] = useState<{ id: string; title: string; slug: string }[]>([]);
  const initialize = useEditorStore((s) => s.initialize);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const getSchema = useEditorStore((s) => s.getSchema);
  const markSaving = useEditorStore((s) => s.markSaving);
  const markSaved = useEditorStore((s) => s.markSaved);
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode);
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load page data
  useEffect(() => {
    async function load() {
      try {
        const [siteRes, pageRes] = await Promise.all([
          fetch(`/api/sites/${siteId}`),
          fetch(`/api/sites/${siteId}/pages/${pageId}`),
        ]);

        if (!siteRes.ok || !pageRes.ok) {
          setError("Failed to load editor data");
          return;
        }

        const siteData = await siteRes.json();
        const pageData = await pageRes.json();

        setSiteName(siteData.site.name);
        setPages(siteData.site.pages);

        const schema = pageData.page.schemaJson as PageSchema;
        initialize(siteId, pageId, {
          rootNodes: schema?.rootNodes || [],
          version: schema?.version || 1,
        });
      } catch {
        setError("Failed to load editor");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [siteId, pageId, initialize]);

  // Autosave
  const save = useCallback(async () => {
    const schema = getSchema();
    markSaving(true);
    try {
      await fetch(`/api/sites/${siteId}/pages/${pageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ schemaJson: schema }),
      });
      markSaved();
    } catch (err) {
      console.error("Autosave failed:", err);
      markSaving(false);
    }
  }, [siteId, pageId, getSchema, markSaving, markSaved]);

  useEffect(() => {
    if (isDirty && !isSaving) {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      autosaveTimer.current = setTimeout(save, 2000);
    }
    return () => {
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    };
  }, [isDirty, isSaving, save]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const state = useEditorStore.getState();
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        state.undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        state.redo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "y") {
        e.preventDefault();
        state.redo();
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        if (
          document.activeElement?.tagName !== "INPUT" &&
          document.activeElement?.tagName !== "TEXTAREA" &&
          document.activeElement?.tagName !== "SELECT" &&
          state.selectedNodeId
        ) {
          e.preventDefault();
          state.removeNode(state.selectedNodeId);
        }
      }
      if (e.key === "Escape") {
        state.selectNode(null);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "d") {
        e.preventDefault();
        if (state.selectedNodeId) {
          state.duplicateNode(state.selectedNodeId);
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-500">Loading editor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      <EditorTopBar
        siteName={siteName}
        siteId={siteId}
        pages={pages}
        currentPageId={pageId}
        onSave={save}
      />
      <div className="flex-1 flex overflow-hidden">
        {!isPreviewMode && <EditorLeftPanel />}
        <EditorCanvas />
        {!isPreviewMode && <EditorInspector />}
      </div>
    </div>
  );
}
