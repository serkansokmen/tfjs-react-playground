import React from 'react'
import { Layer, Circle, Line } from 'react-konva'

const Skeleton = ({ keypoints }) => {
  const renderCircleForKeypoint = (key, color = 'blue', radius = 3) => {
    const keypoint = keypoints.find(kp => kp.part === key)
    return (
      <Circle
        key={key}
        x={keypoint.position.x}
        y={keypoint.position.y}
        radius={radius}
        fill={color}
      />
    )
  }

  const renderLineForPair = (firstKey, secondKey, color = 'green') => {
    const first = keypoints.find(kp => kp.part === firstKey)
    const second = keypoints.find(kp => kp.part === secondKey)
    let points = []
    if (first && second) {
      points = [
        first.position.x,
        first.position.y,
        second.position.x,
        second.position.y,
      ]
    }
    return <Line points={points} stroke={color} />
  }

  return (
    <>
      {keypoints.map(kp => {
        switch (kp.part) {
          case 'leftEye':
          case 'rightEye':
            return renderCircleForKeypoint(kp.part, 'white', 4)
          case 'leftEar':
          case 'rightEar':
            return renderCircleForKeypoint(kp.part, 'gray', 3)
          case 'nose':
            return renderCircleForKeypoint(kp.part, 'red', 5)
          default:
            return null
        }
      })}

      {renderLineForPair('leftShoulder', 'rightShoulder', 'green')}

      {renderLineForPair('leftShoulder', 'leftElbow', 'green')}
      {renderLineForPair('leftElbow', 'leftWrist', 'green')}

      {renderLineForPair('rightShoulder', 'rightElbow', 'green')}
      {renderLineForPair('rightElbow', 'rightWrist', 'green')}

      {renderLineForPair('leftHip', 'rightHip', 'green')}
      {renderLineForPair('leftHip', 'leftShoulder', 'green')}
      {renderLineForPair('rightHip', 'rightShoulder', 'green')}

      {renderLineForPair('leftHip', 'leftKnee', 'cyan')}
      {renderLineForPair('leftKnee', 'leftAnkle', 'cyan')}

      {renderLineForPair('rightHip', 'rightKnee', 'cyan')}
      {renderLineForPair('rightKnee', 'rightAnkle', 'cyan')}
    </>
  )
}
export default Skeleton
