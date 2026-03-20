'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export default function ExitGameHandler() {
  const router = useRouter()
  const pathname = usePathname()

  const excludedPaths = ['/game/records']

  useEffect(() => {
    if (excludedPaths.includes(pathname)) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        router.push('/game')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, pathname])

  return null
}
