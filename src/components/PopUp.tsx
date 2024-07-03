import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import clsx from 'clsx'
import { intersects } from '../lib/intersects'

import type { Positions } from '../types'

interface PopupProps extends IntersectionObserverInit {
  anchorPositions?: Positions
}

export function Popup({
  root,
  anchorPositions = ['bottom', 'top', 'right', 'left'],
}: PopupProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  function toggleOpen() {
    setOpen((open) => !open)
  }

  const [anchorPosition, setAnchorPosition] = useState(
    anchorPositions[0]
  )

  const observer = useMemo<IntersectionObserver>(() => {
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const containerRect =
            containerRef.current?.getBoundingClientRect()

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
        })
      },
      {
        root,
        threshold: 1.0,
      }
    )
  }, [root, anchorPosition, anchorPositions])

  const contentRef = useCallback(
    (node: HTMLDivElement) => {
      if (node) {
        observer.observe(node)
      } else {
        observer.disconnect()
      }
    },
    [observer]
  )

  useEffect(() => {
    return () => observer.disconnect()
  }, [observer])

  return (
    <div className="relative" ref={containerRef}>
      <button
        className="bg-green-200 border border-green-500 p-4"
        onClick={toggleOpen}
      >
        hello world
      </button>

      {open && (
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
          ref={contentRef}
        >
          <div className="relative">
            <div className="size-64 bg-red-200 border border-red-500 grid grid-cols-2" />
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
