declare module 'lozad' {
  interface LozadOptions {
    root?: Element | null
    rootMargin?: string
    threshold?: number | number[]
    enableAutoReload?: boolean
    load?: (element: Element) => void
    loaded?: (element: Element) => void
  }

  interface LozadObserver {
    observe: () => void
    triggerLoad: (element: Element) => void
  }

  export default function lozad(selector?: string | Element | Element[], options?: LozadOptions): LozadObserver
}
