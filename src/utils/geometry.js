// 正多角形の頂点座標を計算して返す（Konva の points 形式）
// cx, cy: 中心座標, r: 外接円半径, n: 頂点数
export function polygonPoints(cx, cy, r, n, offsetAngle = 0) {
  const points = []
  for (let i = 0; i < n; i++) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2 + offsetAngle
    points.push(cx + r * Math.cos(angle), cy + r * Math.sin(angle))
  }
  return points
}

// 長方形アイテムの外接円半径（対角線の半分）
export function rectRadius(w, h) {
  return Math.sqrt(w * w + h * h) / 2
}

// アイテム形状ごとの Konva props を生成（px単位）
export function shapeProps(item, pxPerCm) {
  const w = item.widthCm * pxPerCm
  const h = item.heightCm * pxPerCm

  switch (item.shape) {
    case 'rect':
      return { type: 'rect', width: w, height: h, offsetX: w / 2, offsetY: h / 2 }
    case 'triangle':
      return { type: 'polygon', sides: 3, radius: Math.max(w, h) / 2 }
    case 'diamond':
      return { type: 'polygon', sides: 4, radius: Math.max(w, h) / 2 }
    case 'pentagon':
      return { type: 'polygon', sides: 5, radius: Math.max(w, h) / 2 }
    case 'hexagon':
      return { type: 'polygon', sides: 6, radius: Math.max(w, h) / 2 }
    case 'circle':
      return { type: 'circle', radius: Math.max(w, h) / 2 }
    default:
      return { type: 'rect', width: w, height: h, offsetX: w / 2, offsetY: h / 2 }
  }
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10)
}
