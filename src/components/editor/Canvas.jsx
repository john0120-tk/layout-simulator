import { useRef, useEffect, useCallback, useState } from 'react'
import { Stage, Layer, Rect, RegularPolygon, Circle, Text, Line, Group } from 'react-konva'
import useStore from '../../store/useStore'

const GRID_STEP_CM = 100  // グリッド間隔 100cm
const SNAP_THRESHOLD = 20  // スナップ距離（px）

function calcPxPerCm(canvasW, canvasH, fieldW, fieldH) {
  const margin = 40
  const scaleX = (canvasW - margin * 2) / fieldW
  const scaleY = (canvasH - margin * 2) / fieldH
  return Math.min(scaleX, scaleY)
}

export default function Canvas({ layoutId, tool, stageRef }) {
  const containerRef = useRef(null)
  const internalStageRef = useRef(null)
  // 親からstageRefが渡された場合はそちらを優先（エクスポート用）
  const resolvedStageRef = stageRef ?? internalStageRef
  const [size, setSize] = useState({ w: 800, h: 600 })

  const layout = useStore((s) => s.getLayout(layoutId))
  const selectedItemId = useStore((s) => s.selectedItemId)
  const selectItem = useStore((s) => s.selectItem)
  const updateItem = useStore((s) => s.updateItem)
  const displayOptions = useStore((s) => s.displayOptions)

  // expose stageRef to parent via layout effect
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  if (!layout) return null

  const { field, items } = layout
  const pxPerCm = calcPxPerCm(size.w, size.h, field.widthCm, field.heightCm)
  const fieldPxW = field.widthCm * pxPerCm
  const fieldPxH = field.heightCm * pxPerCm
  const offsetX = (size.w - fieldPxW) / 2
  const offsetY = (size.h - fieldPxH) / 2

  function cmToPx(cm) { return cm * pxPerCm }

  function snapIfNeeded(xCm, yCm) {
    if (!displayOptions.snapToGrid) return { xCm, yCm }
    const snapped = (v) => Math.round(v / GRID_STEP_CM) * GRID_STEP_CM
    return { xCm: snapped(xCm), yCm: snapped(yCm) }
  }

  function handleItemDragEnd(item, e) {
    const node = e.target
    // Konva の x/y はステージ上の座標 → cm に変換
    const xPx = node.x() - offsetX
    const yPx = node.y() - offsetY
    const { xCm, yCm } = snapIfNeeded(xPx / pxPerCm, yPx / pxPerCm)
    updateItem(layoutId, item.id, { x: xCm, y: yCm })
  }

  function handleRotationEnd(item, e) {
    updateItem(layoutId, item.id, { rotation: e.target.rotation() })
  }

  // グリッドライン描画データ
  const gridLines = []
  if (displayOptions.showGrid) {
    for (let x = 0; x <= field.widthCm; x += GRID_STEP_CM) {
      gridLines.push({ x1: x, y1: 0, x2: x, y2: field.heightCm })
    }
    for (let y = 0; y <= field.heightCm; y += GRID_STEP_CM) {
      gridLines.push({ x1: 0, y1: y, x2: field.widthCm, y2: y })
    }
  }

  return (
    <div ref={containerRef} className="flex-1 bg-gray-100 overflow-hidden relative">
      <Stage
        ref={resolvedStageRef}
        width={size.w}
        height={size.h}
        onClick={(e) => {
          // 空白クリックで選択解除
          if (e.target === e.target.getStage()) selectItem(null)
        }}
      >
        {/* Field layer */}
        <Layer>
          {/* Field background */}
          <Rect
            x={offsetX}
            y={offsetY}
            width={fieldPxW}
            height={fieldPxH}
            fill="#f0fdf4"
            stroke="#86efac"
            strokeWidth={2}
          />

          {/* Grid lines */}
          {gridLines.map((l, i) => (
            <Line
              key={i}
              points={[
                offsetX + cmToPx(l.x1), offsetY + cmToPx(l.y1),
                offsetX + cmToPx(l.x2), offsetY + cmToPx(l.y2),
              ]}
              stroke="#bbf7d0"
              strokeWidth={0.5}
            />
          ))}

          {/* Grid labels */}
          {displayOptions.showGrid && (
            <>
              {Array.from({ length: Math.floor(field.widthCm / GRID_STEP_CM) + 1 }, (_, i) => i * GRID_STEP_CM).map((x) => (
                <Text
                  key={`gx-${x}`}
                  x={offsetX + cmToPx(x) - 15}
                  y={offsetY - 16}
                  text={`${x}cm`}
                  fontSize={9}
                  fill="#86efac"
                  width={30}
                  align="center"
                />
              ))}
              {Array.from({ length: Math.floor(field.heightCm / GRID_STEP_CM) + 1 }, (_, i) => i * GRID_STEP_CM).map((y) => (
                <Text
                  key={`gy-${y}`}
                  x={offsetX - 38}
                  y={offsetY + cmToPx(y) - 5}
                  text={`${y}cm`}
                  fontSize={9}
                  fill="#86efac"
                  width={35}
                  align="right"
                />
              ))}
            </>
          )}

          {/* Field dimension label */}
          {displayOptions.showDimensionLabels && (
            <Text
              x={offsetX}
              y={offsetY + fieldPxH + 6}
              text={`${field.widthCm}cm × ${field.heightCm}cm`}
              fontSize={11}
              fill="#6b7280"
            />
          )}
        </Layer>

        {/* Items layer */}
        <Layer>
          {items.map((item) => (
            <CanvasItem
              key={item.id}
              item={item}
              selected={selectedItemId === item.id}
              pxPerCm={pxPerCm}
              offsetX={offsetX}
              offsetY={offsetY}
              draggable={tool === 'select'}
              showLabel={displayOptions.showDimensionLabels}
              onSelect={() => selectItem(item.id)}
              onDragEnd={(e) => handleItemDragEnd(item, e)}
              onRotationEnd={(e) => handleRotationEnd(item, e)}
              onUpdate={(patch) => updateItem(layoutId, item.id, patch)}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  )
}

function CanvasItem({ item, selected, pxPerCm, offsetX, offsetY, draggable, showLabel, onSelect, onDragEnd, onUpdate }) {
  const groupRef = useRef(null)
  const w = item.widthCm * pxPerCm
  const h = item.heightCm * pxPerCm
  const x = offsetX + item.x * pxPerCm
  const y = offsetY + item.y * pxPerCm

  const commonProps = {
    fill: item.color + 'cc',  // 80% opacity
    stroke: selected ? '#166534' : item.color,
    strokeWidth: selected ? 2 : 1,
  }

  function renderShape() {
    switch (item.shape) {
      case 'rect':
        return <Rect {...commonProps} width={w} height={h} offsetX={w / 2} offsetY={h / 2} />
      case 'triangle':
        return <RegularPolygon {...commonProps} sides={3} radius={Math.max(w, h) / 2} />
      case 'diamond':
        return <RegularPolygon {...commonProps} sides={4} radius={Math.max(w, h) / 2} />
      case 'pentagon':
        return <RegularPolygon {...commonProps} sides={5} radius={Math.max(w, h) / 2} />
      case 'hexagon':
        return <RegularPolygon {...commonProps} sides={6} radius={Math.max(w, h) / 2} />
      case 'circle':
        return <Circle {...commonProps} radius={Math.max(w, h) / 2} />
      default:
        return <Rect {...commonProps} width={w} height={h} offsetX={w / 2} offsetY={h / 2} />
    }
  }

  const labelSize = 10
  const radius = Math.max(w, h) / 2

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      rotation={item.rotation}
      draggable={draggable}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={onDragEnd}
      onTransformEnd={(e) => {
        // react-konva Transform は未使用。回転はハンドルUIで対応。
        onUpdate({ rotation: e.target.rotation() })
      }}
    >
      {renderShape()}

      {/* Item name label */}
      <Text
        text={item.name}
        fontSize={Math.max(9, Math.min(12, w / 8))}
        fill="#1f2937"
        width={item.shape === 'rect' ? w : radius * 2}
        align="center"
        offsetX={item.shape === 'rect' ? w / 2 : radius}
        offsetY={6}
      />

      {/* Dimension label */}
      {showLabel && (
        <Text
          text={`${item.widthCm}×${item.heightCm}cm`}
          fontSize={8}
          fill="#6b7280"
          width={item.shape === 'rect' ? w : radius * 2}
          align="center"
          offsetX={item.shape === 'rect' ? w / 2 : radius}
          y={8}
        />
      )}

      {/* Selection indicator: rotation handle */}
      {selected && (
        <RotationHandle
          radius={Math.max(w, h) / 2 + 16}
          onRotate={(angle) => onUpdate({ rotation: angle })}
          currentRotation={item.rotation}
        />
      )}
    </Group>
  )
}

function RotationHandle({ radius, onRotate, currentRotation }) {
  const handleY = -radius - 16

  return (
    <>
      {/* Line from center to handle */}
      <Line
        points={[0, 0, 0, handleY]}
        stroke="#166534"
        strokeWidth={1}
        dash={[3, 3]}
      />
      {/* Handle circle */}
      <Circle
        x={0}
        y={handleY}
        radius={6}
        fill="#166534"
        draggable
        onDragMove={(e) => {
          const node = e.target
          const parent = node.getParent()
          const pos = node.getAbsolutePosition()
          const parentPos = parent.getAbsolutePosition()
          const dx = pos.x - parentPos.x
          const dy = pos.y - parentPos.y
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI + 90
          onRotate(angle)
          // ハンドルを円上に固定
          node.position({ x: 0, y: handleY })
        }}
        onDragEnd={(e) => e.target.position({ x: 0, y: handleY })}
      />
    </>
  )
}
