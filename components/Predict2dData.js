import React, { useState, useEffect, useRef } from 'react'
import * as tf from '@tensorflow/tfjs'
import * as tfVis from '@tensorflow/tfjs-vis'
import fetch from 'isomorphic-unfetch'

export default () => {
  
  const [data, setData] = useState([])
  const modelRef = useRef(createModel())
  
  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    if (data.length > 0) {
      console.log(data[0])
      const values = data.map(d => ({
        x: d.activity,
        y: d.quality,
      }))
      tfVis.render.scatterplot(
        { name: 'Activity v Sleep Quality'},
        { values },
        {
          xLabel: 'Activity',
          yLabel: 'Sleep Quality',
          height: 300,
        }
      )
      modelRef.current &&
        tfVis.show.modelSummary({name: 'Model Summary'}, modelRef.current)
      
      // Initialize training
      const tensorData = convertToTensor(data)
      const { inputs, labels } = tensorData

      // Train the model
      trainModel(inputs, labels)
    }
  }, [data])

  async function getData() {
    const req = await fetch('./static/sleepdata.json')
    const data = await req.json()
    const cleaned = data.map(d => {

      const timeInBedArr = d['Time in bed'].split(':')
      const hoursInBed = timeInBedArr[0]
      const minsInBed = timeInBedArr[1]
      const timeInBed = hoursInBed * 60 + minsInBed * 1
      return {
        start: d['Start'],
        end: d['End'],
        quality: d['Sleep quality'].split('%')[0] / 100,
        timeInBed,
        wakeUp: d['Wake up'],
        heartRate: d['Heart rate'],
        notes: d['Sleep notes'],
        activity: d['Activity (steps)'] * 1,
      }
    })
    // .map(d => ({
    //   wakeUp: d.wakeUp,
    //   activity: d.activity,
    // }))
    // .filter(item => item.heartRate > 0 && item.quality > 0)
    setData(cleaned)
  }

  function createModel() {
    // create a sequential model
    const model = tf.sequential()

    // add a single hidden layer
    // x . w + b = y
    model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true }))

    // add an output layer
    model.add(tf.layers.dense({ units: 1, useBias: true }))

    return model
  }

  function convertToTensor(data) {
    // Wrapping these calculations in a tidy will dispose any 
    // intermediate tensors.
    return tf.tidy(() => {
      // Step 1. shuffle data
      tf.util.shuffle(data)

      // Step 2. convert data to Tensor
      const inputs = data.map(d => d.activity)
      const labels = data.map(d => d.quality)

      const inputTensor = tf.tensor2d(inputs, [inputs.length, 1])
      const labelTensor = tf.tensor2d(labels, [labels.length, 1])

      // Step 3. normalize the data to the range 0-1 using min-max scaling
      const inputMax = inputTensor.max()
      const inputMin = inputTensor.min()
      const labelMax = labelTensor.max()
      const labelMin = labelTensor.min()

      const normalizedInputs = inputTensor.sub(inputMin).div(inputMax.sub(inputMin))
      const normalizedLabels = labelTensor.sub(labelMin).div(labelMax.sub(labelMin))

      return {
        inputs: normalizedInputs,
        labels: normalizedLabels,
        inputMax,
        inputMin,
        labelMax,
        labelMin,
      }
    })
  }

  async function trainModel(inputs, labels) {
    const model = modelRef.current
    // prepare the model for training
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse'],
    })

    const batchSize = 28
    const epochs = 50

    return await model.fit(inputs, labels, {
      batchSize, 
      epochs,
      shuffle: true,
      callbacks: tfVis.show.fitCallbacks(
        { name: 'Training Performance' },
        [ 'loss', 'mse' ],
        { height: 200, callbacks: ['onEpochEnd'] },
      )
    })
  }

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )  
}
