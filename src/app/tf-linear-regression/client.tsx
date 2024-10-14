'use client'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useTfjsVis } from '@/hooks/use-tfjs-vis'
import { zodResolver } from '@hookform/resolvers/zod'
import * as tf from '@tensorflow/tfjs'
import '@tensorflow/tfjs-backend-webgl'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

interface CarData {
  mpg: number
  horsepower: number
}

const formSchema = z.object({
  epochs: z.number().int().positive(),
  batchSize: z.number().int().positive(),
})

function Predict2dData() {
  const [init, setInit] = useState(false)
  const { show, render } = useTfjsVis()
  const [isTraining, setIsTraining] = useState(false)
  const [data, setData] = useState<CarData[]>([])

  const modelRef = useRef(createModel())

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      epochs: 100,
      batchSize: 58,
    },
  })

  useEffect(() => {
    getData()
  }, [])

  useEffect(() => {
    if (!init && data.length > 0) {
      const values = data.map((d) => ({
        x: d.horsepower,
        y: d.mpg,
      }))
      render.scatterplot(
        { name: 'Horsepower v MPG' },
        { values },
        {
          xLabel: 'Horsepower',
          yLabel: 'MPG',
          height: 300,
        }
      )
      if (modelRef.current) {
        show.modelSummary({ name: 'Model Summary' }, modelRef.current)
      }
      setInit(true)
    }
  }, [data, init, render, show])

  async function getData() {
    try {
      const req = await fetch(
        'https://storage.googleapis.com/tfjs-tutorials/carsData.json'
      )
      const jsonData = await req.json()
      const cleaned = jsonData
        .map((d: any) => ({
          mpg: d['Miles_per_Gallon'],
          horsepower: d['Horsepower'],
        }))
        .filter((d: CarData) => d.mpg != null && d.horsepower != null)
      setData(cleaned)
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  function createModel() {
    const model = tf.sequential()
    model.add(tf.layers.dense({ inputShape: [1], units: 4, useBias: true }))
    model.add(tf.layers.dense({ units: 50, activation: 'sigmoid' }))
    model.add(tf.layers.dense({ units: 1, useBias: true }))
    return model
  }

  function convertToTensor(data: CarData[]) {
    return tf.tidy(() => {
      tf.util.shuffle(data)

      const inputs = data.map((d) => d.horsepower)
      const labels = data.map((d) => d.mpg)

      const inputTensor = tf.tensor2d(inputs, [inputs.length, 1])
      const labelTensor = tf.tensor2d(labels, [labels.length, 1])

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

  async function trainModel({
    inputs,
    labels,
    epochs,
    batchSize,
  }: {
    inputs: tf.Tensor
    labels: tf.Tensor
    epochs: number
    batchSize: number
  }) {
    const model = modelRef.current
    model.compile({
      optimizer: tf.train.adam(),
      loss: tf.losses.meanSquaredError,
      metrics: ['mse'],
    })

    return await model.fit(inputs, labels, {
      batchSize,
      epochs,
      shuffle: true,
      callbacks: show.fitCallbacks(
        { name: 'Training Performance' },
        ['loss', 'mse'],
        { height: 200, callbacks: ['onEpochEnd'] }
      ),
    })
  }

  function testModel(
    inputData: CarData[],
    normalizationData: ReturnType<typeof convertToTensor>
  ) {
    const { inputMax, inputMin, labelMax, labelMin } = normalizationData

    const [xs, preds] = tf.tidy(() => {
      const xs = tf.linspace(0, 1, 100)
      const preds = modelRef.current.predict(xs.reshape([100, 1])) as tf.Tensor

      const unNormXs = xs.mul(inputMax.sub(inputMin)).add(inputMin)
      const unNormPreds = preds.mul(labelMax.sub(labelMin)).add(labelMin)

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

    render.scatterplot(
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isTraining) {
      setIsTraining(true)
      const tensorData = convertToTensor(data)
      const { inputs, labels } = tensorData
      const { epochs, batchSize } = values

      trainModel({ inputs, labels, epochs, batchSize }).then(() => {
        setIsTraining(false)
      })
    }
  }

  if (!init) {
    return <div>Loading...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="epochs"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Epochs</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>Number of training iterations</FormDescription>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="batchSize"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Batch Size</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>
                Number of samples per gradient update
              </FormDescription>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isTraining}>
          {isTraining ? 'Training...' : 'Train'}
        </Button>
        {isTraining && (
          <Button type="button" onClick={() => setIsTraining(false)}>
            Stop Training
          </Button>
        )}
        <Button
          type="button"
          onClick={() => testModel(data, convertToTensor(data))}
        >
          Test
        </Button>
      </form>
    </Form>
  )
}

Predict2dData.displayName = 'Predict2dData'

export default function TfLinearRegression() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Make Predictions from 2D Data</h1>
      <Predict2dData />
    </div>
  )
}
