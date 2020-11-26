import React from 'react'
import NoSSR from 'react-no-ssr'
import Head from '../components/head'
import Layout from '../layouts/main'
import Predict2dData from '../components/Predict2dData'

function TfLinearRegression() {
  return (
    <Layout>
      <Head title="Tensorflow Playground / Make Predictions from 2D Data" />
      <NoSSR>
        <Predict2dData />
      </NoSSR>
    </Layout>
  )
}

export default TfLinearRegression
