import dynamic from 'next/dynamic'
import { Metadata } from 'next/types'

const PageClient = dynamic(() => import('./client'), { ssr: false })

export const metadata: Metadata = {
  title: "Tensorflow Playground / Body Pix",
  description: "Body segmentation using TensorFlow.js BodyPix model",
};

export default function Page() {
  return <PageClient />
}