import { useEffect } from 'react'
import lozad from 'lozad'

export function useLozad(selector = '.lozad', dependency?: string) {
  useEffect(() => {
    const observer = lozad(selector, {
      rootMargin: '120px 0px',
      threshold: 0.1,
      loaded: (element: Element) => {
        element.classList.add('lozad-loaded')
      },
    })

    observer.observe()
  }, [dependency, selector])
}
