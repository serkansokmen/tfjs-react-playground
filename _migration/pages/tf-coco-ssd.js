import React from 'react'
import NoSSR from 'react-no-ssr'
import CocoSsd from '../components/CocoSsd'
import Head from '../components/head'
import Layout from '../layouts/main'

const TfCocoSsd = () => (
  <Layout>
    <Head title="Tensorflow Playground / Coco SSD" />
    <NoSSR>
      <CocoSsd />
    </NoSSR>
  </Layout>
)

export default TfCocoSsd
