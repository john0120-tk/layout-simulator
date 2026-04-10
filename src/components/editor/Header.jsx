import { useNavigate } from 'react-router-dom'
import useStore from '../../store/useStore'

export default function Header({ layoutId, stageRef }) {
  const navigate = useNavigate()
  const layout = useStore((s) => s.getLayout(layoutId))
  const renameLayout = useStore((s) => s.renameLayout)

  function handleExport() {
    if (!stageRef.current) return
    const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = `${layout?.name ?? 'layout'}.png`
    link.href = dataUrl
    link.click()
  }

  function handleRename(e) {
    const val = e.target.value.trim()
    if (val) renameLayout(layoutId, val)
  }

  return (
    <header className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-3 shrink-0 z-10">
      <button
        onClick={() => navigate('/')}
        className="text-gray-500 hover:text-gray-800 text-sm flex items-center gap-1"
      >
        ← 一覧
      </button>
      <span className="text-gray-300">|</span>
      <input
        type="text"
        defaultValue={layout?.name ?? ''}
        onBlur={handleRename}
        onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
        className="text-sm font-medium text-gray-800 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-green-500 outline-none px-1 w-48"
      />
      <div className="ml-auto flex gap-2">
        <button
          onClick={handleExport}
          className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700 transition-colors"
        >
          エクスポート
        </button>
      </div>
    </header>
  )
}
