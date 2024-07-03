import type { Position } from '../types'

type IntersectsOptions = {
  containerRect: DOMRect
  contentRect: DOMRect
  windowRect: DOMRect
  offset?: number
}

export function intersects(
  position: Position,
  {
    containerRect,
    contentRect,
    windowRect,
    offset = 0,
  }: IntersectsOptions
) {
  const containerMidX = containerRect.left + containerRect.width / 2
  const containerMidY = containerRect.top + containerRect.height / 2
  const contentHalfWidth = contentRect.width / 2
  const intersectsX =
    containerMidX - contentHalfWidth >= windowRect.left &&
    containerMidX + contentHalfWidth <= windowRect.right
  const intersectsY =
    containerMidY - contentHalfWidth >= windowRect.top &&
    containerMidY + contentHalfWidth <= windowRect.bottom

  switch (position) {
    case 'bottom':
      return (
        containerRect.bottom + offset + contentRect.height <=
          windowRect.bottom && intersectsX
      )
    case 'top':
      return (
        containerRect.top - offset - contentRect.height >=
          windowRect.top && intersectsX
      )
    case 'right':
      return (
        containerRect.right + offset + contentRect.width <=
          windowRect.right && intersectsY
      )
    case 'left':
      return (
        containerRect.left - offset - contentRect.width >=
          windowRect.left && intersectsY
      )
  }
}
