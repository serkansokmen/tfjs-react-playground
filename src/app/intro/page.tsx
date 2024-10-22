import type { Metadata } from 'next'
import TfIntro from './TfIntro'

export const metadata: Metadata = {
  title: 'Tensorflow Playground / Intro',
  description: 'Introduction to TensorFlow.js',
}

export default async function Page() {
  return <TfIntro />
}
