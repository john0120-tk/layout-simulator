import useStore from '../../store/useStore'

const SHAPES = [
  { value: 'rect', label: '四角形' },
  { value: 'triangle', label: '三角形' },
  { value: 'diamond', label: '菱形' },
  { value: 'pentagon', label: '五角形' },
  { value: 'hexagon', label: '六角形' },
  { value: 'circle', label: '円' },
]

const PRESET_COLORS = [
  '#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#a78bfa',
  '#fb923c', '#34d399', '#38bdf8', '#f472b6', '#94a3b8',
]

export default function PropertiesPanel({ layoutId }) {
  const layout = useStore((s) => s.getLayout(layoutId))
  const selectedItemId = useStore((s) => s.selectedItemId)
  const updateItem = useStore((s) => s.updateItem)
  const deleteItem = useStore((s) => s.deleteItem)
  const duplicateItem = useStore((s) => s.duplicateItem)
  const updateField = useStore((s) => s.updateField)
  const displayOptions = useStore((s) => s.displayOptions)
  const updateDisplayOptions = useStore((s) => s.updateDisplayOptions)

  if (!layout) return null

  const selectedItem = layout.items.find((it) => it.id === selectedItemId)

  function patch(key, value) {
    updateItem(layoutId, selectedItemId, { [key]: value })
  }

  function patchNum(key, value) {
    const n = parseFloat(value)
    if (!isNaN(n) && n > 0) patch(key, n)
  }

  return (
    <aside className="w-56 bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {selectedItem ? 'アイテム設定' : 'フィールド設定'}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {selectedItem ? (
          <ItemProperties
            item={selectedItem}
            layout={layout}
            onPatch={patch}
            onPatchNum={patchNum}
            onDelete={() => deleteItem(layoutId, selectedItemId)}
            onDuplicate={() => duplicateItem(layoutId, selectedItemId)}
          />
        ) : (
          <FieldProperties
            field={layout.field}
            displayOptions={displayOptions}
            onFieldChange={(k, v) => updateField(layoutId, { [k]: v })}
            onDisplayChange={(k, v) => updateDisplayOptions({ [k]: v })}
          />
        )}
      </div>
    </aside>
  )
}

function ItemProperties({ item, layout, onPatch, onPatchNum, onDelete, onDuplicate }) {
  const tents = layout.items.filter((it) => it.type === 'tent')

  return (
    <div className="p-3 space-y-3">
      {/* Name */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">名前</label>
        <input
          type="text"
          value={item.name}
          onChange={(e) => onPatch('name', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      {/* Shape */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">形状</label>
        <select
          value={item.shape}
          onChange={(e) => onPatch('shape', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          {SHAPES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {/* Size */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs text-gray-500 block mb-1">幅 (cm)</label>
          <input
            type="number"
            min="1"
            value={item.widthCm}
            onChange={(e) => onPatchNum('widthCm', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">高さ (cm)</label>
          <input
            type="number"
            min="1"
            value={item.heightCm}
            onChange={(e) => onPatchNum('heightCm', e.target.value)}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Rotation */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">角度 (°)</label>
        <input
          type="number"
          value={Math.round(item.rotation)}
          onChange={(e) => onPatch('rotation', parseFloat(e.target.value) || 0)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      {/* Color */}
      <div>
        <label className="text-xs text-gray-500 block mb-1">色</label>
        <div className="flex flex-wrap gap-1.5 mb-1">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onPatch('color', c)}
              className={`w-5 h-5 rounded-full border-2 transition-transform ${
                item.color === c ? 'border-gray-700 scale-110' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <input
          type="color"
          value={item.color}
          onChange={(e) => onPatch('color', e.target.value)}
          className="w-full h-7 rounded cursor-pointer border border-gray-200"
        />
      </div>

      {/* Layer (parent) */}
      {item.type === 'gear' && (
        <div>
          <label className="text-xs text-gray-500 block mb-1">配置先</label>
          <select
            value={item.parentId ?? ''}
            onChange={(e) => onPatch('parentId', e.target.value || null)}
            className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
          >
            <option value="">フィールド（テント外）</option>
            {tents.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={onDuplicate}
          className="flex-1 text-xs bg-gray-100 text-gray-700 rounded py-1.5 hover:bg-gray-200"
        >
          複製
        </button>
        <button
          onClick={() => { if (confirm(`「${item.name}」を削除しますか？`)) onDelete() }}
          className="flex-1 text-xs bg-red-50 text-red-600 rounded py-1.5 hover:bg-red-100"
        >
          削除
        </button>
      </div>
    </div>
  )
}

function FieldProperties({ field, displayOptions, onFieldChange, onDisplayChange }) {
  function patchField(key, value) {
    const n = parseFloat(value)
    if (!isNaN(n) && n > 0) onFieldChange(key, n)
  }

  return (
    <div className="p-3 space-y-3">
      <div>
        <label className="text-xs text-gray-500 block mb-1">フィールド幅 (cm)</label>
        <input
          type="number"
          min="100"
          value={field.widthCm}
          onChange={(e) => patchField('widthCm', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 block mb-1">フィールド高さ (cm)</label>
        <input
          type="number"
          min="100"
          value={field.heightCm}
          onChange={(e) => patchField('heightCm', e.target.value)}
          className="w-full text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-green-500"
        />
      </div>

      <div className="border-t border-gray-100 pt-3">
        <p className="text-xs font-semibold text-gray-500 mb-2">表示設定</p>
        <label className="flex items-center gap-2 text-sm text-gray-700 mb-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={displayOptions.showDimensionLabels}
            onChange={(e) => onDisplayChange('showDimensionLabels', e.target.checked)}
            className="accent-green-600"
          />
          寸法ラベル
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 mb-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={displayOptions.showGrid}
            onChange={(e) => onDisplayChange('showGrid', e.target.checked)}
            className="accent-green-600"
          />
          グリッド目盛り
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={displayOptions.snapToGrid}
            onChange={(e) => onDisplayChange('snapToGrid', e.target.checked)}
            className="accent-green-600"
          />
          グリッドスナップ
        </label>
      </div>
    </div>
  )
}
