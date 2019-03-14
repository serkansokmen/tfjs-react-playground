import React, {
  Component,
  useState,
  useReducer,
  useEffect,
  useLayoutEffect,
  createRef,
  useRef,
} from 'react'
import * as posenet from '@tensorflow-models/posenet'
import { Stage, Layer } from 'react-konva'
// import VideoSource from './VideoSource'
import Webcam from 'react-webcam'
import Player from 'react-player'
import Skeleton from './Skeleton'
// import ThreeScene from './ThreeScene'
import * as dg from 'dis-gui'
import './PosenetTracker.css'

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
  console.log(`Got action type: ${action.type}`)
  switch (action.type) {
    case 'setReady':
      return { ...state, isReady: true }
    case 'imageScaleFactor':
      return { ...state, imageScaleFactor: action.payload }
    case 'flipHorizontal':
      return { ...state, flipHorizontal: action.payload }
    case 'outputStride':
      return { ...state, outputStride: action.payload }
    case 'maxPoseDetections':
      return { ...state, maxPoseDetections: action.payload }
    case 'scoreThreshold':
      return { ...state, scoreThreshold: action.payload }
    case 'nmsRadius':
      return { ...state, nmsRadius: action.payload }
    case 'updateRateMilis':
      return { ...state, updateRateMilis: action.payload }
    case 'poses':
      return { ...state, poses: action.payload }
    case 'foundKeypoints':
      return { ...state, foundKeypoints: action.payload }
    case 'useWebcam':
      return { ...state, useWebcam: action.payload }
    case 'isPlaying':
      return { ...state, isPlaying: action.payload }
    case 'isTrackingEnabled':
      return { ...state, isTrackingEnabled: action.payload }
    case 'setPoses':
      return { ...state, poses: action.payload }
    case 'setMessage':
      return { ...state, message: action.payload }
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
  const [net, setNet] = useState(null)
  
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
  const intervalRef = React.createRef()

  const loadPosenet = async () => {
    const net = await posenet.load()
    setNet(net)
    dispatch({ type: 'setReady' })
  }
  
  useEffect(() => {
    console.log('load posenet')
    loadPosenet()
  }, [])

  useEffect(() => {
    
    if (isReady && isTrackingEnabled) {
      console.log('setup net interval')
      intervalRef.current = setInterval(async () => {
        const currentRef = videoRef && videoRef.current ? videoRef.current : null

        if (!currentRef) {
          dispatch({ type: 'setMessage', payload: 'No input image' })
          return
        }
        const imageElement = useWebcam
          ? currentRef.getCanvas()
          : currentRef.getInternalPlayer()

        console.log(imageElement)

        if (!imageElement || !net) {
          dispatch({
            type: 'setMessage',
            payload: 'Image element or net not available',
          })
          return
        }

        const poses = await fetchPoses({
          net,
          maxPoseDetections,
          imageElement,
          imageScaleFactor,
          flipHorizontal,
          outputStride,
          maxPoseDetections,
          scoreThreshold,
          nmsRadius,
        })
        dispatch({ type: 'setMessage', payload: `Found ${poses.length} poses` })
        dispatch({ type: 'setPoses', payload: poses })
        

      }, updateRateMilis)
    }

    return () => {
      console.log('cleanup net interval')
      clearInterval(intervalRef.current)
    }
  }, [isReady, isTrackingEnabled])

  return (
    <div className="app">
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
          url={'./static/videos/london_walk.mp4'}
          ref={videoRef}
          style={{ ...size }}
        />
      )}
      {/* <VideoSource
        ref={videoRef}
        useWebcam={useWebcam}
        isPlaying={isPlaying}
        url="./static/videos/london_walk.mp4"
        videoConstraints={videoConstraints}
        width={size.width}
        height={size.height}
      /> */}

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
            onClick={() => dispatch({ type: 'useWebcam', payload: !useWebcam })}
          />
          {!useWebcam && (
            <dg.Button
              label={isPlaying ? 'pause' : 'play'}
              onClick={() =>
                dispatch({ type: 'isPlaying', payload: !isPlaying })
              }
            />
          )}
        </dg.Folder>
        <dg.Folder label="Tracking" expanded={true}>
          <dg.Checkbox
            label="enabled"
            checked={isTrackingEnabled}
            onFinishChange={val =>
              dispatch({ type: 'isTrackingEnabled', payload: val })
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
              dispatch({ type: 'updateRateMilis', payload: val })
            }
          />
          <dg.Checkbox
            label="flip horizontal"
            checked={flipHorizontal}
            onFinishChange={val =>
              dispatch({ type: 'flipHorizontal', payload: val })
            }
          />
          <dg.Select
            label="output stride"
            value={outputStride}
            options={[8, 16, 32]}
            onFinishChange={val =>
              dispatch({ type: 'outputStride', payload: val } * 1)
            }
          />
          <dg.Number
            label="max poses"
            value={maxPoseDetections}
            min={1}
            max={10}
            step={1}
            onFinishChange={val =>
              dispatch({ type: 'maxPoseDetections', payload: val })
            }
          />
          <dg.Number
            label="score threshold"
            value={scoreThreshold}
            min={0.01}
            max={1}
            onFinishChange={val =>
              dispatch({ type: 'scoreThreshold', payload: val })
            }
          />
          <dg.Number
            label="nms radius"
            value={nmsRadius}
            min={1}
            max={100}
            step={1}
            onFinishChange={val =>
              dispatch({ type: 'nmsRadius', payload: val })
            }
          />
        </dg.Folder>
        {/* <dg.Number label='Number' value={65536}/>
        <dg.Select label='Select' options={['Option one', 'Option two', 'Option three']}/>
        <dg.Folder label='Folder' expanded={true}>
          <dg.Text label='Text' value='Hello folder!'/>
          <dg.Number label='Number' value={2}/>
          <dg.Folder label='Subfolder' expanded={true}>
            <dg.Text label='Text' value='Hello subfolder!'/>
            <dg.Number label='Number' value={2}/>
          </dg.Folder>
        </dg.Folder>
        <dg.Color label='Color' expanded={true} red={0} green={128} blue={255}/>
        <dg.Gradient label='Gradient' expanded={true}/> */}
      </dg.GUI>
      <pre>{message}</pre>
      <pre>{JSON.stringify(poses, null, 2)}</pre>
    </div>
  )
}

// // Hook
// function useWhyDidYouUpdate(name, props) {
//   // Get a mutable ref object where we can store props ...
//   // ... for comparison next time this hook runs.
//   const previousProps = useRef();

//   useEffect(() => {
//     if (previousProps.current) {
//       // Get all keys from previous and current props
//       const allKeys = Object.keys({ ...previousProps.current, ...props });
//       // Use this object to keep track of changed props
//       const changesObj = {};
//       // Iterate through keys
//       allKeys.forEach(key => {
//         // If previous is different from current
//         if (previousProps.current[key] !== props[key]) {
//           // Add to changesObj
//           changesObj[key] = {
//             from: previousProps.current[key],
//             to: props[key]
//           };
//         }
//       });

//       // If changesObj not empty then output to console
//       if (Object.keys(changesObj).length) {
//         console.log('[why-did-you-update]', name, changesObj);
//       }
//     }

//     // Finally update previousProps with current props for next hook call
//     previousProps.current = props;
//   });
// }

// class PosenetTracker extends Component {
//   state = {
//     imageScaleFactor: 0.5,
//     flipHorizontal: false,
//     outputStride: 16,
//     maxPoseDetections: 5, // get up to 5 poses
//     scoreThreshold: 0.85, // minimum confidence of the root part of a pose
//     nmsRadius: 30, // minimum distance in pixels between the root parts of poses
//     updateRateMilis: 60,
//     poses: [],
//     pose: null,
//     foundKeypoints: [],
//     useWebcam: false,
//     isPlaying: false,
//     isTrackingEnabled: false,
//     videoConstraints: {
//       width: 1280,
//       height: 720,
//       facingMode: 'user',
//     },
//     width: 640,
//     height: 360,
//   }

//   constructor(props) {
//     super(props)

//     this.videoRef = React.createRef()
//     this.intervalRef = React.createRef()
//   }

//   async componentWillMount() {
//     this.posenet = await posenet.load()
//     this.bodyPix = await bodyPix.load()
//   }

//   componentDidMount() {
//     this.setupInterval()

//     window.addEventListener('mousemove', this.handleMouse)
//   }

//   componentWillUnmount() {
//     this.destroyInterval()
//     window.removeEventListener('mousemove', this.handleMouse)
//   }

//   componentDidUpdate(oldProps, oldState) {
//     if (oldState.updateRateMilis !== this.state.updateRateMilis) {
//       this.destroyInterval()
//       this.setupInterval()
//     }
//   }

//   setupInterval() {
//     this.intervalRef.current = setInterval(
//       this.handleVideoSource,
//       this.state.updateRateMilis
//     )
//   }

//   destroyInterval() {
//     clearInterval(this.intervalRef.current)
//   }

//   handleVideoSource = async () => {
//     const { isTrackingEnabled } = this.state

//     if (!this.posenet || !this.bodyPix) {
//       return
//     }
//     if (!isTrackingEnabled) {
//       return
//     }

//     const imageElement = this.videoRef.current
//       ? this.videoRef.current.get()
//       : null

//     if (imageElement === null) {
//       return
//     }

//     const {
//       imageScaleFactor,
//       flipHorizontal,
//       outputStride,
//       maxPoseDetections,
//       scoreThreshold,
//       nmsRadius,
//     } = this.state

//     if (maxPoseDetections === 1) {
//       const pose = await this.posenet.estimateSinglePose(
//         imageElement,
//         imageScaleFactor,
//         flipHorizontal,
//         outputStride
//       )
//       this.setState(state => ({
//         poses: [],
//         pose,
//       }))
//     } else {
//       const poses = await this.posenet.estimateMultiplePoses(
//         imageElement,
//         imageScaleFactor,
//         flipHorizontal,
//         outputStride,
//         maxPoseDetections,
//         scoreThreshold,
//         nmsRadius
//       )
//       const foundPoses = poses.filter(pose => pose.score > 0.5)
//       this.setState(state => ({
//         poses: foundPoses,
//         pose: null,
//       }))
//     }
//   }

//   render() {
//     const {
//       poses,
//       pose,
//       useWebcam,
//       isPlaying,
//       videoConstraints,
//       width,
//       height,
//       flipHorizontal,
//       outputStride,
//       maxPoseDetections,
//       scoreThreshold,
//       nmsRadius,
//       updateRateMilis,
//       isTrackingEnabled,
//     } = this.state

//     return (
//       <div className="app">
//         <VideoSource
//           ref={this.videoRef}
//           useWebcam={useWebcam}
//           isPlaying={isPlaying}
//           videoSource="./static/videos/london_walk.mp4"
//           videoConstraints={videoConstraints}
//           width={width}
//           height={height}
//         />

//         <Stage
//           className="stage"
//           width={videoConstraints.width}
//           height={videoConstraints.height}
//         >
//           <Layer>
//             {pose && <Skeleton keypoints={pose.keypoints} />}
//             {poses.map((pose, key) => (
//               <Skeleton key={key} keypoints={pose.keypoints} />
//             ))}
//           </Layer>
//         </Stage>

//         <dg.GUI
//           style={{
//             paddingX: 3,
//             paddingY: 3,
//             backgroundColor: '#EEE',
//             lowlight: '#DDD',
//             lowlighterr: '#FBB',
//             highlight: '#444',
//             separator: '1px solid #DDD',
//             labelWidth: 100,
//             controlWidth: 240,
//             label: {
//               fontColor: '#444',
//               fontWeight: 'normal',
//             },
//           }}
//         >
//           {/* <dg.Text label='Bakarlar'/> */}
//           <dg.Folder label="Video Source" expanded={true}>
//             <dg.Button
//               label={useWebcam ? 'use video' : 'use webcam'}
//               onClick={() =>
//                 this.setState({ useWebcam: !this.state.useWebcam })
//               }
//             />
//             {!useWebcam && (
//               <dg.Button
//                 label={isPlaying ? 'pause' : 'play'}
//                 onClick={() =>
//                   this.setState({ isPlaying: !this.state.isPlaying })
//                 }
//               />
//             )}
//           </dg.Folder>
//           <dg.Folder label="Tracking" expanded={true}>
//             <dg.Checkbox
//               label="enabled"
//               checked={isTrackingEnabled}
//               onFinishChange={val => this.setState({ isTrackingEnabled: val })}
//             />
//             <dg.Text label={`${poses.length} poses found`} />
//             <dg.Number
//               label="update interval"
//               value={updateRateMilis}
//               min={10}
//               max={250}
//               step={10}
//               onChange={val => this.setState({ updateRateMilis: val })}
//             />
//             <dg.Checkbox
//               label="flip horizontal"
//               checked={flipHorizontal}
//               onFinishChange={val => this.setState({ flipHorizontal: val })}
//             />
//             <dg.Select
//               label="output stride"
//               value={outputStride}
//               options={[8, 16, 32]}
//               onFinishChange={val => this.setState({ outputStride: val * 1 })}
//             />
//             <dg.Number
//               label="max poses"
//               value={maxPoseDetections}
//               min={1}
//               max={10}
//               step={1}
//               onFinishChange={val => this.setState({ maxPoseDetections: val })}
//             />
//             <dg.Number
//               label="score threshold"
//               value={scoreThreshold}
//               min={0.01}
//               max={1}
//               onFinishChange={val => this.setState({ scoreThreshold: val })}
//             />
//             <dg.Number
//               label="nms radius"
//               value={nmsRadius}
//               min={1}
//               max={100}
//               step={1}
//               onFinishChange={val => this.setState({ nmsRadius: val })}
//             />
//           </dg.Folder>
//           {/* <dg.Number label='Number' value={65536}/>
//           <dg.Select label='Select' options={['Option one', 'Option two', 'Option three']}/>
//           <dg.Folder label='Folder' expanded={true}>
//             <dg.Text label='Text' value='Hello folder!'/>
//             <dg.Number label='Number' value={2}/>
//             <dg.Folder label='Subfolder' expanded={true}>
//               <dg.Text label='Text' value='Hello subfolder!'/>
//               <dg.Number label='Number' value={2}/>
//             </dg.Folder>
//           </dg.Folder>
//           <dg.Color label='Color' expanded={true} red={0} green={128} blue={255}/>
//           <dg.Gradient label='Gradient' expanded={true}/> */}
//         </dg.GUI>
//         <pre>{JSON.stringify(poses, null, 2)}</pre>
//       </div>
//     )
//   }
// }

export default PosenetTracker
