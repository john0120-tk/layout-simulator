import { useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import Header from '../components/editor/Header'
import LayerPanel from '../components/editor/LayerPanel'
import Canvas from '../components/editor/Canvas'
import PropertiesPanel from '../components/editor/PropertiesPanel'
import Toolbar from '../components/editor/Toolbar'
import AddItemDialog from '../components/editor/AddItemDialog'

export default function EditorPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const stageRef = useRef(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [tool, setTool] = useState('select')

  const layout = useStore((s) => s.getLayout(id))

  if (!layout) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-lg mb-4">レイアウトが見つかりません</p>
          <button
            onClick={() => navigate('/')}
            className="text-green-600 hover:underline"
          >
            一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      <Header layoutId={id} stageRef={stageRef} />

      <div className="flex flex-1 overflow-hidden">
        <LayerPanel layoutId={id} />
        <Canvas layoutId={id} tool={tool} stageRef={stageRef} />
        <PropertiesPanel layoutId={id} />
      </div>

      <Toolbar
        layoutId={id}
        tool={tool}
        onToolChange={setTool}
        onAddItem={() => setShowAddDialog(true)}
      />

      {showAddDialog && (
        <AddItemDialog
          layoutId={id}
          onClose={() => setShowAddDialog(false)}
        />
      )}
    </div>
  )
}
