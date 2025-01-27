// tf-body-pix/pages/client.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as bodyPix from '@tensorflow-models/body-pix'

import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-core'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Video } from '@/components/Video'

export default function BodyPixComponent() {
  const [net, setNet] = useState<bodyPix.BodyPix | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [imgSrc, setImgSrc] = useState(null)
  const webcamRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function loadNet() {
      const loadedNet = await bodyPix.load()
      setNet(loadedNet)
    }
    loadNet()
  }, [])

  const handleCapture = useCallback(async () => {
    if (!net || !webcamRef.current || !canvasRef.current) return

    setIsProcessing(true)

    const video = webcamRef.current
    if (!video) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const segmentation = await net.segmentPerson(video)
    const coloredPartImage = bodyPix.toColoredPartMask(segmentation as any)

    const opacity = 0.7
    const flipHorizontal = false
    const maskBlurAmount = 0
    bodyPix.drawMask(
      canvas,
      video,
      coloredPartImage,
      opacity,
      maskBlurAmount,
      flipHorizontal
    )

    setIsProcessing(false)
  }, [webcamRef])

  const handleReset = () => {
    setImgSrc(null)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tensorflow Playground / Body Pix</h1>
      <Card>
        <CardHeader>
          <CardTitle>Body Segmentation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Video
              ref={webcamRef as any}
              width={640}
              height={480}
              constraints={{
                facingMode: 'user',
                width: 640,
                height: 480,
              }}
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute top-0 left-0 rounded-lg"
            />
          </div>
          {imgSrc ? (
            <Button variant="outline" onClick={handleReset}>
              Retake
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleCapture}
              disabled={!net || isProcessing}
            >
              Capture
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
