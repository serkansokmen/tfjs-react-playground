// tf-lstm/pages/client.tsx
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useTfjsVis } from '@/hooks/use-tfjs-vis'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import { useEffect, useState } from 'react'

interface LSTMProps {
  modelKey?: string
}

export default function LSTM({ modelKey }: LSTMProps) {
  const [isModelReady, setIsModelReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [inputText, setInputText] = useState<string>('Lorem ipsum')
  const [prediction, setPrediction] = useState<string>('')
  const { visor, show } = useTfjsVis()

  async function loadModel(key: string) {
    try {
      const m = await tf.loadLayersModel(`/static/models/${key}/model.json`)
      setIsModelReady(true)
      setModel(m)

      if (visor) {
        show.modelSummary({ name: 'LSTM Model Architecture' }, m)
      }
    } catch (err) {
      setError(`Failed to load model: ${err}`)
    }
  }

  useEffect(() => {
    if (modelKey) {
      loadModel(modelKey)
    } else {
      setIsModelReady(false)
      setError('Query parameter `key` required.')
    }
  }, [modelKey])

  const handlePredict = async () => {
    if (!model) return

    try {
      const prediction = (await model.predict(
        tf.tensor2d(
          [Array.from(inputText).map((char) => char.charCodeAt(0))],
          [1, inputText.length]
        )
      )) as tf.Tensor

      const predictedIndices = tf.argMax(prediction as tf.Tensor, 1).dataSync()
      const predictedText = String.fromCharCode(...Array.from(predictedIndices))

      setPrediction(predictedText)

      if (visor) {
        show.valuesDistribution(
          { name: 'Prediction Distribution' },
          prediction as tf.Tensor
        )
      }
    } catch (err) {
      setError(`Prediction failed: ${err}`)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tensorflow Playground / LSTM</h1>
      <Card>
        <CardHeader>
          <CardTitle>LSTM Model</CardTitle>
        </CardHeader>
        <CardContent>
          {!error && !isModelReady && <div>Loading model...</div>}
          {!error && isModelReady && (
            <div className="space-y-4">
              <div>Model loaded successfully</div>
              <Input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Enter text for prediction"
              />
              <Button onClick={handlePredict}>Predict</Button>
              {prediction && (
                <div>
                  <h3 className="font-semibold">Prediction:</h3>
                  <p>{prediction}</p>
                </div>
              )}
            </div>
          )}
          {error && <pre className="bg-red-100 p-2 rounded text-red-500">{error}</pre>}
        </CardContent>
      </Card>
    </div>
  )
}
