import { Metadata } from 'next/types'
import PageClient from './client'

export const metadata: Metadata = {
  title: 'Tensorflow Playground / Posenet',
  description: 'Real-time pose estimation using PoseNet and TensorFlow.js',
}

export default function PosenetPage() {
  return <PageClient />
}
