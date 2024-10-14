import dynamic from 'next/dynamic'
import { Metadata } from 'next/types'

const PageClient = dynamic(() => import('./client'), { ssr: false })

export const metadata: Metadata = {
  title: "Tensorflow Playground / LSTM",
  description: "LSTM model using TensorFlow.js",
}

export default function Page({ searchParams }: { searchParams: { key?: string } }) {
  return <PageClient modelKey={searchParams.key} />
}