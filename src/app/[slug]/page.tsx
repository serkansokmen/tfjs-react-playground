import dynamic from 'next/dynamic'
import type { Metadata, ResolvingMetadata } from 'next'
import Loading from './loading'
import { ComponentType } from 'react'

const PageClient = dynamic(() => import('./client'), {
  loading: () => <Loading message="Loading TensorFlow.js component..." />,
  ssr: false,
})

type PageProps = {
  params: {
    slug:
      | 'tf-intro'
      | 'tf-xor'
      | 'tf-linear-regression'
      | 'tf-cnn'
      | 'tf-lstm'
      | 'tf-posenet'
      | 'tf-body-pix'
      | 'tf-coco-ssd'
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

const components: ComponentsType = {
  'tf-intro': {
    component: dynamic(() => import('@/components/ml/TfIntro'), { ssr: false }),
    metadata: {
      title: 'Tensorflow Playground / Intro',
      description: 'Introduction to TensorFlow.js',
    },
  },
  'tf-xor': {
    component: dynamic(() => import('@/components/ml/TfXor'), { ssr: false }),
    metadata: {
      title: 'Tensorflow Playground / XOR',
      description: 'XOR problem using TensorFlow.js',
    },
  },
  'tf-linear-regression': {
    component: dynamic(() => import('@/components/ml/TfLinearRegression'), { ssr: false }),
    metadata: {
      title: 'Tensorflow Playground / Linear Regression',
      description: 'Linear regression using TensorFlow.js',
    },
  },
  'tf-cnn': {
    component: dynamic(() => import('@/components/ml/TfCnn'), { ssr: false }),
    metadata: {
      title: 'Tensorflow Playground / CNN',
      description: 'Convolutional neural network using TensorFlow.js',
    },
  },
  'tf-lstm': {
    component: dynamic(() => import('@/components/ml/TfLstm'), { ssr: false }),
    metadata: {
      title: 'Tensorflow Playground / LSTM',
      description: 'Long short-term memory using TensorFlow.js',
    },
  },
  'tf-posenet': {
    component: dynamic(() => import('@/components/ml/TfPosenet'), { ssr: false }),
    metadata: {
      title: 'Tensorflow Playground / Posenet',
      description: 'Real-time pose estimation using PoseNet and TensorFlow.js',
    },
  },
  'tf-body-pix': {
    component: dynamic(() => import('@/components/ml/TfBodyPix'), { ssr: false }),
    metadata: {
      title: 'Tensorflow Playground / Body Pix',
      description: 'Body segmentation using TensorFlow.js BodyPix model',
    },
  },
  'tf-coco-ssd': {
    component: dynamic(() => import('@/components/ml/TfCocoSsd'), { ssr: false }),
    metadata: {
      title: 'Tensorflow Playground / COCO SSD',
      description: 'Object detection using TensorFlow.js COCO SSD model',
    },
  },
}

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
  return <page.component />
}
