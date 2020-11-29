import React from 'react'
import Head from '../components/head'
import NoSSR from 'react-no-ssr'
import Layout from '../layouts/main'
import Bakarlar from '../components/Bakarlar'

const TfBakarlar = () => (
  <Layout>
    <Head title="Tensorflow Playground / Bakarlar">
      <script
        src="https://unpkg.com/ml5@latest/dist/ml5.min.js"
        type="text/javascript"
      ></script>
    </Head>
    <NoSSR>
      <Bakarlar />
    </NoSSR>
  </Layout>
)

export default TfBakarlar
