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

    <style jsx global>{`
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
          'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
          'Helvetica Neue', sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }

      code {
        font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
          monospace;
      }
    `}</style>
  </Layout>
)

export default Home
