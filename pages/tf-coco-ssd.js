import React from 'react'
import NoSSR from 'react-no-ssr'
import CocoSsd from '../components/CocoSsd'
import Head from '../components/head'
import Layout from '../layouts/main'

export default () => (
  <Layout>
    <Head title="Tensorflow Playground / Coco SSD" />
    <NoSSR><CocoSsd/></NoSSR>
  </Layout>
)