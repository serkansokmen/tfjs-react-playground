// tf-coco-ssd/pages/client.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-core'
import { useCallback, useEffect, useReducer, useRef } from 'react'
import { Group, Layer, Rect, Stage, Text } from 'react-konva'
import { Video } from '@/components/Video'

interface State {
  isReady: boolean
  isTrackingEnabled: boolean
  updateMilis: number
  predictions: cocoSsd.DetectedObject[]
  videoConstraints: {
    width: number
    height: number
    facingMode: string
  }
}

type Action =
  | { type: 'setReady' }
  | { type: 'setIsTrackingEnabled'; payload: boolean }
  | { type: 'setUpdateMilis'; payload: number }
  | { type: 'setPredictions'; payload: cocoSsd.DetectedObject[] }

const initialState: State = {
  isReady: false,
  isTrackingEnabled: false,
  updateMilis: 300,
  predictions: [],
  videoConstraints: {
    width: 640,
    height: 480,
    facingMode: 'user',
  },
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setReady':
      return { ...state, isReady: true }
    case 'setIsTrackingEnabled':
      return { ...state, isTrackingEnabled: action.payload }
    case 'setUpdateMilis':
      return { ...state, updateMilis: action.payload }
    case 'setPredictions':
      return { ...state, predictions: action.payload }
    default:
      throw new Error('Unexpected action')
  }
}

export default function TfCocoSsd() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const net = useRef<cocoSsd.ObjectDetection | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  async function loadNet() {
    net.current = await cocoSsd.load()
    dispatch({ type: 'setReady' })
  }

  useEffect(() => {
    loadNet()
  }, [])

  useEffect(() => {
    if (!state.isTrackingEnabled) {
      dispatch({ type: 'setPredictions', payload: [] })
    }
  }, [state.isTrackingEnabled])

  const predict = useCallback(async () => {
    if (net.current && videoRef.current) {
      const predictions = await net.current.detect(videoRef.current)
      dispatch({ type: 'setPredictions', payload: predictions })
    }
  }, [])

  const renderRect = useCallback((prediction: cocoSsd.DetectedObject, key: number) => {
    const [x, y, width, height] = prediction.bbox
    return (
      <Group x={x} y={y} key={key}>
        <Rect width={width} height={height} fill="transparent" stroke="#00ff00" />
        <Text
          offsetY={16}
          text={`${prediction.class} (${Math.round(prediction.score * 100)}%)`}
          fill="#ffffff"
          fontColor="#000000"
        />
      </Group>
    )
  }, [])

  useEffect(() => {
    if (!state.isReady) return
    const interval = setInterval(() => {
      if (!state.isReady) return
      const input = videoRef.current
      if (state.isReady && state.isTrackingEnabled && input) {
        predict()
      }
    }, state.updateMilis)
    return () => clearInterval(interval)
  }, [state])

  if (!state.isReady) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tensorflow Playground / COCO-SSD</h1>
      <div className="relative">
        <Video
          ref={videoRef as any}
          width={640}
          height={480}
          constraints={state.videoConstraints}
        />
        <Stage className="absolute top-0 left-0" width={640} height={480}>
          <Layer>{state.predictions.map((p, key) => renderRect(p, key))}</Layer>
        </Stage>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tracking"
              checked={state.isTrackingEnabled}
              onCheckedChange={(checked) =>
                dispatch({
                  type: 'setIsTrackingEnabled',
                  payload: checked as boolean,
                })
              }
            />
            <label htmlFor="tracking">Enable Tracking</label>
          </div>
          <div>
            <p>{state.predictions.length} predictions found</p>
          </div>
          <div>
            <label htmlFor="updateInterval">Update Interval: {state.updateMilis}ms</label>
            <Slider
              id="updateInterval"
              min={10}
              max={250}
              step={10}
              value={[state.updateMilis]}
              onValueChange={(value) =>
                dispatch({ type: 'setUpdateMilis', payload: value[0] })
              }
            />
          </div>
        </CardContent>
      </Card>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Predictions</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
            {JSON.stringify(state.predictions, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
