import useStore from '../../store/useStore'

export default function LayerPanel({ layoutId }) {
  const layout = useStore((s) => s.getLayout(layoutId))
  const selectedItemId = useStore((s) => s.selectedItemId)
  const selectItem = useStore((s) => s.selectItem)
  const deleteItem = useStore((s) => s.deleteItem)
  const duplicateItem = useStore((s) => s.duplicateItem)
  const updateItem = useStore((s) => s.updateItem)

  if (!layout) return null

  const tents = layout.items.filter((it) => it.type === 'tent')
  const gearOnField = layout.items.filter((it) => it.type === 'gear' && !it.parentId)

  function handleContextMenu(e, item) {
    e.preventDefault()
  }

  return (
    <aside className="w-52 bg-white border-r border-gray-200 flex flex-col shrink-0 overflow-hidden">
      <div className="px-3 py-2 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">レイヤー</span>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {/* Field root */}
        <div className="px-3 py-1">
          <span className="text-xs font-medium text-gray-400">▼ フィールド</span>
        </div>

        {/* Tents */}
        {tents.map((tent) => {
          const gearInTent = layout.items.filter((it) => it.parentId === tent.id)
          return (
            <div key={tent.id}>
              <LayerItem
                item={tent}
                indent={1}
                selected={selectedItemId === tent.id}
                onSelect={() => selectItem(tent.id)}
                onDelete={() => deleteItem(layoutId, tent.id)}
                onDuplicate={() => duplicateItem(layoutId, tent.id)}
              />
              {gearInTent.map((gear) => (
                <LayerItem
                  key={gear.id}
                  item={gear}
                  indent={2}
                  selected={selectedItemId === gear.id}
                  onSelect={() => selectItem(gear.id)}
                  onDelete={() => deleteItem(layoutId, gear.id)}
                  onDuplicate={() => duplicateItem(layoutId, gear.id)}
                />
              ))}
            </div>
          )
        })}

        {/* Gear on field (no parent) */}
        {gearOnField.map((gear) => (
          <LayerItem
            key={gear.id}
            item={gear}
            indent={1}
            selected={selectedItemId === gear.id}
            onSelect={() => selectItem(gear.id)}
            onDelete={() => deleteItem(layoutId, gear.id)}
            onDuplicate={() => duplicateItem(layoutId, gear.id)}
          />
        ))}

        {layout.items.length === 0 && (
          <p className="text-xs text-gray-400 px-3 py-4 text-center">アイテムなし</p>
        )}
      </div>
    </aside>
  )
}

function LayerItem({ item, indent, selected, onSelect, onDelete, onDuplicate }) {
  const shapeIcon = {
    rect: '■', triangle: '▲', diamond: '◆', pentagon: '⬠', hexagon: '⬡', circle: '●',
  }[item.shape] ?? '■'

  return (
    <div
      onClick={onSelect}
      className={`flex items-center gap-1.5 px-2 py-1 cursor-pointer text-xs group rounded mx-1
        ${selected ? 'bg-green-50 text-green-700' : 'text-gray-700 hover:bg-gray-50'}`}
      style={{ paddingLeft: `${indent * 12}px` }}
    >
      <span style={{ color: item.color }} className="shrink-0">{shapeIcon}</span>
      <span className="truncate flex-1">{item.name}</span>
      <div className="hidden group-hover:flex gap-0.5 shrink-0">
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate() }}
          className="text-gray-400 hover:text-gray-600 px-0.5"
          title="複製"
        >⎘</button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="text-red-400 hover:text-red-600 px-0.5"
          title="削除"
        >✕</button>
      </div>
    </div>
  )
}
