import { useCallback, useRef, useState } from 'react'
import clsx from 'clsx'
import { intersects } from '../lib/intersects'

import type { Positions } from '../types'
import { observe } from '../lib/observer'

interface PopupProps extends IntersectionObserverInit {
  anchorPositions?: Positions
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
  rootMargin,
  anchorPositions = ['bottom', 'top', 'right', 'left'],
}: PopupProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const cleanupRef = useRef<() => void>()

  const [open, setOpen] = useState(false)
  const [anchorPosition, setAnchorPosition] = useState(
    anchorPositions[0]
  )

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
              offset: 16,
            })
          ) {
            setAnchorPosition(anchorPosition)
            break
          }
        }
      }
    },
    [anchorPositions, anchorPosition]
  )

  const portalRef = useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        cleanupRef.current = observe(node, reposition, {
          root,
          rootMargin,
          threshold,
        })
      } else {
        cleanupRef?.current?.()
      }
    },
    [reposition, root, rootMargin, threshold]
  )

  return (
    // Root
    <div className="relative" ref={rootRef}>
      {/* Trigger */}
      <button
        className="bg-green-200 border border-green-500 p-4"
        onClick={() => setOpen((open) => !open)}
      >
        hello world
      </button>

      {open && (
        // Portal
        <div
          className={clsx(
            'absolute opacity-50 transition-transform',
            anchorPosition === 'bottom' &&
              'top-full left-1/2 -translate-x-1/2 translate-y-4 ',
            anchorPosition === 'left' &&
              'top-1/2 -left-4 -translate-x-full -translate-y-1/2',
            anchorPosition === 'top' &&
              '-top-4 left-1/2 -translate-x-1/2 -translate-y-full ',
            anchorPosition === 'right' &&
              'top-1/2 left-full translate-x-4 -translate-y-1/2'
          )}
          ref={portalRef}
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
