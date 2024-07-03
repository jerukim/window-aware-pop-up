import { useCallback, useRef, useState } from 'react'
import clsx from 'clsx'
import { intersects } from '../lib/intersects'
import { observe } from '../lib/observer'

import type { Position, Positions } from '../types'

interface PopupProps extends IntersectionObserverInit {
  anchorPositions?: Positions
  offset?: number
}

// TODO: reposition content along anchor to maximize scroll space before repositioning anchor
// TODO: abstract root
// TODO: abstract trigger
// TODO: abstract portal
// TODO: abstract content
// TODO: abstract anchor

// todo: address scenario where repositioning doesn't happen when threshold is already passed and observer isn't triggered (onScroll or add additional thresholds)

function getPortalStyles(anchorPosition: Position, offset: number) {
  switch (anchorPosition) {
    case 'bottom':
      return {
        top: '100%',
        left: '50%',
        transform: `translate(-50%, ${offset}px)`,
      }
    case 'top':
      return {
        top: `-${offset}px`,
        left: '50%',
        transform: `translate(-50%, -100%)`,
      }
    case 'right':
      return {
        top: '50%',
        left: '100%',
        transform: `translate(${offset}px, -50%)`,
      }
    case 'left':
      return {
        top: '50%',
        left: `-${offset}px`,
        transform: `translate(-100%, -50%)`,
      }
  }
}

export function Popup({
  root,
  threshold = 1.0,
  anchorPositions = ['bottom', 'top', 'right', 'left'],
  offset = 0,
}: PopupProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const unobserveRef = useRef<() => void>()

  const [anchorPosition, setAnchorPosition] = useState(
    anchorPositions[0]
  )
  const [open, setOpen] = useState(false)

  function toggleOpen() {
    setOpen(!open)
  }

  const reposition = useCallback(
    (entry: IntersectionObserverEntry) => {
      const containerRect = rootRef.current?.getBoundingClientRect()

      if (containerRect && entry.rootBounds) {
        for (const anchorPosition of anchorPositions) {
          if (
            intersects(anchorPosition, {
              containerRect,
              contentRect: entry.boundingClientRect,
              windowRect: entry.rootBounds,
              offset,
            })
          ) {
            setAnchorPosition(anchorPosition)
            break
          }
        }
      }
    },
    [anchorPositions, anchorPosition, offset]
  )

  const portalRef = useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        unobserveRef.current = observe(node, reposition, {
          root,
          threshold,
        })
      } else {
        unobserveRef?.current?.()
      }
    },
    [reposition, root, threshold]
  )

  return (
    // Root
    <div ref={rootRef} className="relative">
      {/* Trigger */}
      <button
        className="bg-green-200 border border-green-500 p-4"
        onClick={toggleOpen}
      >
        hello world
      </button>

      {open && (
        // Portal
        <div
          ref={portalRef}
          className="absolute opacity-50 transition-transform"
          style={getPortalStyles(anchorPosition, offset)}
        >
          <div className="relative">
            {/* Content */}
            <div className="size-64 bg-red-200 border border-red-500 grid grid-cols-2" />

            {/* Anchor */}
            <div
              className={clsx(
                'absolute bg-red-200 border border-red-500 size-4 rotate-45 -translate-x-1/2 -translate-y-1/2',
                anchorPosition === 'bottom' && 'top-0 left-1/2',
                anchorPosition === 'left' && 'top-1/2 left-full',
                anchorPosition === 'top' && 'top-full left-1/2',
                anchorPosition === 'right' && 'top-1/2 left-0'
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
