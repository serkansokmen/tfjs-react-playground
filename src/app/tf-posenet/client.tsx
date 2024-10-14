'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import * as poseDetection from '@tensorflow-models/pose-detection'
import '@tensorflow/tfjs-backend-webgl'
import '@tensorflow/tfjs-core'
import dynamic from 'next/dynamic'
import React, { forwardRef, useEffect, useReducer, useRef } from 'react'
import { Circle, Layer, Line, Stage } from 'react-konva'
import Webcam from 'react-webcam'
import { useInterval } from 'usehooks-ts'

const Player = dynamic(() => import('react-player'), { ssr: false })

// Wrap Player component with forwardRef
const ForwardedPlayer = forwardRef<
  ReactPlayer,
  React.ComponentProps<typeof Player>
>((props, ref) => <Player ref={ref} {...props} />)
ForwardedPlayer.displayName = 'ForwardedPlayer'

interface State {
  isReady: boolean
  model: poseDetection.SupportedModels
  detector: poseDetection.PoseDetector | null
  scoreThreshold: number
  maxPoses: number
  updateInterval: number
  poses: poseDetection.Pose[]
  useWebcam: boolean
  isPlaying: boolean
  isTrackingEnabled: boolean
  videoConstraints: {
    width: number
    height: number
    facingMode: string
  }
  size: {
    width: number
    height: number
  }
  message: string
}

type Action =
  | { type: 'setReady'; payload: boolean }
  | { type: 'setModel'; payload: poseDetection.SupportedModels }
  | { type: 'setDetector'; payload: poseDetection.PoseDetector | null }
  | { type: 'setScoreThreshold'; payload: number }
  | { type: 'setMaxPoses'; payload: number }
  | { type: 'setUpdateInterval'; payload: number }
  | { type: 'setPoses'; payload: poseDetection.Pose[] }
  | { type: 'setUseWebcam'; payload: boolean }
  | { type: 'setIsPlaying'; payload: boolean }
  | { type: 'setIsTrackingEnabled'; payload: boolean }
  | { type: 'setMessage'; payload: string }

const initialState: State = {
  isReady: false,
  model: poseDetection.SupportedModels.MoveNet,
  detector: null,
  scoreThreshold: 0.5,
  maxPoses: 1,
  updateInterval: 100,
  poses: [],
  useWebcam: false,
  isPlaying: false,
  isTrackingEnabled: false,
  videoConstraints: {
    width: 640,
    height: 480,
    facingMode: 'user',
  },
  size: {
    width: 640,
    height: 480,
  },
  message: '',
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'setReady':
    case 'setModel':
    case 'setDetector':
    case 'setScoreThreshold':
    case 'setMaxPoses':
    case 'setUpdateInterval':
    case 'setPoses':
    case 'setUseWebcam':
    case 'setIsPlaying':
    case 'setIsTrackingEnabled':
    case 'setMessage':
      return { ...state, [action.type.slice(3)]: action.payload }
    default:
      throw new Error('Unexpected action')
  }
}

interface Keypoint {
  x: number
  y: number
  score?: number
  name?: string
}

interface SkeletonProps {
  keypoints: Keypoint[]
}

const Skeleton: React.FC<SkeletonProps> = ({ keypoints }) => {
  const drawLine = (kp1: Keypoint, kp2: Keypoint) => {
    return (
      <Line
        points={[kp1.x, kp1.y, kp2.x, kp2.y]}
        stroke="#00F"
        strokeWidth={2}
      />
    )
  }

  const connections = [
    ['nose', 'left_eye'],
    ['nose', 'right_eye'],
    ['left_eye', 'left_ear'],
    ['right_eye', 'right_ear'],
    ['left_shoulder', 'right_shoulder'],
    ['left_shoulder', 'left_elbow'],
    ['right_shoulder', 'right_elbow'],
    ['left_elbow', 'left_wrist'],
    ['right_elbow', 'right_wrist'],
    ['left_shoulder', 'left_hip'],
    ['right_shoulder', 'right_hip'],
    ['left_hip', 'right_hip'],
    ['left_hip', 'left_knee'],
    ['right_hip', 'right_knee'],
    ['left_knee', 'left_ankle'],
    ['right_knee', 'right_ankle'],
  ]

  return (
    <>
      {connections.map(([from, to]) => {
        const fromKeypoint = keypoints.find((kp) => kp.name === from)
        const toKeypoint = keypoints.find((kp) => kp.name === to)
        if (fromKeypoint && toKeypoint) {
          return drawLine(fromKeypoint, toKeypoint)
        }
        return null
      })}
      {keypoints.map((keypoint, index) => (
        <Circle
          key={index}
          x={keypoint.x}
          y={keypoint.y}
          radius={3}
          fill="#F00"
        />
      ))}
    </>
  )
}

Skeleton.displayName = 'Skeleton'

export default function PoseDetector() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const videoRef = useRef<Webcam | null>(null)

  const loadDetector = async () => {
    if (state.detector) {
      await state.detector.dispose()
    }

    let newDetector: poseDetection.PoseDetector
    switch (state.model) {
      case poseDetection.SupportedModels.MoveNet:
        newDetector = await poseDetection.createDetector(state.model, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
        })
        break
      case poseDetection.SupportedModels.BlazePose:
        newDetector = await poseDetection.createDetector(state.model, {
          runtime: 'tfjs',
        })
        break
      case poseDetection.SupportedModels.PoseNet:
        newDetector = await poseDetection.createDetector(state.model, {
          quantBytes: 4,
          architecture: 'MobileNetV1',
          outputStride: 16,
          inputResolution: { width: 640, height: 480 },
          multiplier: 0.75,
        })
        break
      default:
        throw new Error('Unsupported model')
    }

    dispatch({ type: 'setDetector', payload: newDetector })
    dispatch({ type: 'setReady', payload: true })
  }

  useEffect(() => {
    loadDetector()
  }, [state.model])

  useInterval(async () => {
    if (!state.isReady || !state.isTrackingEnabled || !state.detector) return

    const currentRef = videoRef.current
    if (!currentRef) {
      dispatch({ type: 'setMessage', payload: 'No input image' })
      return
    }

    const video = state.useWebcam
      ? currentRef.getCanvas()
      : (currentRef as unknown as ReactPlayer).getInternalPlayer()

    if (!video) {
      dispatch({ type: 'setMessage', payload: 'Video element not available' })
      return
    }

    const poses = await state.detector.estimatePoses(video, {
      maxPoses: state.maxPoses,
      scoreThreshold: state.scoreThreshold,
    })

    dispatch({ type: 'setPoses', payload: poses })
    dispatch({ type: 'setMessage', payload: `Found ${poses.length} poses` })
  }, state.updateInterval)

  const handleVideoError = () => {
    dispatch({ type: 'setUseWebcam', payload: true })
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Tensorflow Playground / Pose Detection
      </h1>
      <div className="relative mb-4">
        {state.useWebcam ? (
          <Webcam
            ref={videoRef}
            audio={false}
            width={state.size.width}
            height={state.size.height}
            screenshotFormat="image/jpeg"
            videoConstraints={state.videoConstraints}
          />
        ) : (
          <ForwardedPlayer
            ref={videoRef}
            muted={true}
            playing={state.isPlaying}
            width={state.size.width}
            height={state.size.height}
            url={process.env.NEXT_PUBLIC_DEFAULT_VIDEO_URL}
            onError={handleVideoError}
          />
        )}
        <Stage
          className="absolute top-0 left-0"
          width={state.videoConstraints.width}
          height={state.videoConstraints.height}
        >
          <Layer>
            {state.poses.map((pose, index) => (
              <Skeleton key={index} keypoints={pose.keypoints} />
            ))}
          </Layer>
        </Stage>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Model Selection</h3>
            <Select
              value={state.model}
              onValueChange={(value) =>
                dispatch({
                  type: 'setModel',
                  payload: value as poseDetection.SupportedModels,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={poseDetection.SupportedModels.MoveNet}>
                  MoveNet
                </SelectItem>
                <SelectItem value={poseDetection.SupportedModels.BlazePose}>
                  BlazePose
                </SelectItem>
                <SelectItem value={poseDetection.SupportedModels.PoseNet}>
                  PoseNet
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Video Source</h3>
            <Button
              onClick={() =>
                dispatch({ type: 'setUseWebcam', payload: !state.useWebcam })
              }
            >
              {state.useWebcam ? 'Use Video' : 'Use Webcam'}
            </Button>
            {!state.useWebcam && (
              <Button
                className="ml-2"
                onClick={() =>
                  dispatch({ type: 'setIsPlaying', payload: !state.isPlaying })
                }
              >
                {state.isPlaying ? 'Pause' : 'Play'}
              </Button>
            )}
          </div>

          <div>
            <h3 className="font-semibold mb-2">Tracking</h3>
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
            <p>{state.poses.length} poses found</p>
            <div>
              <label htmlFor="updateInterval">
                Update Interval: {state.updateInterval}ms
              </label>
              <Slider
                id="updateInterval"
                min={10}
                max={500}
                step={10}
                value={[state.updateInterval]}
                onValueChange={(value) =>
                  dispatch({ type: 'setUpdateInterval', payload: value[0] })
                }
              />
            </div>
            <div>
              <label htmlFor="maxPoses">Max Poses: {state.maxPoses}</label>
              <Slider
                id="maxPoses"
                min={1}
                max={10}
                step={1}
                value={[state.maxPoses]}
                onValueChange={(value) =>
                  dispatch({ type: 'setMaxPoses', payload: value[0] })
                }
              />
            </div>
            <div>
              <label htmlFor="scoreThreshold">
                Score Threshold: {state.scoreThreshold.toFixed(2)}
              </label>
              <Slider
                id="scoreThreshold"
                min={0.1}
                max={1}
                step={0.05}
                value={[state.scoreThreshold]}
                onValueChange={(value) =>
                  dispatch({ type: 'setScoreThreshold', payload: value[0] })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
            {state.message}
          </pre>
          <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60 mt-2">
            {JSON.stringify(state.poses, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
