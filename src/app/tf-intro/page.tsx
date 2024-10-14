import dynamic from 'next/dynamic'
import { Metadata } from 'next/types'

const PageClient = dynamic(() => import('./client'), { ssr: false })

export const metadata: Metadata = {
  title: 'Tensorflow Playground / INTRO',
  description: 'Generated by create next app',
}

export default function Page() {
  return <PageClient />
}
