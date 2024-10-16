'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  errorInstance,
  reset,
}: {
  errorInstance: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error(errorInstance)
  }, [errorInstance])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong!</h2>
      <Button onClick={() => reset()}>Try again</Button>
    </div>
  )
}
