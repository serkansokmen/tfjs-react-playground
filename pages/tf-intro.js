import React, { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import * as tf from '@tensorflow/tfjs'
import Head from '../components/head'
import Layout from '../layouts/main'

// function to minimize
function f(x) {
  const f1 = x.pow(tf.scalar(6, 'int32')) // x^6
  const f2 = x.pow(tf.scalar(4, 'int32')).mul(tf.scalar(2)) // 2x^4
  const f3 = x.pow(tf.scalar(2, 'int32')).mul(tf.scalar(3)) // 3x^2
  const f4 = tf.scalar(1) // 1
  return f1.add(f2).add(f3).add(x).add(f4)
}

export default () => {
  const [result, setResult] = useState(null)

  // minimize iteratively
  // initial value of a = 2.
  // learning rate defines how fast we jump to reach the minimum
  // on Adam optimizer
  function minimize(epochs, lr) {
    let y = tf.variable(tf.scalar(2)) // initial value
    const optim = tf.train.adam(lr) // gradient descent algorithm
    for (let i = 0; i < epochs; i++) {
      optim.minimize(() => f(y))
    }
    return y
  }

  return (
    <Layout>
      <Head title="Tensorflow Playground / Intro" />
      <Formik
        initialValues={{ epochs: 200, learningRate: 0.9 }}
        onSubmit={(values) => {
          const result = minimize(values.epochs, values.learningRate)
          setResult(result)
        }}
      >
        {() => (
          <Form>
            <h1>f(x) = x⁶+2x⁴+3x²+x+1.</h1>

            <div>
              <Field type="number" name="epochs" />
            </div>
            <div>
              <Field type="number" name="learningRate" />
            </div>

            <div>{result && result.toString()}</div>

            <button type="submit">Train</button>
          </Form>
        )}
      </Formik>
    </Layout>
  )
}
