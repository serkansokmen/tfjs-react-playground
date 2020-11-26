import React from 'react'
import Nav from '../components/nav'
import Head from 'next/head'

export default function Main({ children }) {
  return (
    <main>
      <Head>
        <script
          src="https://unpkg.com/ml5@0.6.0/dist/ml5.min.js"
          type="text/javascript"
        ></script>
      </Head>
      <Nav />
      {children}

      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
            'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
            'Helvetica Neue', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        code {
          font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
            monospace;
        }
      `}</style>
    </main>
  )
}
