import type { Metadata } from 'next'
import TfLinearRegression from './TfLinearRegression'

export const metadata: Metadata = {
  title: 'Tensorflow Playground / Linear Regression',
  description: 'Linear regression using TensorFlow.js',
}

export default async function Page() {
  return <TfLinearRegression />
}
