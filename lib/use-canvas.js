import React, { useRef, useEffect } from 'react'

function useCanvas(draw, context = '2d') {
  const canvasRef = useRef(null)

  useEffect(() => {
    const ctx = canvasRef.current && canvasRef.current.getContext(context)
    let animationFrameId = requestAnimationFrame(renderFrame)

    function renderFrame() {
      animationFrameId = requestAnimationFrame(renderFrame)
      draw(ctx)
    }

    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return canvasRef
}

export default useCanvas