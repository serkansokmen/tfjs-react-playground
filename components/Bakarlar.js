import React, { useReducer, useEffect, useRef } from 'react'
import Konva from 'konva'
import { Stage, Layer, Circle, Image, Group } from 'react-konva'
import useImage from 'use-image'
import pix2pix from '../lib/pix2pix'
import { mapRange } from '../lib/utils'
import useInterval from '../lib/use-interval'
import * as dg from 'dis-gui'

const initialState = {
  SIZE: 256,
  OUTER_RING_SIZE: 158,
  PUPIL_SIZE: 54,
  isReady: false,
  isTransfering: false,
  mouseVec: {
    x: 256 / 2,
    y: 246 / 2,
  },
  blurAmount: 3,
  noiseAmount: 1,
  updateMilis: 60,
  isTrackingEnabled: true,
}

function reducer(state, action) {
  const [type, payload] = action
  // console.log(`Got action: ${type}, payload: ${JSON.stringify(payload, null, 2)}`)
  switch (type) {
    case 'setIsReady':
      return { ...state, isReady: payload }
    case 'setIsTransfering':
      return { ...state, isTransfering: payload }
    case 'setIsTrackingEnabled':
      return { ...state, isTrackingEnabled: payload }
    case 'setMouseVec':
      return { ...state, mouseVec: payload }
    case 'setResult':
      return { ...state, result: payload }
    case 'setOuterRingSize':
      return { ...state, OUTER_RING_SIZE: payload }
    case 'setPupilSize':
      return { ...state, PUPIL_SIZE: payload }
    case 'setBlur':
      return { ...state, blurAmount: payload }
    case 'setNoise':
      return { ...state, noiseAmount: payload }
    default:
      throw new Error('unknown action')
  }
}

export default function Bakarlar() {
  const stageRef = useRef()
  const outputCanvasRef = useRef()
  const circleToEye = useRef()
  const inputGroupRef = useRef()

  const [state, dispatch] = useReducer(reducer, initialState)
  const [testInput] = useImage('/static/images/guide.png')

  const modelLoaded = () => {
    dispatch(['setIsReady', true])
  }

  const predict = (element) => {
    dispatch(['setIsTransfering', true])

    // // Apply pix2pix transformation
    circleToEye.current.transfer(element, (result) => {
      dispatch(['setIsTransfering', false])
      dispatch(['setResult', result])
    })
  }

  const handleMouseMove = (e) => {
    const { OUTER_RING_SIZE, SIZE } = state
    const x =
      OUTER_RING_SIZE / 2 +
      mapRange(e.pageX, 0, window.innerWidth, 0, SIZE - OUTER_RING_SIZE)
    const y =
      OUTER_RING_SIZE / 2 +
      mapRange(e.pageY, 0, window.innerHeight, 0, SIZE - OUTER_RING_SIZE)
    dispatch(['setMouseVec', { x, y }])
    inputGroupRef.current && inputGroupRef.current.cache()
  }

  useInterval(() => {
    const { isReady, isTrackingEnabled } = state
    if (!isReady || !isTrackingEnabled) {
      return
    }

    const input = stageRef.current.toCanvas({
      x: 0,
      y: 0,
      width: state.SIZE,
      height: state.SIZE,
      pixelRatio: 1,
      callback: (input) => {
        // dispatch(['setInputReady', true])
      },
    })
    predict(input)
  }, state.updateMilis)

  useEffect(() => {
    circleToEye.current = pix2pix(
      '/static/models/bakarlar_002_BtoA.pict',
      modelLoaded
    )
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      inputGroupRef.current.cache()
    }
  }, [])

  return (
    <>
      <Stage ref={stageRef} width={state.SIZE * 2} height={state.SIZE}>
        <Layer>
          <Image
            image={testInput}
            x={0}
            y={0}
            width={state.SIZE}
            height={state.SIZE}
          />
          <Group
            ref={inputGroupRef}
            filters={[Konva.Filters.Noise, Konva.Filters.Blur]}
            blurRadius={state.blurAmount}
            noise={state.noiseAmount}
            offsetY={15}
            width={state.SIZE}
            height={state.SIZE}
          >
            {/* <Circle 
              x={state.SIZE/2} 
              y={state.SIZE/2} 
              width={state.OUTER_RING_SIZE} 
              height={state.OUTER_RING_SIZE}
              fill="transparent" 
              stroke="black" 
              lineWidth={2}/> */}
            <Circle
              x={state.mouseVec.x}
              y={state.mouseVec.y}
              width={state.PUPIL_SIZE}
              height={state.PUPIL_SIZE}
              fill="black"
            />
          </Group>
          {state.result && <Image image={state.result} x={state.SIZE} />}
        </Layer>
      </Stage>
      {!state.isReady && 'Loading model...'}

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
            onFinishChange={(val) => dispatch(['setIsTrackingEnabled', val])}
          />
          <dg.Number
            label="update interval"
            value={state.updateMilis}
            min={10}
            max={250}
            step={10}
            onChange={(val) => dispatch(['setUpdateMilis', val])}
          />
          <dg.Number
            label="outer ring size"
            value={state.OUTER_RING_SIZE}
            min={10}
            max={state.SIZE}
            step={1}
            onChange={(val) => dispatch(['setOuterRingSize', val])}
          />
          <dg.Number
            label="pupil size"
            value={state.PUPIL_SIZE}
            min={10}
            max={state.OUTER_RING_SIZE / 2}
            step={1}
            onChange={(val) => dispatch(['setPupilSize', val])}
          />
          <dg.Number
            label="input noise"
            value={state.noiseAmount}
            min={0}
            max={10}
            step={1}
            onChange={(val) => dispatch(['setNoise', val])}
          />
          <dg.Number
            label="input blur"
            value={state.blurAmount}
            min={0}
            max={10}
            step={1}
            onChange={(val) => dispatch(['setBlur', val])}
          />
        </dg.Folder>
      </dg.GUI>
    </>
  )
}
