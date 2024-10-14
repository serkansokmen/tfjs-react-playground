'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import * as tf from '@tensorflow/tfjs'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useTfjsVis } from '@/hooks/use-tfjs-vis'

// function to minimize
function f(x: tf.Tensor) {
  const f1 = x.pow(tf.scalar(6, 'int32')) // x^6
  const f2 = x.pow(tf.scalar(4, 'int32')).mul(tf.scalar(2)) // 2x^4
  const f3 = x.pow(tf.scalar(2, 'int32')).mul(tf.scalar(3)) // 3x^2
  const f4 = tf.scalar(1) // 1
  return f1.add(f2).add(f3).add(x).add(f4)
}

const formSchema = z.object({
  epochs: z.number().int().positive(),
  learningRate: z.number().positive().lte(1),
})

export default function TfIntro() {
  const [result, setResult] = useState<tf.Tensor | null>(null)
  const { visor, show } = useTfjsVis()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      epochs: 200,
      learningRate: 0.9,
    },
  })

  // minimize iteratively
  // initial value of a = 2.
  // learning rate defines how fast we jump to reach the minimum
  // on Adam optimizer
  function minimize(epochs: number, lr: number) {
    let y = tf.variable(tf.scalar(2)) // initial value
    const optim = tf.train.adam(lr) // gradient descent algorithm
    for (let i = 0; i < epochs; i++) {
      optim.minimize(() => f(y).asScalar())
    }
    return y
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    const result = minimize(values.epochs, values.learningRate)
    setResult(result)

    // if (visor) {
    //   show.values(visor, [result], 'Optimization Result')
    // }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">f(x) = x⁶+2x⁴+3x²+x+1</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="epochs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Epochs</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={(e) => field.onChange(parseInt(e.target.value))} />
                </FormControl>
                <FormDescription>Number of training iterations</FormDescription>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="learningRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Learning Rate</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" {...field} onChange={(e) => field.onChange(parseFloat(e.target.value))} />
                </FormControl>
                <FormDescription>Rate at which the model learns</FormDescription>
              </FormItem>
            )}
          />
          <Button type="submit">Train</Button>
        </form>
      </Form>
      {result && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Result:</h2>
          <p>{result.toString()}</p>
        </div>
      )}
    </div>
  )
}