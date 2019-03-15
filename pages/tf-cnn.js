import React, { useState, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import Head from '../components/head'
import Layout from '../layouts/main'

const BATCH_SIZE = 10
const NUM_CLASSES = 10

// TensorFlow.js uses automatic differentiation using computational graphs.
// We just need to create the layers, optimizer and compile the model.
function createModel() {
  const model = tf.sequential()
  // first layer
  model.add(
    tf.layers.conv2d({
      inputShape: [28, 28, 1], // grayscale
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu', // takes the negative values in the tensor and replaces them with zeros
      kernelInitializer: 'VarianceScaling',
    })
  )

  // add a max pooling layer
  model.add(
    tf.layers.maxPool2d({
      poolSize: [2, 2],
      strides: [2, 2],
    })
  )

  // second conv layer
  model.add(
    tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'VarianceScaling',
    })
  )

  // add a max pooling layer
  model.add(
    tf.layers.maxPool2d({
      poolSize: [2, 2],
      strides: [2, 2],
    })
  )

  // flatten the layers to use it for the dense layers
  model.add(tf.layers.flatten())

  // dense layer with output 10 units
  model.add(
    tf.layers.dense({
      units: 10,
      kernelInitializer: 'VarianceScaling',
      activation: 'softmax',
    })
  )

  return model
}

export default () => {
  const [isTraining, setIsTraining] = useState(false)
  const [result, setResult] = useState(null)

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
      batch: BATCH_SIZE,
      validationData,
      epochs: BATH_EP,
    })
    setResult(h.toString())
    setIsTraining(false)
  }

  useEffect(() => {
    train()
  }, [])

  return (
    <Layout>
      <Head title="Tensorflow Playground / CNN" />
      <div>{isTraining ? 'Training...' : result && result.toString()}</div>
    </Layout>
  )
}
