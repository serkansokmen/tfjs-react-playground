import React, { useState, useEffect, useRef } from 'react'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { Stage, Layer, Image, Group, Rect, Text } from 'react-konva'
import useInterval from '../lib/use-interval'
import Webcam from 'react-webcam'
import * as dg from 'dis-gui'

export default () => {
  
  const [isReady, setReady] = useState(false)
  const [isTrackingEnabled, setTrackingEnabled] = useState(false)
  const [updateMilis, setUpdateMilis] = useState(300)
  const [predictions, setPredictions] = useState([])
  const [net, setNet] = useState(null)

  const webcamRef = useRef()

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: 'user',
  }

  async function loadNet() {
    const net = await cocoSsd.load()
    setNet(net)
    setReady(true)
  }

  useEffect(() => {
    loadNet()
  }, [])

  const predict = async (input) => {
    const predictions = await net.detect(input)
    setPredictions(predictions)
  }

  const renderRect = (prediction, key) => {
    const [x, y, width, height] = prediction.bbox
    return (
      <Group x={x} y={y} key={key}>
        <Rect
          width={width}
          height={height}
          fill="transparent"
          stroke="#00ff00" />
        <Text offsetY={10} text={`${prediction.class} (${prediction.score})`}/>
      </Group>
    )
  }

  useInterval(() => {
    const input = webcamRef && webcamRef.current && webcamRef.current.video
    if (isReady && isTrackingEnabled && input) {
      predict(input)
    }
  }, updateMilis)

  return !isReady ? 'Loading...' : (
      <div>
        <div className="container">
          <Webcam
            ref={webcamRef}
            flipHorizontal={false}
            audio={false}
            width={640}
            height={480}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
          />
          
          <Stage style={{
            position: 'absolute',
            top: 0,
            left: 0,
          }} width={window.innerWidth} height={window.innerHeight}>
            <Layer>
              {predictions.map((p, key) => renderRect(p, key))}
            </Layer>
          </Stage>

          <pre>{JSON.stringify(predictions, null, 2)}</pre>
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
              checked={isTrackingEnabled}
              onFinishChange={val => setTrackingEnabled(val)}
            />
            <dg.Text label={`${predictions.length} predictions found`} />
            <dg.Number
              label="update interval"
              value={updateMilis}
              min={10}
              max={250}
              step={10}
              onChange={val => setUpdateMilis(val)}
            />
          </dg.Folder>
        </dg.GUI>
      </div>
  )
}