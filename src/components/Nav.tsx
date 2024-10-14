import Link from 'next/link'

type NavLink = {
  href: string
  label: string
}

const links: NavLink[] = [
  { href: '/tf-intro', label: 'Intro' },
  { href: '/tf-xor', label: 'XOR' },
  { href: '/tf-linear-regression', label: 'LR' },
  { href: '/tf-cnn', label: 'CNN' },
  // { href: '/tf-lstm?key=shakespeare', label: 'LSTM' }, // TODO: Fix LSTM with custom models or remove this link
  { href: '/tf-posenet', label: 'Posenet' },
  { href: '/tf-body-pix', label: 'Body Pix' },
  { href: '/tf-coco-ssd', label: 'Coco SSD' },
]

function Nav() {
  return (
    <nav className="text-center">
      <ul className="flex justify-between p-4">
        <li className="flex p-2">
          <Link href="/" className="text-primary text-sm no-underline">
            Home
          </Link>
        </li>
        <ul className="flex">
          {links.map(({ href, label }) => (
            <li key={`nav-link-${href}-${label}`} className="flex p-2">
              <Link href={href} className="text-primary text-sm no-underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </ul>
    </nav>
  )
}

Nav.displayName = 'Nav'

export { Nav }