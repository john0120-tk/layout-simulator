import { useState } from 'react'
import useStore from '../../store/useStore'

const SHAPES = [
  { value: 'rect', label: '四角形', icon: '■' },
  { value: 'triangle', label: '三角形', icon: '▲' },
  { value: 'diamond', label: '菱形', icon: '◆' },
  { value: 'pentagon', label: '五角形', icon: '⬠' },
  { value: 'hexagon', label: '六角形', icon: '⬡' },
  { value: 'circle', label: '円', icon: '●' },
]

const DEFAULT_COLORS = ['#4ade80', '#60a5fa', '#f87171', '#fbbf24', '#a78bfa', '#fb923c']

export default function AddItemDialog({ layoutId, onClose }) {
  const layout = useStore((s) => s.getLayout(layoutId))
  const addItem = useStore((s) => s.addItem)

  const tents = layout?.items.filter((it) => it.type === 'tent') ?? []

  const [name, setName] = useState('')
  const [type, setType] = useState('gear')
  const [shape, setShape] = useState('rect')
  const [widthCm, setWidthCm] = useState(200)
  const [heightCm, setHeightCm] = useState(200)
  const [color, setColor] = useState('#4ade80')
  const [parentId, setParentId] = useState(null)

  function handleAdd() {
    const finalName = name.trim() || (type === 'tent' ? 'テント' : 'ギア')
    // フィールド中央に配置
    const cx = (layout?.field.widthCm ?? 1000) / 2
    const cy = (layout?.field.heightCm ?? 800) / 2
    addItem(layoutId, {
      name: finalName,
      type,
      shape,
      widthCm: Number(widthCm) || 200,
      heightCm: Number(heightCm) || 200,
      x: cx,
      y: cy,
      rotation: 0,
      color,
      parentId: type === 'gear' ? parentId : null,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80 max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-bold mb-4">新しいアイテム</h2>

        {/* Name */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">名前</label>
          <input
            autoFocus
            type="text"
            placeholder={type === 'tent' ? 'テント' : 'ギア'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Type */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">種類</label>
          <div className="flex gap-2">
            {[{ v: 'tent', l: 'テント' }, { v: 'gear', l: 'ギア' }].map(({ v, l }) => (
              <button
                key={v}
                onClick={() => setType(v)}
                className={`flex-1 text-sm py-1.5 rounded-lg border transition-colors ${
                  type === v
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Shape */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">形状</label>
          <div className="grid grid-cols-3 gap-1.5">
            {SHAPES.map((s) => (
              <button
                key={s.value}
                onClick={() => setShape(s.value)}
                className={`flex flex-col items-center py-2 rounded-lg border text-xs transition-colors ${
                  shape === s.value
                    ? 'bg-green-50 border-green-400 text-green-700'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg leading-none mb-0.5">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Size */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div>
            <label className="text-xs text-gray-500 block mb-1">幅 (cm)</label>
            <input
              type="number"
              min="1"
              value={widthCm}
              onChange={(e) => setWidthCm(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 block mb-1">高さ (cm)</label>
            <input
              type="number"
              min="1"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Color */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">色</label>
          <div className="flex gap-2 mb-1">
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-6 h-6 rounded-full border-2 transition-transform ${
                  color === c ? 'border-gray-700 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-8 rounded cursor-pointer border border-gray-200"
          />
        </div>

        {/* Parent (gear only) */}
        {type === 'gear' && tents.length > 0 && (
          <div className="mb-3">
            <label className="text-xs text-gray-500 block mb-1">配置先</label>
            <select
              value={parentId ?? ''}
              onChange={(e) => setParentId(e.target.value || null)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">フィールド（テント外）</option>
              {tents.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 text-sm text-gray-600 py-2 rounded-lg hover:bg-gray-100"
          >
            キャンセル
          </button>
          <button
            onClick={handleAdd}
            className="flex-1 text-sm bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            追加
          </button>
        </div>
      </div>
    </div>
  )
}
