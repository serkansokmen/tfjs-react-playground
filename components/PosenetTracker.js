import React, {
  useReducer,
  useEffect,
  useRef,
} from 'react'
import * as posenet from '@tensorflow-models/posenet'
import { Stage, Layer } from 'react-konva'
import Webcam from 'react-webcam'
import Player from 'react-player'
import Skeleton from './Skeleton'
import * as dg from 'dis-gui'
import useInterval from '../lib/use-interval'

const initialState = {
  isReady: false,
  imageScaleFactor: 0.5,
  flipHorizontal: false,
  outputStride: 16,
  maxPoseDetections: 5, // get up to 5 poses
  scoreThreshold: 0.85, // minimum confidence of the root part of a pose
  nmsRadius: 30, // minimum distance in pixels between the root parts of poses
  updateRateMilis: 60,
  poses: [],
  foundKeypoints: [],
  useWebcam: false,
  isPlaying: false,
  isTrackingEnabled: false,
  videoConstraints: {
    width: 1280,
    height: 720,
    facingMode: 'user',
  },
  size: {
    width: 640,
    height: 360,
  },
  message: '',
}

const reducer = (state, action) => {
  const [type, payload] = action
  console.log(`Got action type: ${type}`)
  switch (type) {
    case 'setReady':
      return { ...state, isReady: payload }
    case 'imageScaleFactor':
      return { ...state, imageScaleFactor: payload }
    case 'flipHorizontal':
      return { ...state, flipHorizontal: payload }
    case 'outputStride':
      return { ...state, outputStride: payload }
    case 'maxPoseDetections':
      return { ...state, maxPoseDetections: payload }
    case 'scoreThreshold':
      return { ...state, scoreThreshold: payload }
    case 'nmsRadius':
      return { ...state, nmsRadius: payload }
    case 'updateRateMilis':
      return { ...state, updateRateMilis: payload }
    case 'poses':
      return { ...state, poses: payload }
    case 'foundKeypoints':
      return { ...state, foundKeypoints: payload }
    case 'useWebcam':
      return { ...state, useWebcam: payload }
    case 'isPlaying':
      return { ...state, isPlaying: payload }
    case 'isTrackingEnabled':
      return { ...state, isTrackingEnabled: payload }
    case 'setPoses':
      return { ...state, poses: payload }
    case 'setMessage':
      return { ...state, message: payload }
    default:
      throw new Error('Unexpected action')
  }
}

const fetchPoses = async ({
  net,
  maxPoseDetections,
  imageElement,
  imageScaleFactor,
  flipHorizontal,
  outputStride,
  scoreThreshold,
  nmsRadius,
}) => {
  if (maxPoseDetections === 1) {
    const pose = await net.estimateSinglePose(
      imageElement,
      imageScaleFactor,
      flipHorizontal,
      outputStride
    )
    return [pose]
  } else {
    const poses = await net.estimateMultiplePoses(
      imageElement,
      imageScaleFactor,
      flipHorizontal,
      outputStride,
      maxPoseDetections,
      scoreThreshold,
      nmsRadius
    )
    const foundPoses = poses.filter(pose => pose.score > 0.5)
    return foundPoses
  }
}

const PosenetTracker = props => {
  // Net
  const net = useRef(null)

  // State
  const [state, dispatch] = useReducer(reducer, initialState)
  const {
    isReady,
    imageScaleFactor,
    flipHorizontal,
    outputStride,
    maxPoseDetections,
    scoreThreshold,
    nmsRadius,
    updateRateMilis,
    poses,
    foundKeypoints,
    useWebcam,
    isPlaying,
    isTrackingEnabled,
    videoConstraints,
    size,
    message,
  } = state

  // Refs
  const videoRef = React.createRef()

  const loadPosenet = async () => {
    net.current = await posenet.load()
    dispatch(['setReady', true])
  }

  useEffect(() => {
    loadPosenet()
  }, [])

  useInterval(async () => {
    const { isReady, isTrackingEnabled } = state
    if (!isReady || !isTrackingEnabled) {
      return
    }

    const currentRef = videoRef && videoRef.current ? videoRef.current : null

    if (!currentRef) {
      dispatch(['setMessage', 'No input image'])
      return
    }
    const imageElement = useWebcam
      ? currentRef.getCanvas()
      : currentRef.getInternalPlayer()

    if (!imageElement || !net) {
      dispatch(['setMessage', 'Image element or net not available'])
      return
    }

    const poses = await fetchPoses({
      net: net.current,
      maxPoseDetections,
      imageElement,
      imageScaleFactor,
      flipHorizontal,
      outputStride,
      maxPoseDetections,
      scoreThreshold,
      nmsRadius,
    })
    dispatch(['setPoses', poses])
    dispatch(['setMessage', `Found ${poses.length} poses`])
  }, updateRateMilis)

  const handleVideoError = (error) => {
    dispatch(['useWebcam', true])
  }

  return (
    <div>
      {useWebcam ? (
        <Webcam
          ref={videoRef}
          audio={false}
          width={size.width}
          height={size.height}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
        />
      ) : (
        <Player
          muted={true}
          autoPlay={isPlaying}
          playing={isPlaying}
          width={size.width}
          height={size.height}
          url={process.env.defaultVideoUrl}
          ref={videoRef}
          style={{ ...size }}
          onError={handleVideoError}
        />
      )}
      
      <Stage
        className="stage"
        width={videoConstraints.width}
        height={videoConstraints.height}
      >
        <Layer>
          {poses.map((pose, key) => (
            <Skeleton key={key} keypoints={pose.keypoints} />
          ))}
        </Layer>
      </Stage>

      <dg.GUI
        style={{
          paddingX: 3,
          paddingY: 3,
          backgroundColor: '#EEE',
          lowlight: '#DDD',
          lowlighterr: '#FBB',
          highlight: '#444',
          separator: '1px solid #DDD',
          labelWidth: 100,
          controlWidth: 240,
          label: {
            fontColor: '#444',
            fontWeight: 'normal',
          },
        }}
      >
        {/* <dg.Text label='Bakarlar'/> */}
        <dg.Folder label="Video Source" expanded={true}>
          <dg.Button
            label={useWebcam ? 'use video' : 'use webcam'}
            onClick={() => dispatch(['useWebcam', !useWebcam])}
          />
          {!useWebcam && (
            <dg.Button
              label={isPlaying ? 'pause' : 'play'}
              onClick={() =>
                dispatch(['isPlaying', !isPlaying ])
              }
            />
          )}
        </dg.Folder>
        <dg.Folder label="Tracking" expanded={true}>
          <dg.Checkbox
            label="enabled"
            checked={isTrackingEnabled}
            onFinishChange={val =>
              dispatch(['isTrackingEnabled', val])
            }
          />
          <dg.Text label={`${poses.length} poses found`} />
          <dg.Number
            label="update interval"
            value={updateRateMilis}
            min={10}
            max={250}
            step={10}
            onChange={val =>
              dispatch(['updateRateMilis', val])
            }
          />
          <dg.Checkbox
            label="flip horizontal"
            checked={flipHorizontal}
            onFinishChange={val =>
              dispatch(['flipHorizontal', val])
            }
          />
          <dg.Select
            label="output stride"
            value={outputStride}
            options={[8, 16, 32]}
            onFinishChange={val =>
              dispatch(['outputStride', val * 1])
            }
          />
          <dg.Number
            label="max poses"
            value={maxPoseDetections}
            min={1}
            max={10}
            step={1}
            onFinishChange={val =>
              dispatch(['maxPoseDetections', val])
            }
          />
          <dg.Number
            label="score threshold"
            value={scoreThreshold}
            min={0.01}
            max={1}
            onFinishChange={val =>
              dispatch(['scoreThreshold', val])
            }
          />
          <dg.Number
            label="nms radius"
            value={nmsRadius}
            min={1}
            max={100}
            step={1}
            onFinishChange={val =>
              dispatch(['nmsRadius', val])
            }
          />
        </dg.Folder>
      </dg.GUI>
      <pre>{message}</pre>
      <pre>{JSON.stringify(poses, null, 2)}</pre>

      <style jsx>{`
      .stage {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      
      .scene {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
      }
      
      pre {
        width: 320px;
        max-height: 320px;
        border-radius: 5px;
        padding: 10px;
        overflow-y: auto;
        font-size: 11px;
        line-height: 1.2;
      }
      
      video {
        opacity: 1;
      }      
      `}</style>
    </div>
  )
}

export default PosenetTracker
