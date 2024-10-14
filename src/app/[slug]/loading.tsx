'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface LoadingProps {
  message?: string
  timeout?: number
}

export default function Loading({ message = 'Loading...', timeout = 10000 }: LoadingProps) {
  const [showTimeout, setShowTimeout] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTimeout(true)
    }, timeout)

    return () => clearTimeout(timer)
  }, [timeout])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-lg font-medium text-muted-foreground">{message}</p>
      {showTimeout && (
        <p className="mt-2 text-sm text-muted-foreground">
          This is taking longer than expected. Please check your connection and refresh the
          page.
        </p>
      )}
    </div>
  )
}
