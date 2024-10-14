'use client'

import React, { useState, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useTfjsVis } from '@/hooks/use-tfjs-vis'

const BATCH_SIZE = 500
const NUM_CLASSES = 10

function createModel() {
  const model = tf.sequential()
  model.add(
    tf.layers.conv2d({
      inputShape: [28, 28, 1],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    })
  )
  model.add(
    tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2],
    })
  )
  model.add(
    tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    })
  )
  model.add(
    tf.layers.maxPooling2d({
      poolSize: [2, 2],
      strides: [2, 2],
    })
  )
  model.add(tf.layers.flatten())
  model.add(
    tf.layers.dense({
      units: 10,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax',
    })
  )
  return model
}

export default function TfCnn() {
  const [isTraining, setIsTraining] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const { visor, show } = useTfjsVis()

  const train = async () => {
    setIsTraining(true)
    const model = createModel()
    const LEARNING_RATE = 0.0001
    const optimizer = tf.train.adam(LEARNING_RATE)
    model.compile({
      optimizer: optimizer,
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy'],
    })
    const batch = tf.zeros([BATCH_SIZE, 28, 28, 1])
    const labels = tf.zeros([BATCH_SIZE, NUM_CLASSES])

    const h = await model.fit(batch, labels, {
      batchSize: BATCH_SIZE,
      epochs: 1,
      callbacks: visor
        ? show.fitCallbacks({ name: 'Training Performance' }, ['loss', 'acc'], {
            height: 200,
            callbacks: ['onEpochEnd'],
          })
        : undefined,
    })

    setResult(JSON.stringify(h.history, null, 2))
    setIsTraining(false)

    if (visor) {
      show.modelSummary({ name: 'Model Architecture' }, model)
    }
  }

  useEffect(() => {
    train()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tensorflow Playground / CNN</h1>
      <Card>
        <CardHeader>
          <CardTitle>Model Training Result</CardTitle>
        </CardHeader>
        <CardContent>
          {isTraining ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-2"></div>
              Training...
            </div>
          ) : result ? (
            <pre className="bg-gray-100 p-2 rounded overflow-auto max-h-60">
              {result}
            </pre>
          ) : (
            <p>Model not trained yet</p>
          )}
        </CardContent>
      </Card>
      <Button onClick={train} disabled={isTraining} className="mt-4">
        {isTraining ? 'Training...' : 'Retrain Model'}
      </Button>
    </div>
  )
}
