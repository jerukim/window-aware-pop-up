// CREDIT: https://github.com/thebuilder/react-intersection-observer/blob/main/src/observe.ts

type ObserverInstanceCallback = (
  entry: IntersectionObserverEntry
) => void

const observerMap = new Map<
  string,
  {
    id: string
    observer: IntersectionObserver
    elements: Map<Element, Array<ObserverInstanceCallback>>
  }
>()

const RootIds: WeakMap<Element | Document, string> = new WeakMap()
let rootId = 0

/**
 * Generate a unique ID for the root element
 * @param root
 */
function getRootId(root: IntersectionObserverInit['root']) {
  if (!root) return '0'
  if (RootIds.has(root)) return RootIds.get(root)
  rootId += 1
  RootIds.set(root, rootId.toString())
  return RootIds.get(root)
}

/**
 * Convert the options to a string Id, based on the values.
 * Ensures we can reuse the same observer when observing elements with the same options.
 * @param options
 */
export function optionsToId(options: IntersectionObserverInit) {
  return Object.keys(options)
    .sort()
    .filter(
      (key) =>
        options[key as keyof IntersectionObserverInit] !== undefined
    )
    .map((key) => {
      return `${key}_${
        key === 'root'
          ? getRootId(options.root)
          : options[key as keyof IntersectionObserverInit]
      }`
    })
    .toString()
}

function createObserver(options: IntersectionObserverInit) {
  // Create a unique ID for this observer instance, based on the root, root margin and threshold.
  const id = optionsToId(options)
  let instance = observerMap.get(id)

  if (!instance) {
    // Create a map of elements this observer is going to observe. Each element has a list of callbacks that should be triggered, once it comes into view.
    const elements = new Map<
      Element,
      Array<ObserverInstanceCallback>
    >()

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        elements.get(entry.target)?.forEach((callback) => {
          callback(entry)
        })
      })
    }, options)

    instance = {
      id,
      observer,
      elements,
    }

    observerMap.set(id, instance)
  }

  return instance
}

/**
 * @param element - DOM Element to observe
 * @param callback - Callback function to trigger when intersection status changes
 * @param options - Intersection Observer options
 * @return Function - Cleanup function that should be triggered to unregister the observer
 */
export function observe(
  element: Element,
  callback: ObserverInstanceCallback,
  options: IntersectionObserverInit = {}
) {
  if (typeof window.IntersectionObserver === 'undefined') {
    const bounds = element.getBoundingClientRect()
    callback({
      isIntersecting: true,
      target: element,
      intersectionRatio:
        typeof options.threshold === 'number' ? options.threshold : 0,
      time: 0,
      boundingClientRect: bounds,
      intersectionRect: bounds,
      rootBounds: bounds,
    })

    return () => {} // Nothing to cleanup
  }
  // An observer with the same options can be reused, so lets use this fact
  const { id, observer, elements } = createObserver(options)

  // Register the callback listener for this element
  const callbacks = elements.get(element) || []
  if (!elements.has(element)) {
    elements.set(element, callbacks)
  }

  callbacks.push(callback)
  observer.observe(element)

  return function unobserve() {
    // Remove the callback from the callback list
    callbacks.splice(callbacks.indexOf(callback), 1)

    if (callbacks.length === 0) {
      // No more callback exists for element, so destroy it
      elements.delete(element)
      observer.unobserve(element)
    }

    if (elements.size === 0) {
      // No more elements are being observer by this instance, so destroy it
      observer.disconnect()
      observerMap.delete(id)
    }
  }
}
