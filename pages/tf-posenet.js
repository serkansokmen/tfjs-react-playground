import React from 'react'
import NoSSR from 'react-no-ssr'
import Head from '../components/head'
import Layout from '../layouts/main'
import PosenetTracker from '../components/PosenetTracker'

const Home = () => (
  <Layout>
    <Head title="Tensorflow Playground / Posenet" />

    <NoSSR onSSR={'loading...'}>
      <PosenetTracker />
    </NoSSR>
  </Layout>
)

export default Home
