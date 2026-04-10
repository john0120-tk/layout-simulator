import { create } from 'zustand'
import { loadFromStorage, saveToStorage } from '../utils/storage'
import { generateId } from '../utils/geometry'

const DEFAULT_DISPLAY_OPTIONS = {
  showDimensionLabels: true,
  showGrid: true,
  snapToGrid: false,
}

function createLayout(name) {
  return {
    id: generateId(),
    name,
    field: { widthCm: 1000, heightCm: 800 },
    items: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function loadInitialState() {
  const saved = loadFromStorage()
  if (saved && saved.layouts && saved.layouts.length > 0) {
    return {
      layouts: saved.layouts,
      displayOptions: saved.displayOptions ?? DEFAULT_DISPLAY_OPTIONS,
    }
  }
  return {
    layouts: [],
    displayOptions: DEFAULT_DISPLAY_OPTIONS,
  }
}

const initial = loadInitialState()

const useStore = create((set, get) => ({
  layouts: initial.layouts,
  displayOptions: initial.displayOptions,
  selectedItemId: null,

  // --- Layout CRUD ---
  addLayout(name) {
    const layout = createLayout(name)
    set((s) => {
      const layouts = [...s.layouts, layout]
      saveToStorage({ layouts, displayOptions: s.displayOptions })
      return { layouts }
    })
    return layout.id
  },

  deleteLayout(id) {
    set((s) => {
      const layouts = s.layouts.filter((l) => l.id !== id)
      saveToStorage({ layouts, displayOptions: s.displayOptions })
      return { layouts }
    })
  },

  renameLayout(id, name) {
    set((s) => {
      const layouts = s.layouts.map((l) =>
        l.id === id ? { ...l, name, updatedAt: new Date().toISOString() } : l
      )
      saveToStorage({ layouts, displayOptions: s.displayOptions })
      return { layouts }
    })
  },

  getLayout(id) {
    return get().layouts.find((l) => l.id === id)
  },

  // --- Field ---
  updateField(layoutId, field) {
    set((s) => {
      const layouts = s.layouts.map((l) =>
        l.id === layoutId
          ? { ...l, field: { ...l.field, ...field }, updatedAt: new Date().toISOString() }
          : l
      )
      saveToStorage({ layouts, displayOptions: s.displayOptions })
      return { layouts }
    })
  },

  // --- Items ---
  addItem(layoutId, item) {
    const newItem = { ...item, id: generateId() }
    set((s) => {
      const layouts = s.layouts.map((l) =>
        l.id === layoutId
          ? { ...l, items: [...l.items, newItem], updatedAt: new Date().toISOString() }
          : l
      )
      saveToStorage({ layouts, displayOptions: s.displayOptions })
      return { layouts, selectedItemId: newItem.id }
    })
  },

  updateItem(layoutId, itemId, patch) {
    set((s) => {
      const layouts = s.layouts.map((l) =>
        l.id === layoutId
          ? {
              ...l,
              items: l.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)),
              updatedAt: new Date().toISOString(),
            }
          : l
      )
      saveToStorage({ layouts, displayOptions: s.displayOptions })
      return { layouts }
    })
  },

  deleteItem(layoutId, itemId) {
    set((s) => {
      const layouts = s.layouts.map((l) =>
        l.id === layoutId
          ? {
              ...l,
              items: l.items.filter((it) => it.id !== itemId),
              updatedAt: new Date().toISOString(),
            }
          : l
      )
      saveToStorage({ layouts, displayOptions: s.displayOptions })
      return { layouts, selectedItemId: null }
    })
  },

  duplicateItem(layoutId, itemId) {
    const layout = get().layouts.find((l) => l.id === layoutId)
    const item = layout?.items.find((it) => it.id === itemId)
    if (!item) return
    const copy = { ...item, id: generateId(), x: item.x + 20, y: item.y + 20 }
    set((s) => {
      const layouts = s.layouts.map((l) =>
        l.id === layoutId
          ? { ...l, items: [...l.items, copy], updatedAt: new Date().toISOString() }
          : l
      )
      saveToStorage({ layouts, displayOptions: s.displayOptions })
      return { layouts, selectedItemId: copy.id }
    })
  },

  // --- Selection ---
  selectItem(id) {
    set({ selectedItemId: id })
  },

  // --- Display Options ---
  updateDisplayOptions(patch) {
    set((s) => {
      const displayOptions = { ...s.displayOptions, ...patch }
      saveToStorage({ layouts: s.layouts, displayOptions })
      return { displayOptions }
    })
  },
}))

export default useStore
