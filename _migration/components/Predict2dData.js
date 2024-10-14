import React, { useState, useEffect, useRef } from 'react'
import { Formik, Form, Field } from 'formik'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import * as tfVis from '@tensorflow/tfjs-vis'
import fetch from 'isomorphic-unfetch'

export default function Predict2dData() {
  const [init, setInit] = useState(false)
  const [isTraining, setIsTraining] = useState(false)
  const [data, setData] = useState([])

  const modelRef = useRef(createModel())

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    if (!init && data.length > 0) {
      const values = data.map((d) => ({
        x: d.horsepower,
        y: d.mpg,
      }))
      tfVis.render.scatterplot(
        { name: 'Horsepower v MPG' },
        { values },
        {
          xLabel: 'Horsepower',
          yLabel: 'MPG',
          height: 300,
        }
      )
      modelRef.current &&
        tfVis.show.modelSummary({ name: 'Model Summary' }, modelRef.current)
      setInit(true)
    }
  }, [data, init])

  async function getData() {
    const req = await fetch(
      'https://storage.googleapis.com/tfjs-tutorials/carsData.json'
    )
    const data = await req.json()
    const cleaned = data
      .map((d) => ({
        mpg: d['Miles_per_Gallon'],
        horsepower: d['Horsepower'],
      }))
      .filter((d) => d.mpg != null && d.horsepower != null)
    setData(cleaned)
  }

  function createModel() {
    // create a sequential model
    const model = tf.sequential()

    // add a single hidden layer
    // x . w + b = y
    // model.add(tf.layers.dense({ inputShape: [1], units: 1, useBias: true }))
    model.add(tf.layers.dense({ inputShape: [1], units: 4, useBias: true }))

    // add more layers
    model.add(tf.layers.dense({ units: 50, activation: 'sigmoid' }))

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
      const inputs = data.map((d) => d.horsepower)
      const labels = data.map((d) => d.mpg)

      const inputTensor = tf.tensor2d(inputs, [inputs.length, 1])
      const labelTensor = tf.tensor2d(labels, [labels.length, 1])

      // Step 3. normalize the data to the range 0-1 using min-max scaling
      const inputMax = inputTensor.max()
      const inputMin = inputTensor.min()
      const labelMax = labelTensor.max()
      const labelMin = labelTensor.min()

      const normalizedInputs = inputTensor
        .sub(inputMin)
        .div(inputMax.sub(inputMin))
      const normalizedLabels = labelTensor
        .sub(labelMin)
        .div(labelMax.sub(labelMin))

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

  async function trainModel({ inputs, labels, epochs, batchSize }) {
    const model = modelRef.current
    // prepare the model for training
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse'],
    })

    class EarlyStoppingCallback extends tf.Callback {
      async onEpochEnd(epoch, logs) {
        console.log(`epoch ${epoch + 1}`, logs)
        modelRef.current.stopTraining = isTraining
      }
    }

    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: true,
      callbacks: tfVis.show.fitCallbacks(
        { name: 'Training Performance' },
        ['loss', 'mse'],
        { height: 200, callbacks: [new EarlyStoppingCallback(), 'onEpochEnd'] }
      ),
    })
  }

  function testModel(inputData, normalizationData) {
    const { inputMax, inputMin, labelMax, labelMin } = normalizationData

    // Generate predictions for a uniform range of numbers between 0 and 1;
    // We un-normalize the data by doing the inverse of the min-max scaling
    // that we did earlier.
    const [xs, preds] = tf.tidy(() => {
      const xs = tf.linspace(0, 1, 100)
      const preds = modelRef.current.predict(xs.reshape([100, 1]))

      const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin)
      const unNormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin)

      // un-normalize the data
      return [unNormXs.dataSync(), unNormPreds.dataSync()]
    })

    const predictedPoints = Array.from(xs).map((val, i) => ({
      x: val,
      y: preds[i],
    }))

    const originalPoints = inputData.map((d) => ({
      x: d.horsepower,
      y: d.mpg,
    }))

    tfVis.render.scatterplot(
      { name: 'Model Predictions vs Original Data' },
      {
        values: [originalPoints, predictedPoints],
        series: ['original', 'predicted'],
      },
      {
        xLabel: 'Horsepower',
        yLabel: 'MPG',
        height: 300,
      }
    )
  }

  return (
    init && (
      <Formik
        initialValues={{
          epochs: 100,
          batchSize: 58,
        }}
        onSubmit={(values) => {
          // Initialize training
          console.log(data.length)
          const tensorData = convertToTensor(data)
          const { inputs, labels } = tensorData
          const { epochs, batchSize } = values

          // Train the model
          if (!isTraining) {
            setIsTraining(true)
            trainModel({ inputs, labels, epochs, batchSize }).then((model) => {
              setIsTraining(false)
            })
          }
        }}
      >
        {() => (
          <Form>
            <div>
              <Field placeholder="Epochs" type="number" name="epochs" />
            </div>
            <div>
              <Field placeholder="Batch Size" type="number" name="batchSize" />
            </div>

            <button type="submit" disabled={isTraining}>
              Train
            </button>
            {isTraining && (
              <button type="button" onClick={() => setIsTraining(false)}>
                Stop Training
              </button>
            )}
            <button
              type="button"
              onClick={() => testModel(data, convertToTensor(data))}
            >
              Test
            </button>
            <div>
              <pre>{JSON.stringify(data, null, 2)}</pre>
            </div>
          </Form>
        )}
      </Formik>
    )
  )
}
