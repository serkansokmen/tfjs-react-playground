import type { Metadata } from 'next'
import TfLstm from './TfLstm'

export const metadata: Metadata = {
  title: 'Tensorflow Playground / LSTM',
  description: 'Long short-term memory using TensorFlow.js',
}

export default async function Page() {
  return <TfLstm />
}
