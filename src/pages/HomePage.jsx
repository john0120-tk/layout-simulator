import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'

export default function HomePage() {
  const { layouts, addLayout, deleteLayout, renameLayout } = useStore()
  const navigate = useNavigate()
  const [showNewDialog, setShowNewDialog] = useState(false)
  const [newName, setNewName] = useState('')
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')

  function handleCreate() {
    const name = newName.trim() || '新しいレイアウト'
    const id = addLayout(name)
    setShowNewDialog(false)
    setNewName('')
    navigate(`/editor/${id}`)
  }

  function handleRenameSubmit(id) {
    if (renameValue.trim()) renameLayout(id, renameValue.trim())
    setRenamingId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Layout Simulator</h1>
        <button
          onClick={() => setShowNewDialog(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          + 新規レイアウト
        </button>
      </header>

      {/* Layout Grid */}
      <main className="px-6 py-8">
        {layouts.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-4xl mb-4">🏕️</p>
            <p className="text-lg font-medium">レイアウトがありません</p>
            <p className="text-sm mt-1">「+ 新規レイアウト」から作成してください</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {layouts.map((layout) => (
              <LayoutCard
                key={layout.id}
                layout={layout}
                renamingId={renamingId}
                renameValue={renameValue}
                onOpen={() => navigate(`/editor/${layout.id}`)}
                onRenameStart={() => {
                  setRenamingId(layout.id)
                  setRenameValue(layout.name)
                }}
                onRenameChange={setRenameValue}
                onRenameSubmit={() => handleRenameSubmit(layout.id)}
                onDelete={() => deleteLayout(layout.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* New Layout Dialog */}
      {showNewDialog && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-80">
            <h2 className="text-lg font-bold mb-4">新しいレイアウト</h2>
            <input
              autoFocus
              type="text"
              placeholder="レイアウト名"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowNewDialog(false); setNewName('') }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                作成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function LayoutCard({
  layout, renamingId, renameValue,
  onOpen, onRenameStart, onRenameChange, onRenameSubmit, onDelete,
}) {
  const isRenaming = renamingId === layout.id
  const updatedDate = new Date(layout.updatedAt).toLocaleDateString('ja-JP')

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      {/* Thumbnail area */}
      <div
        onClick={onOpen}
        className="h-32 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center cursor-pointer"
      >
        <span className="text-4xl">🏕️</span>
      </div>

      {/* Footer */}
      <div className="p-3">
        {isRenaming ? (
          <input
            autoFocus
            type="text"
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onRenameSubmit(); if (e.key === 'Escape') onRenameSubmit() }}
            onBlur={onRenameSubmit}
            className="w-full text-sm font-medium border-b border-green-500 outline-none pb-0.5"
          />
        ) : (
          <p className="text-sm font-medium text-gray-800 truncate">{layout.name}</p>
        )}
        <p className="text-xs text-gray-400 mt-0.5">{updatedDate}</p>

        {/* Actions */}
        <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onOpen}
            className="flex-1 text-xs bg-green-600 text-white rounded py-1 hover:bg-green-700"
          >
            開く
          </button>
          <button
            onClick={onRenameStart}
            className="text-xs px-2 bg-gray-100 text-gray-600 rounded py-1 hover:bg-gray-200"
          >
            名前変更
          </button>
          <button
            onClick={() => { if (confirm(`「${layout.name}」を削除しますか？`)) onDelete() }}
            className="text-xs px-2 bg-red-50 text-red-500 rounded py-1 hover:bg-red-100"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}
