import useStore from '../../store/useStore'

export default function Toolbar({ layoutId, onAddItem, tool, onToolChange }) {
  const selectedItemId = useStore((s) => s.selectedItemId)
  const duplicateItem = useStore((s) => s.duplicateItem)
  const deleteItem = useStore((s) => s.deleteItem)
  const selectItem = useStore((s) => s.selectItem)

  return (
    <footer className="h-12 bg-white border-t border-gray-200 flex items-center px-4 gap-2 shrink-0">
      {/* Add item - primary action */}
      <button
        onClick={onAddItem}
        className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors font-medium"
      >
        + アイテム追加
      </button>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      {/* Tool modes */}
      <ToolButton active={tool === 'select'} onClick={() => onToolChange('select')} title="選択・移動">
        ↖ 選択
      </ToolButton>
      <ToolButton active={tool === 'measure'} onClick={() => onToolChange('measure')} title="距離計測">
        ↔ 計測
      </ToolButton>

      <span className="w-px h-5 bg-gray-200 mx-1" />

      {/* Item shortcuts (visible when item selected) */}
      {selectedItemId && (
        <>
          <button
            onClick={() => duplicateItem(layoutId, selectedItemId)}
            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            複製
          </button>
          <button
            onClick={() => {
              deleteItem(layoutId, selectedItemId)
              selectItem(null)
            }}
            className="text-xs px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
          >
            削除
          </button>
        </>
      )}
    </footer>
  )
}

function ToolButton({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
        active
          ? 'bg-green-100 text-green-700 font-medium'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  )
}
