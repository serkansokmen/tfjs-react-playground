import type { Metadata } from 'next'
import TfPosenet from './TfPosenet'

export const metadata: Metadata = {
  title: 'Tensorflow Playground / Posenet',
  description: 'Real-time pose estimation using PoseNet and TensorFlow.js',
}

export default async function Page() {
  return <TfPosenet />
}
