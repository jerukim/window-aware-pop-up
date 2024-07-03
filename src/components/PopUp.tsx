import { useCallback, useRef, useState } from 'react'
import clsx from 'clsx'
import { intersects } from '../lib/intersects'

import type { Positions } from '../types'
import { observe } from '../lib/observer'

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
          className={clsx(
            'absolute opacity-50 transition-transform',
            anchorPosition === 'bottom' && `top-full left-1/2`,
            anchorPosition === 'left' &&
              `top-1/2 -translate-x-full -translate-y-1/2`,
            anchorPosition === 'top' &&
              `left-1/2 -translate-x-1/2 -translate-y-full`,
            anchorPosition === 'right' &&
              `top-1/2 left-full translate-x-[${offset}px] -translate-y-1/2`
          )}
          style={{
            ...(anchorPosition === 'bottom' && {
              transform: `translate(-50%, ${offset}px)`,
            }),
            ...(anchorPosition === 'left' && {
              left: `-${offset}px`,
            }),
            ...(anchorPosition === 'top' && {
              top: `-${offset}px`,
            }),
            ...(anchorPosition === 'right' && {
              transform: `translate(${offset}px, -50%)`,
            }),
          }}
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
