import React from 'react'
import Link from 'next/link'

const links = [
  { href: '/tf-intro', label: 'Intro' },
  { href: '/tf-xor', label: 'XOR' },
  // { href: '/tf-cnn', label: 'CNN' },
  // { href: '/tf-body-pix', label: 'Body Pix' },
  { href: '/tf-posenet', label: 'Posenet' },
  { href: '/tf-coco-ssd', label: 'Coco SSD' },
].map(link => {
  link.key = `nav-link-${link.href}-${link.label}`
  return link
})

const Nav = () => (
  <nav>
    <ul>
      <li>
        <Link prefetch href="/">
          <a>Home</a>
        </Link>
      </li>
      <ul>
        {links.map(({ key, href, label }) => (
          <li key={key}>
            <Link href={href} prefetch>
              <a>{label}</a>
            </Link>
          </li>
        ))}
      </ul>
    </ul>

    <style jsx>{`
      :global(body) {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, Avenir Next, Avenir, 
          Helvetica, sans-serif;
      }
      nav {
        text-align: center;
      }
      ul {
        display: flex;
        justify-content: space-between;
      }
      nav > ul {
        padding: 4px 16px;
      }
      li {
        display: flex;
        padding: 6px 8px;
      }
      a {
        color: #067df7;
        text-decoration: none;
        font-size: 13px;
      }
    `}</style>
  </nav>
)

export default Nav
