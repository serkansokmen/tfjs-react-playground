import dynamic from 'next/dynamic'
import { Metadata } from 'next/types'

const PageClient = dynamic(() => import('./client'), { ssr: false })

export const metadata: Metadata = {
  title: 'Tensorflow Playground / Object Detection',
  description: 'Object Detection using Cocos SSD',
}

export default function Page() {
  return <PageClient />
}
