// tf-xor/pages/client.tsx
'use client'

import React, { useState, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const backend = process.env.TF_BACKEND || 'cpu'
tf.setBackend(backend)

// Training set which takes two inputs and one output
const xs = tf.tensor2d([
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
])
const ys = tf.tensor2d([[0], [1], [1], [0]])

// Two dense layers with two different nonlinear activation functions
// Stochastic gradient descent with cross entropy loss.
// The learning rate is 0.1
function createModel() {
  const model = tf.sequential()
  model.add(tf.layers.dense({ units: 8, inputShape: [2], activation: 'tanh' }))
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }))
  model.compile({ optimizer: tf.train.sgd(0.1), loss: 'binaryCrossentropy' })
  return model
}

export default function TfXor() {
  const [isTraining, setIsTraining] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [model, setModel] = useState<tf.Sequential | null>(null)

  useEffect(() => {
    setModel(createModel())
  }, [])

  const fit = async () => {
    if (!model) return

    setIsTraining(true)
    await model.fit(xs, ys, {
      batchSize: 1,
      epochs: 100,
    })
    const predict = model.predict(xs) as tf.Tensor
    predict.print()
    setResult(predict.toString())
    setIsTraining(false)
  }

  useEffect(() => {
    if (model) {
      fit()
    }
  }, [model])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tensorflow Playground / XOR</h1>
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Input Data (xs)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-2 rounded">{xs.toString()}</pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Expected Output (ys)</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-2 rounded">{ys.toString()}</pre>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Model Output</CardTitle>
          </CardHeader>
          <CardContent>
            {isTraining ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-2"></div>
                Training...
              </div>
            ) : result ? (
              <pre className="bg-gray-100 p-2 rounded">{result}</pre>
            ) : (
              <p>Model not trained yet</p>
            )}
          </CardContent>
        </Card>
        <Button onClick={fit} disabled={isTraining || !model}>
          {isTraining ? 'Training...' : 'Retrain Model'}
        </Button>
      </div>
    </div>
  )
}
