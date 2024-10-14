type ComponentType = {
  key: string
  title: string
  description: string
  path: string
}

export type ComponentsType = {
  [key: string]: ComponentType
}

export const componentData: ComponentType[] = [
  {
    key: 'tf-intro',
    title: 'Tensorflow Playground / Intro',
    description: 'Introduction to TensorFlow.js',
    path: '@/components/ml/TfIntro',
  },
  {
    key: 'tf-xor',
    title: 'Tensorflow Playground / XOR',
    description: 'XOR problem using TensorFlow.js',
    path: '@/components/ml/TfXor',
  },
  {
    key: 'tf-linear-regression',
    title: 'Tensorflow Playground / Linear Regression',
    description: 'Linear regression using TensorFlow.js',
    path: '@/components/ml/TfLinearRegression',
  },
  {
    key: 'tf-cnn',
    title: 'Tensorflow Playground / CNN',
    description: 'Convolutional neural network using TensorFlow.js',
    path: '@/components/ml/TfCnn',
  },
  {
    key: 'tf-lstm',
    title: 'Tensorflow Playground / LSTM',
    description: 'Long short-term memory using TensorFlow.js',
    path: '@/components/ml/TfLstm',
  },
  {
    key: 'tf-posenet',
    title: 'Tensorflow Playground / Posenet',
    description: 'Real-time pose estimation using PoseNet and TensorFlow.js',
    path: '@/components/ml/TfPosenet',
  },
  {
    key: 'tf-body-pix',
    title: 'Tensorflow Playground / Body Pix',
    description: 'Body segmentation using TensorFlow.js BodyPix model',
    path: '@/components/ml/TfBodyPix',
  },
  {
    key: 'tf-coco-ssd',
    title: 'Tensorflow Playground / COCO SSD',
    description: 'Object detection using TensorFlow.js COCO SSD model',
    path: '@/components/ml/TfCocoSsd',
  },
]
