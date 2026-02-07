import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { EditorNode, PageSchema, ResponsiveStyles } from "@/lib/schema/node";
import { createNode, type NodeTypeValue } from "@/lib/schema/node";
import { isContainerType } from "@/lib/schema/renderer-map";

export type Breakpoint = "base" | "md" | "sm";

interface HistoryEntry {
  rootNodes: EditorNode[];
}

interface EditorState {
  // Page data
  siteId: string | null;
  pageId: string | null;
  rootNodes: EditorNode[];
  isDirty: boolean;
  isSaving: boolean;
  lastSaved: Date | null;

  // Selection
  selectedNodeId: string | null;
  hoveredNodeId: string | null;

  // View
  breakpoint: Breakpoint;
  isPreviewMode: boolean;
  leftPanel: "components" | "layers";

  // History
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];

  // Actions
  initialize: (siteId: string, pageId: string, schema: PageSchema) => void;
  addNode: (type: NodeTypeValue, parentId?: string, index?: number) => void;
  addNodeFromData: (node: EditorNode, parentId?: string, index?: number) => void;
  removeNode: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  updateNodeProps: (nodeId: string, props: Record<string, unknown>) => void;
  updateNodeStyles: (nodeId: string, breakpoint: Breakpoint, styles: Record<string, string>) => void;
  moveNode: (nodeId: string, newParentId: string | null, newIndex: number) => void;
  duplicateNode: (nodeId: string) => void;
  setBreakpoint: (bp: Breakpoint) => void;
  togglePreview: () => void;
  setLeftPanel: (panel: "components" | "layers") => void;
  undo: () => void;
  redo: () => void;
  getSchema: () => PageSchema;
  markSaving: (saving: boolean) => void;
  markSaved: () => void;
  insertNodes: (nodes: EditorNode[], parentId?: string) => void;
}

function findNodeById(nodes: EditorNode[], id: string): EditorNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = findNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}

function findParentAndIndex(
  nodes: EditorNode[],
  nodeId: string
): { parent: EditorNode[]; index: number } | null {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) {
      return { parent: nodes, index: i };
    }
    const result = findParentAndIndex(nodes[i].children, nodeId);
    if (result) return result;
  }
  return null;
}

function removeNodeFromTree(nodes: EditorNode[], nodeId: string): boolean {
  for (let i = 0; i < nodes.length; i++) {
    if (nodes[i].id === nodeId) {
      nodes.splice(i, 1);
      return true;
    }
    if (removeNodeFromTree(nodes[i].children, nodeId)) return true;
  }
  return false;
}

function deepCloneNodes(nodes: EditorNode[]): EditorNode[] {
  return JSON.parse(JSON.stringify(nodes));
}

function reassignIds(node: EditorNode): EditorNode {
  return {
    ...node,
    id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
    children: node.children.map(reassignIds),
  };
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    siteId: null,
    pageId: null,
    rootNodes: [],
    isDirty: false,
    isSaving: false,
    lastSaved: null,
    selectedNodeId: null,
    hoveredNodeId: null,
    breakpoint: "base" as Breakpoint,
    isPreviewMode: false,
    leftPanel: "components" as const,
    undoStack: [],
    redoStack: [],

    initialize: (siteId, pageId, schema) => {
      set((state) => {
        state.siteId = siteId;
        state.pageId = pageId;
        state.rootNodes = schema.rootNodes || [];
        state.isDirty = false;
        state.selectedNodeId = null;
        state.undoStack = [];
        state.redoStack = [];
      });
    },

    addNode: (type, parentId, index) => {
      set((state) => {
        state.undoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.redoStack = [];

        const node = createNode(type);

        // If type is columns, pre-populate with column children
        if (type === "columns") {
          const cols = (node.props.columns as number) || 2;
          for (let i = 0; i < cols; i++) {
            node.children.push(createNode("column" as NodeTypeValue));
          }
        }

        if (parentId) {
          const parent = findNodeById(state.rootNodes, parentId);
          if (parent && isContainerType(parent.type)) {
            if (index !== undefined) {
              parent.children.splice(index, 0, node);
            } else {
              parent.children.push(node);
            }
          }
        } else {
          if (index !== undefined) {
            state.rootNodes.splice(index, 0, node);
          } else {
            state.rootNodes.push(node);
          }
        }

        state.selectedNodeId = node.id;
        state.isDirty = true;
      });
    },

    addNodeFromData: (node, parentId, index) => {
      set((state) => {
        state.undoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.redoStack = [];

        if (parentId) {
          const parent = findNodeById(state.rootNodes, parentId);
          if (parent && isContainerType(parent.type)) {
            if (index !== undefined) {
              parent.children.splice(index, 0, node);
            } else {
              parent.children.push(node);
            }
          }
        } else {
          if (index !== undefined) {
            state.rootNodes.splice(index, 0, node);
          } else {
            state.rootNodes.push(node);
          }
        }

        state.selectedNodeId = node.id;
        state.isDirty = true;
      });
    },

    removeNode: (nodeId) => {
      set((state) => {
        state.undoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.redoStack = [];
        removeNodeFromTree(state.rootNodes, nodeId);
        if (state.selectedNodeId === nodeId) {
          state.selectedNodeId = null;
        }
        state.isDirty = true;
      });
    },

    selectNode: (nodeId) => {
      set((state) => {
        state.selectedNodeId = nodeId;
      });
    },

    hoverNode: (nodeId) => {
      set((state) => {
        state.hoveredNodeId = nodeId;
      });
    },

    updateNodeProps: (nodeId, props) => {
      set((state) => {
        state.undoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.redoStack = [];
        const node = findNodeById(state.rootNodes, nodeId);
        if (node) {
          node.props = { ...node.props, ...props };
          state.isDirty = true;
        }
      });
    },

    updateNodeStyles: (nodeId, breakpoint, styles) => {
      set((state) => {
        state.undoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.redoStack = [];
        const node = findNodeById(state.rootNodes, nodeId);
        if (node) {
          if (!node.styles) node.styles = {};
          node.styles[breakpoint] = {
            ...(node.styles[breakpoint] || {}),
            ...styles,
          };
          state.isDirty = true;
        }
      });
    },

    moveNode: (nodeId, newParentId, newIndex) => {
      set((state) => {
        state.undoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.redoStack = [];

        const location = findParentAndIndex(state.rootNodes, nodeId);
        if (!location) return;

        const [node] = location.parent.splice(location.index, 1);

        if (newParentId) {
          const parent = findNodeById(state.rootNodes, newParentId);
          if (parent) {
            parent.children.splice(newIndex, 0, node);
          }
        } else {
          state.rootNodes.splice(newIndex, 0, node);
        }

        state.isDirty = true;
      });
    },

    duplicateNode: (nodeId) => {
      set((state) => {
        state.undoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.redoStack = [];

        const location = findParentAndIndex(state.rootNodes, nodeId);
        if (!location) return;

        const clone = reassignIds(JSON.parse(JSON.stringify(location.parent[location.index])));
        location.parent.splice(location.index + 1, 0, clone);
        state.selectedNodeId = clone.id;
        state.isDirty = true;
      });
    },

    setBreakpoint: (bp) => set((state) => { state.breakpoint = bp; }),
    togglePreview: () => set((state) => { state.isPreviewMode = !state.isPreviewMode; }),
    setLeftPanel: (panel) => set((state) => { state.leftPanel = panel; }),

    undo: () => {
      set((state) => {
        const entry = state.undoStack.pop();
        if (!entry) return;
        state.redoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.rootNodes = entry.rootNodes;
        state.isDirty = true;
      });
    },

    redo: () => {
      set((state) => {
        const entry = state.redoStack.pop();
        if (!entry) return;
        state.undoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.rootNodes = entry.rootNodes;
        state.isDirty = true;
      });
    },

    getSchema: () => {
      const state = get();
      return { rootNodes: state.rootNodes, version: 1 };
    },

    markSaving: (saving) => set((state) => { state.isSaving = saving; }),
    markSaved: () => set((state) => { state.isSaving = false; state.isDirty = false; state.lastSaved = new Date(); }),

    insertNodes: (nodes, parentId) => {
      set((state) => {
        state.undoStack.push({ rootNodes: deepCloneNodes(state.rootNodes) });
        state.redoStack = [];

        if (parentId) {
          const parent = findNodeById(state.rootNodes, parentId);
          if (parent && isContainerType(parent.type)) {
            parent.children.push(...nodes);
          }
        } else {
          state.rootNodes.push(...nodes);
        }

        state.isDirty = true;
      });
    },
  }))
);
