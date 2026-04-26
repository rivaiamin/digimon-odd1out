export type HandLayoutItem = {
  transform: string
  zIndex: number
}

type HandLayoutOptions = {
  width: number
  height: number
  cardWidth: number
  cardHeight: number
  /** Match old 3D layout spacing (in "card widths") */
  cardXSpacingPx?: number
  /** Match old 3D layout group Y offset (px, positive down) */
  groupYOffsetPx?: number
}

/**
 * Computes a simple centered row layout, matching the previous Three.js scene:
 * x = (idx - (count-1)/2) * spacing, y = constant.
 */
export function computeHandLayout(
  count: number,
  opts: HandLayoutOptions
): HandLayoutItem[] {
  const { width, height, cardWidth, cardHeight, cardXSpacingPx = 280, groupYOffsetPx = -40 } = opts

  const centerX = width / 2
  const centerY = height / 2 + groupYOffsetPx

  return Array.from({ length: count }, (_, index) => {
    const offsetIndex = index - (count - 1) / 2
    const x = centerX - cardWidth / 2 + offsetIndex * cardXSpacingPx
    const y = centerY - cardHeight / 2

    const transform = `translate(${x}px, ${y}px)`
    const zIndex = 10 + index

    return { transform, zIndex }
  })
}

