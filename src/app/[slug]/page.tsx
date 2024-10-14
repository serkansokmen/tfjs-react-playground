import type { Metadata, ResolvingMetadata } from 'next'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'
import { ComponentType } from 'react'

type PageProps = {
  params: {
    slug: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

type PageType = {
  component: ComponentType<{}>
  metadata: Metadata
}

export type ComponentsType = {
  [key: string]: PageType
}

const componentData = [
  {
    path: 'tf-intro',
    title: 'Tensorflow Playground / Intro',
    description: 'Introduction to TensorFlow.js',
    componentPath: 'ml/TfIntro',
  },
  {
    path: 'tf-xor',
    title: 'Tensorflow Playground / XOR',
    description: 'XOR problem using TensorFlow.js',
    componentPath: 'ml/TfXor',
  },
  {
    path: 'tf-linear-regression',
    title: 'Tensorflow Playground / Linear Regression',
    description: 'Linear regression using TensorFlow.js',
    componentPath: 'ml/TfLinearRegression',
  },
  {
    path: 'tf-cnn',
    title: 'Tensorflow Playground / CNN',
    description: 'Convolutional neural network using TensorFlow.js',
    componentPath: 'ml/TfCnn',
  },
  {
    path: 'tf-lstm',
    title: 'Tensorflow Playground / LSTM',
    description: 'Long short-term memory using TensorFlow.js',
    componentPath: 'ml/TfLstm',
  },
  {
    path: 'tf-posenet',
    title: 'Tensorflow Playground / Posenet',
    description: 'Real-time pose estimation using PoseNet and TensorFlow.js',
    componentPath: 'ml/TfPosenet',
  },
  {
    path: 'tf-body-pix',
    title: 'Tensorflow Playground / Body Pix',
    description: 'Body segmentation using TensorFlow.js BodyPix model',
    componentPath: 'ml/TfBodyPix',
  },
  {
    path: 'tf-coco-ssd',
    title: 'Tensorflow Playground / COCO SSD',
    description: 'Object detection using TensorFlow.js COCO SSD model',
    componentPath: 'ml/TfCocoSsd',
  },
]

const components: ComponentsType = componentData.reduce(
  (acc, { componentPath, title, description, path }) => {
    acc[path] = {
      component: dynamic(() => import(`@/components/${componentPath}`), { ssr: false }),
      metadata: {
        title,
        description,
      },
    }
    return acc
  },
  {} as ComponentsType
)

export async function generateMetadata(
  { params, searchParams }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const page = components[params.slug]
  return page.metadata
}

export default function Page({ params, searchParams }: PageProps) {
  const { slug = 'tf-intro' } = params
  const page = components[slug as string]
  if (!page) {
    // redirect as appropriate
    return redirect('/404')
  }
  return <page.component />
}
