"use client";

import { useRouter } from "next/navigation";
import { useEditorStore } from "@/store/editor-store";
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  EyeOff,
  Save,
  Undo2,
  Redo2,
  Globe,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

interface Props {
  siteName: string;
  siteId: string;
  pages: { id: string; title: string; slug: string }[];
  currentPageId: string;
  onSave: () => Promise<void>;
}

export default function EditorTopBar({
  siteName,
  siteId,
  pages,
  currentPageId,
  onSave,
}: Props) {
  const router = useRouter();
  const breakpoint = useEditorStore((s) => s.breakpoint);
  const setBreakpoint = useEditorStore((s) => s.setBreakpoint);
  const isPreviewMode = useEditorStore((s) => s.isPreviewMode);
  const togglePreview = useEditorStore((s) => s.togglePreview);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const isDirty = useEditorStore((s) => s.isDirty);
  const isSaving = useEditorStore((s) => s.isSaving);
  const lastSaved = useEditorStore((s) => s.lastSaved);
  const [publishing, setPublishing] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const rootNodes = useEditorStore((s) => s.rootNodes);
  const insertNodes = useEditorStore((s) => s.insertNodes);

  async function handlePublish() {
    setPublishing(true);
    try {
      await onSave();
      const res = await fetch(`/api/sites/${siteId}/publish`, {
        method: "POST",
      });
      if (res.ok) {
        const data = await res.json();
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Publish failed:", err);
    } finally {
      setPublishing(false);
    }
  }

  async function handleAIGenerate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          context: rootNodes.length > 0 ? JSON.stringify(rootNodes.slice(0, 3)) : undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.nodes)) {
          insertNodes(data.nodes);
        }
        setAiPrompt("");
        setShowAI(false);
      } else {
        const err = await res.json();
        alert(err.error || "AI generation failed");
      }
    } catch (err) {
      console.error("AI generation failed:", err);
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-3 gap-2 shrink-0">
      {/* Left section */}
      <button
        onClick={() => router.push("/dashboard/sites")}
        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
        title="Back to Dashboard"
      >
        <ArrowLeft size={18} />
      </button>
      <span className="text-sm font-medium text-gray-700 truncate max-w-[120px]">
        {siteName}
      </span>
      <span className="text-gray-300">|</span>
      <select
        value={currentPageId}
        onChange={(e) => router.push(`/editor/${siteId}/${e.target.value}`)}
        className="text-sm border border-gray-200 rounded px-2 py-1 bg-white text-gray-700 outline-none"
      >
        {pages.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}
          </option>
        ))}
      </select>

      {/* Center section - tools */}
      <div className="flex-1 flex items-center justify-center gap-1">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 size={16} />
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          onClick={() => setBreakpoint("base")}
          className={`p-1.5 rounded ${breakpoint === "base" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
          title="Desktop"
        >
          <Monitor size={16} />
        </button>
        <button
          onClick={() => setBreakpoint("md")}
          className={`p-1.5 rounded ${breakpoint === "md" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
          title="Tablet"
        >
          <Tablet size={16} />
        </button>
        <button
          onClick={() => setBreakpoint("sm")}
          className={`p-1.5 rounded ${breakpoint === "sm" ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
          title="Mobile"
        >
          <Smartphone size={16} />
        </button>
        <div className="w-px h-5 bg-gray-200 mx-1" />
        <button
          onClick={togglePreview}
          className={`p-1.5 rounded ${isPreviewMode ? "bg-blue-100 text-blue-600" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"}`}
          title="Preview Mode"
        >
          {isPreviewMode ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Save status */}
        <span className="text-xs text-gray-400">
          {isSaving
            ? "Saving..."
            : isDirty
            ? "Unsaved changes"
            : lastSaved
            ? `Saved ${lastSaved.toLocaleTimeString()}`
            : ""}
        </span>

        <button
          onClick={() => setShowAI(!showAI)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg font-medium"
          title="AI Assistant (Cerebras)"
        >
          <Sparkles size={14} />
          AI
        </button>

        <button
          onClick={onSave}
          disabled={isSaving || !isDirty}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded disabled:opacity-30"
          title="Save"
        >
          <Save size={16} />
        </button>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          <Globe size={14} />
          {publishing ? "Publishing..." : "Publish"}
        </button>
      </div>

      {/* AI Popup */}
      {showAI && (
        <div className="absolute top-12 right-4 w-96 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} className="text-purple-500" />
            <h3 className="text-sm font-semibold">AI Builder (Cerebras Qwen 3 32B)</h3>
          </div>
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="Describe what you want to build, e.g. 'Create a hero section with a dark background, large heading, subtitle, and a CTA button'"
            className="w-full h-24 px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
          />
          <div className="flex justify-between items-center mt-3">
            <button
              onClick={() => setShowAI(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={handleAIGenerate}
              disabled={aiLoading || !aiPrompt.trim()}
              className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
            >
              {aiLoading ? "Generating..." : "Generate"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
