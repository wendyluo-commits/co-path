/**
 * 平面单应性：用 4 对对应点把「摄像头归一化平面上的点」映射到屏幕像素。
 * 源点顺序：左上、右上、右下、左下（与目标矩形角点一一对应）。
 */

export type Point2 = { x: number; y: number };

const EPS = 1e-10;

/** 8×8 高斯消元解 Ax=b */
function solve8(A: number[][], b: number[]): number[] | null {
  const n = 8;
  const M: number[][] = A.map((row, i) => [...row, b[i]!]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r]![col]!) > Math.abs(M[pivot]![col]!)) pivot = r;
    }
    if (Math.abs(M[pivot]![col]!) < EPS) return null;
    if (pivot !== col) {
      const tmp = M[col]!;
      M[col] = M[pivot]!;
      M[pivot] = tmp;
    }
    const div = M[col]![col]!;
    for (let j = col; j <= n; j++) M[col]![j]! /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = M[r]![col]!;
      if (Math.abs(f) < EPS) continue;
      for (let j = col; j <= n; j++) M[r]![j]! -= f * M[col]![j]!;
    }
  }
  return M.map(row => row[n] as number);
}

/**
 * 由 4 对点求 3×3 单应矩阵（行优先 h0..h8，h8=1），满足
 * (x',y') ~ H * (x,y,1)
 */
export function computeHomographyFrom4Pairs(
  src: [Point2, Point2, Point2, Point2],
  dst: [Point2, Point2, Point2, Point2]
): number[] | null {
  const A: number[][] = Array.from({ length: 8 }, () => Array(8).fill(0));
  const b: number[] = Array(8).fill(0);
  for (let i = 0; i < 4; i++) {
    const { x, y } = src[i]!;
    const { x: u, y: v } = dst[i]!;
    A[2 * i] = [x, y, 1, 0, 0, 0, -u * x, -u * y];
    b[2 * i] = u;
    A[2 * i + 1] = [0, 0, 0, x, y, 1, -v * x, -v * y];
    b[2 * i + 1] = v;
  }
  const h = solve8(A, b);
  if (!h) return null;
  return [...h, 1];
}

/** 应用单应：p 为源平面齐次坐标前的 (x,y) */
export function applyHomography(H: number[], p: Point2): Point2 {
  const [h0, h1, h2, h3, h4, h5, h6, h7, h8] = H;
  const { x, y } = p;
  const w = h6 * x + h7 * y + h8;
  if (Math.abs(w) < EPS) return { x: NaN, y: NaN };
  return {
    x: (h0 * x + h1 * y + h2) / w,
    y: (h3 * x + h4 * y + h5) / w
  };
}

/** 单位正方形 → 轴对齐矩形 的 H（用于未标定时的默认映射） */
export function homographyUnitSquareToRect(rect: DOMRect): number[] {
  const src: [Point2, Point2, Point2, Point2] = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 0, y: 1 }
  ];
  const dst: [Point2, Point2, Point2, Point2] = [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.right, y: rect.bottom },
    { x: rect.left, y: rect.bottom }
  ];
  return computeHomographyFrom4Pairs(src, dst) ?? [
    rect.width,
    0,
    rect.left,
    0,
    rect.height,
    rect.top,
    0,
    0,
    1
  ];
}
