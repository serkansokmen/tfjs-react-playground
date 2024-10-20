// tf-body-pix/pages/client.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import * as bodyPix from '@tensorflow-models/body-pix'

import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-core'
import { useEffect, useRef, useState } from 'react'
import Webcam from 'react-webcam'

export default function BodyPixComponent() {
  const [net, setNet] = useState<bodyPix.BodyPix | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    async function loadNet() {
      const loadedNet = await bodyPix.load()
      setNet(loadedNet)
    }
    loadNet()
  }, [])

  const handleEstimatePoses = async () => {
    if (!net || !webcamRef.current || !canvasRef.current) return

    setIsProcessing(true)

    const video = webcamRef.current.video
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
            <Webcam
              ref={webcamRef}
              audio={false}
              width={640}
              height={480}
              screenshotFormat="image/jpeg"
              videoConstraints={{
                width: 640,
                height: 480,
                facingMode: 'user',
              }}
              className="rounded-lg"
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className="absolute top-0 left-0 rounded-lg"
            />
          </div>
          <Button onClick={handleEstimatePoses} disabled={!net || isProcessing}>
            {isProcessing ? 'Processing...' : 'Estimate Poses'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
