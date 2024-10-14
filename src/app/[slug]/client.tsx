'use client'

import dynamic from 'next/dynamic'

type Props = {
  componentPath: string
}

export default function PageClient({ componentPath }: Props) {
  const component = dynamic(() => import(componentPath), { ssr: false })
  return <>{component}</>
}
