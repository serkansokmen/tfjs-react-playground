import React, { useReducer, useEffect, useRef } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { Stage, Layer, Group, Rect, Text } from 'react-konva'
import useInterval from '../lib/use-interval'
import Webcam from 'react-webcam'
import * as dg from 'dis-gui'

const initialState = {
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

function reducer(state, action) {
  const [type, payload] = action
  console.log(`Got action type: ${type}`)
  switch (type) {
    case 'setReady':
      return { ...state, isReady: true }
    case 'setIsTrackingEnabled':
      return { ...state, isTrackingEnabled: payload }
    case 'setUpdateMilis':
      return { ...state, updateMilis: payload }
    case 'setPredictions':
      return { ...state, predictions: payload }
    default:
      throw new Error('Unexpected action')
  }
}

export default () => {
  const [state, dispatch] = useReducer(reducer, initialState)
  const net = useRef(null)
  const webcamRef = useRef()

  async function loadNet() {
    net.current = await cocoSsd.load()
    dispatch(['setReady'])
  }

  useEffect(() => {
    loadNet()
  }, [])

  useEffect(() => {
    if (!state.isTrackingEnabled) { dispatch(['setPredictions', []])}
  }, [state.isTrackingEnabled])

  const predict = async input => {
    const predictions = await net.current.detect(input)
    dispatch(['setPredictions', predictions])
  }

  const renderRect = (prediction, key) => {
    const [x, y, width, height] = prediction.bbox
    return (
      <Group x={x} y={y} key={key}>
        <Rect
          width={width}
          height={height}
          fill="transparent"
          stroke="#00ff00"
        />
        <Text offsetY={16} 
          text={`${prediction.class} (${Math.round(prediction.score * 100)}%)`} 
          fill="#ffffff"
          fontColor="#000000"/>
      </Group>
    )
  }

  useInterval(() => {
    const input = webcamRef && webcamRef.current && webcamRef.current.video
    if (state.isReady && state.isTrackingEnabled && input) {
      predict(input)
    }
  }, state.updateMilis)

  return !state.isReady ? (
    'Loading...'
  ) : (
    <div>
      <div style={{position: 'relative'}}>
        <Webcam
          ref={webcamRef}
          flipHorizontal={false}
          audio={false}
          width={640}
          height={480}
          screenshotFormat="image/jpeg"
          videoConstraints={state.videoConstraints}
        />

        <Stage
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
          width={window.innerWidth}
          height={window.innerHeight}
        >
          <Layer>{state.predictions.map((p, key) => renderRect(p, key))}</Layer>
        </Stage>

        <pre>{JSON.stringify(state.predictions, null, 2)}</pre>
      </div>

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
        <dg.Folder label="Tracking" expanded={true}>
          <dg.Checkbox
            label="enabled"
            checked={state.isTrackingEnabled}
            onFinishChange={val => dispatch(['setIsTrackingEnabled', val])}
          />
          <dg.Text label={`${state.predictions.length} predictions found`} />
          <dg.Number
            label="update interval"
            value={state.updateMilis}
            min={10}
            max={250}
            step={10}
            onChange={val => dispatch(['setUpdateMilis', val])}
          />
        </dg.Folder>
      </dg.GUI>
    </div>
  )
}
