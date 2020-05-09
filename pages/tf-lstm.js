import React, { useState, useEffect, createRef } from 'react'
import NoSSR from 'react-no-ssr'
import * as tf from '@tensorflow/tfjs'
import Head from '../components/head'
import Layout from '../layouts/main'

const LSTM = ({ query }) => {
  const [isModelReady, setIsModelReady] = useState(false)
  const [error, setError] = useState(null)
  const model = createRef()

  const BATCH_SIZE = 8
  const PREDICT_LEN = 450

  async function loadModel(key) {
    const m = await tf.loadLayersModel(`/static/models/${key}/model.json`)
    setIsModelReady(true)
    model.current = m
    console.log(m, tf)
    debugger
    const prediction = model.current.predict(1, 'Lorem ipsum')
    console.log(prediction)
  }

  useEffect(() => {
    const { key } = query
    if (key) {
      loadModel(key)
    } else {
      setIsModelReady(false)
      setError('query parameter `key` required.')
    }
  }, [])

  return (
    <Layout>
      <Head title="Tensorflow Playground / LSTM" />
      {!error && !isModelReady && <div>Loading model</div>}
      {!error && isModelReady && <div>Ready</div>}
      {error && <pre>{JSON.stringify(error, null, 2)}</pre>}
    </Layout>
  )
}

LSTM.getInitialProps = ({ query }) => {
  return { query }
}

const LSTMPage = props => (
  <NoSSR>
    <LSTM {...props} />
  </NoSSR>
)

LSTMPage.getInitialProps = ({ query }) => {
  return { query }
}

export default LSTMPage
