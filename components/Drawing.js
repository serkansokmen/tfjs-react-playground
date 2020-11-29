import React, {
  useReducer,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'
import { Image, Group, Rect } from 'react-konva'
import useImage from 'use-image'

const initialState = {
  canvas: null,
  context: null,
  isDrawing: false,
  isReady: false,
  lastPointerPosition: null,
}

function reducer(state, action) {
  const [type, payload] = action
  // console.log(`Got action: ${type}, payload: ${JSON.stringify(payload, null, 2)}`)
  switch (type) {
    case 'setupCanvas':
      return { ...state, ...payload, isReady: true }
    case 'isDrawing':
      return { ...state, isDrawing: payload }
    case 'updatePointerPosition':
      return { ...state, lastPointerPosition: payload }
    default:
      throw new Error('unknown action')
  }
}

function Drawing(
  {
    width,
    height,
    background = '#ffffff',
    stroke = '#000000',
    lineWidth = 1,
    mode = 'draw',
    sampleImageUrl,
    onUpdate,
  },
  ref
) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [sampleImage, status] = useImage(sampleImageUrl)
  const imageRef = useRef()

  const handleMouseDown = () => {
    if (!state.isReady) {
      return
    }
    const stage = imageRef.current.getStage()
    dispatch(['isDrawing', true])
    dispatch(['updatePointerPosition', stage.getPointerPosition()])
  }

  const handleMouseUp = () => {
    dispatch(['isDrawing', false])
  }

  const handleMouseMove = () => {
    const { context, isDrawing, isReady } = state

    if (!isReady || !isDrawing) {
      return
    }

    context.strokeStyle = stroke
    context.lineJoin = 'round'
    context.lineWidth = lineWidth

    if (mode === 'draw') {
      // draw
      context.globalCompositeOperation = 'source-over'
    } else if (mode === 'erase') {
      // erase
      context.globalCompositeOperation = 'destination-out'
    }
    context.beginPath()

    var localPos = {
      x: state.lastPointerPosition.x - imageRef.current.x(),
      y: state.lastPointerPosition.y - imageRef.current.y(),
    }
    context.moveTo(localPos.x, localPos.y)

    const stage = imageRef.current.getStage()
    var pos = stage.getPointerPosition()
    localPos = {
      x: pos.x - imageRef.current.x(),
      y: pos.y - imageRef.current.y(),
    }
    context.lineTo(localPos.x, localPos.y)
    context.closePath()
    context.stroke()
    dispatch(['updatePointerPosition', localPos])
    imageRef.current.getLayer().draw()
  }

  const clearCanvas = () => {
    const { context } = state
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, width, height)
    imageRef.current.getLayer().draw()
  }

  useEffect(() => {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    // context.fillStyle = background
    // context.fillRect(0, 0, width, height)

    dispatch(['setupCanvas', { canvas, context }])
  }, [])

  useEffect(() => {
    !state.isDrawing && state.lastPointerPosition && onUpdate()
  }, [state.isDrawing, state.lastPointerPosition])

  useEffect(() => {
    const { context, isReady } = state
    status === 'loaded' && context && context.drawImage(sampleImage, 0, 0)
    imageRef.current.getLayer().draw()
    // const stage = imageRef.current.getStage()
    // stage.setPointersPositions({ clientX: 0, clientY: 0 })
    // dispatch(['updatePointerPosition', stage.getPointerPosition()])
  }, [sampleImage])

  useEffect(() => {
    imageRef.current.getLayer().draw()
  }, [background, stroke])

  useImperativeHandle(ref, () => ({
    clear: () => {
      if (!state.isReady) {
        return
      }
      clearCanvas()
    },
  }))

  return (
    <Group>
      <Rect width={width} height={height} fill={background} />
      <Image
        image={state.canvas}
        ref={imageRef}
        width={width}
        height={height}
        stroke={state.stroke}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
      />
    </Group>
  )
}

export default forwardRef(Drawing)
