import type { Metadata } from 'next'
import TfBodyPix from './TfBodyPix'

export const metadata: Metadata = {
  title: 'Tensorflow Playground / COCO SSD',
  description: 'Object detection using TensorFlow.js COCO SSD model',
}

export default async function Page() {
  return <TfBodyPix />
}
