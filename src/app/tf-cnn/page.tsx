import dynamic from 'next/dynamic'
import { Metadata } from 'next/types'

const PageClient = dynamic(() => import('./client'), { ssr: false })

export const metadata: Metadata = {
  title: 'Tensorflow Playground / Convolutional Neural Network',
  description: 'Convolutional Neural Network using TensorFlow.js',
}

export default function Page() {
  return <PageClient />
}
