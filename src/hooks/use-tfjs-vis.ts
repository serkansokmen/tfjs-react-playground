'use client'

import { useEffect, useRef } from 'react'
import * as tfVis from '@tensorflow/tfjs-vis'
import { Visor } from '@tensorflow/tfjs-vis/dist/visor'

export function useTfjsVis() {
  const visorRef = useRef<Visor | null>(null)

  useEffect(() => {
    if (visorRef.current) {
        visorRef.current = tfVis.visor()
        visorRef.current.open()
    }

    return () => {
      if (visorRef.current) {
        visorRef.current.close()
      }
    }
  }, [])

  return {
    visor: visorRef.current,
    render: tfVis.render,
    show: tfVis.show,
  }
}