import type { Metadata } from 'next'
import TfCnn from './TfCnn'

export const metadata: Metadata = {
  title: 'Tensorflow Playground / CNN',
  description: 'Convolutional neural network using TensorFlow.js',
}

export default async function Page() {
  return <TfCnn />
}
