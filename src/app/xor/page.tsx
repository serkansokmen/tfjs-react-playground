import type { Metadata } from 'next'
import TfXor from './TfXor'

export const metadata: Metadata = {
  title: 'Tensorflow Playground / XOR',
  description: 'XOR problem using TensorFlow.js',
}

export default async function Page() {
  return <TfXor />
}
