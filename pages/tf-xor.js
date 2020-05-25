import React, { useState, useEffect } from 'react'
import * as tf from '@tensorflow/tfjs'
import Head from '../components/head'
import Layout from '../layouts/main'

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
  model.add(tf.layers.dense({ units: 8, inputShape: 2, activation: 'tanh' }))
  model.add(tf.layers.dense({ units: 1, activation: 'sigmoid' }))
  model.compile({ optimizer: 'sgd', loss: 'binaryCrossentropy', lr: 0.1 })
  return model
}

export default () => {
  const [isTraining, setIsTraining] = useState(false)
  const [result, setResult] = useState(null)
  const model = createModel()

  const fit = async () => {
    setIsTraining(true)
    await model.fit(xs, ys, {
      batchSize: 1,
      epochs: 100,
    })
    const predict = model.predict(xs)
    predict.print()
    setResult(predict.toString())
    setIsTraining(false)
  }

  useEffect(() => {
    fit()
  }, [])

  return (
    <Layout>
      <Head title="Tensorflow Playground / XOR" />

      <div>xs: {xs.toString()}</div>
      <div>ys: {ys.toString()}</div>

      <div>{isTraining ? 'Training...' : result && result.toString()}</div>
    </Layout>
  )
}
