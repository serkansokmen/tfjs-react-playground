import React, { useState, useEffect, createRef } from 'react'
import '@tensorflow/tfjs-core'
import '@tensorflow/tfjs-backend-webgl'
import * as bodyPix from '@tensorflow-models/body-pix'
import useCanvas from '../lib/use-canvas'
import Webcam from 'react-webcam'
import Head from '../components/head'
import Layout from '../layouts/main'

const rainbow = [
  [110, 64, 170],
  [143, 61, 178],
  [178, 60, 178],
  [210, 62, 167],
  [238, 67, 149],
  [255, 78, 125],
  [255, 94, 99],
  [255, 115, 75],
  [255, 140, 56],
  [239, 167, 47],
  [217, 194, 49],
  [194, 219, 64],
  [175, 240, 91],
  [135, 245, 87],
  [96, 247, 96],
  [64, 243, 115],
  [40, 234, 141],
  [28, 219, 169],
  [26, 199, 194],
  [33, 176, 213],
  [47, 150, 224],
  [65, 125, 224],
  [84, 101, 214],
  [99, 81, 195],
]

function TfBodyPix() {
  // const [image, status] = useImage(`./static/images/${imageNames[0]}`, 'Anonymous')
  const [coloredImage, setColoredImage] = useState(null)
  const [net, setNet] = useState(null)

  async function loadNet() {
    const net = await bodyPix.load()
    setNet(net)
  }

  const canvasRef = useCanvas((gl) => {
    // console.log(gl)
    // gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // gl.clearDepth(1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }, 'webgl2')
  const imageRef = createRef()

  useEffect(() => {
    loadNet()
  }, [])

  useEffect(() => {
    const opacity = 0.95
    const flipHorizontal = false
    const maskBlurAmount = 0.0
    const pixelCellWidth = 10.0
    if (canvasRef.current) {
      const canvas = canvasRef.current
      // coloredImage && canvas &&
      // bodyPix.drawMask(canvas, image, coloredImage, opacity, maskBlurAmount, flipHorizontal)
      // bodyPix.drawPixelatedMask(canvas, imageRef.current.getCanvas(), coloredImage, opacity, maskBlurAmount, flipHorizontal, pixelCellWidth)
    }
  }, [coloredImage])

  const handleClick = async () => {
    const snapshot = imageRef.current.getCanvas()
    const segmentation = await net.estimatePersonSegmentation(snapshot)
    const coloredImage = bodyPix.toColoredPartMask(segmentation, rainbow)
    setColoredImage(coloredImage)
  }

  return (
    <Layout>
      <Head title="Tensorflow Playground / Body Pix" />
      {net && (
        <div>
          <button onClick={handleClick}>Estimate Poses</button>
        </div>
      )}

      <div className="container">
        <Webcam
          ref={imageRef}
          fliphorizontal={false}
          audio={false}
          width={640}
          height={480}
          screenshotFormat="image/jpeg"
          videoConstraints={{
            width: 640,
            height: 480,
            facingMode: 'user',
          }}
        />
        {/* {image && <img className="image" width={image.width * scale} height={image.height * scale} ref={imageRef} src={image.src} />} */}
        <canvas className="mask" width={640} height={480} ref={canvasRef} />
      </div>

      <style jsx>{`
        .container {
          position: relative;
          width: 100%;
        }
        .image {
        }
        .mask {
          position: absolute;
          top: 0;
          left: 0;
        }
      `}</style>
    </Layout>
  )
}

// const imageNames = [
//   'andre-agassi.jpg',
//   'beautiful-beautiful-girl-beauty.jpg',
//   'beach-black-pants-black-shirt.jpg',
//   'stadium.jpg',
// ]

export default TfBodyPix
