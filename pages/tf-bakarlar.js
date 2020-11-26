import React from 'react'
import Head from '../components/head'
import NoSSR from 'react-no-ssr'
import Layout from '../layouts/main'
import Bakarlar from '../components/Bakarlar'

const TfBakarlar = () => (
  <Layout>
    <Head title="Tensorflow Playground / Bakarlar" />
    <NoSSR>
      <Bakarlar />
    </NoSSR>
  </Layout>
)

export default TfBakarlar
