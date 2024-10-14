import dynamic from 'next/dynamic'
import { Metadata } from 'next/types'

const PageClient = dynamic(() => import('./client'), { ssr: false })

export const metadata: Metadata = {
  title: 'Tensorflow Playground / INTRO',
  description: 'Generated by create next app',
}

export default function Page() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">f(x) = x⁶+2x⁴+3x²+x+1</h1>

      <PageClient />
    </div>
  )
}