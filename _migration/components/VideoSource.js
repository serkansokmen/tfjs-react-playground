import React from 'react'
import Webcam from 'react-webcam'
import Player from 'react-player'

const VideoSource = React.forwardRef(
  ({ useWebcam, isPlaying, videoConstraints, width, height, url }, ref) => {
    const videoRef = React.useRef(ref)

    React.useImperativeHandle(ref, () => ({
      play: () => {
        if (useWebcam) {
          return
        }
        videoRef.current.getInternalPlayer().play()
      },
      pause: () => {
        if (useWebcam) {
          return
        }
        videoRef.current.getInternalPlayer().pause()
      },
      get: () => {
        return useWebcam
          ? videoRef.current.getCanvas()
          : videoRef.current.getInternalPlayer()
      },
    }))

    return useWebcam ? (
      <Webcam
        ref={videoRef}
        audio={false}
        width={width}
        height={height}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />
    ) : (
      <Player
        muted={true}
        autoPlay={isPlaying}
        playing={isPlaying}
        width={width}
        height={height}
        url={url}
        ref={videoRef}
      />
    )
  }
)

export default VideoSource
