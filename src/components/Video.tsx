// components/video.tsx
'use client'

import { useEffect, useRef } from 'react'

type VideoProps = {
  ref: React.RefObject<HTMLVideoElement>
  constraints?: MediaTrackConstraints
  className?: string
  width?: number
  height?: number
}

export function Video({
  ref,
  constraints = {
    facingMode: 'user',
    width: 640,
    height: 480,
  },
  className,
  width = 640,
  height = 480,
}: VideoProps) {
  useEffect(() => {
    const initializeCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: constraints,
        })
        if (ref.current) {
          ref.current.srcObject = stream
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
      }
    }

    initializeCamera()

    return () => {
      if (ref.current?.srcObject) {
        const tracks = (ref.current.srcObject as MediaStream).getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [constraints, ref])

  return (
    <video
      ref={ref}
      autoPlay
      playsInline
      width={width}
      height={height}
      className={className}
    />
  )
}
