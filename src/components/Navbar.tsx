'use client'

import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/ModeToggle'
import { Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

type NavLink = {
  href: string
  label: string
}

const links: NavLink[] = [
  { href: '/tf-intro', label: 'Intro' },
  { href: '/tf-xor', label: 'XOR' },
  { href: '/tf-linear-regression', label: 'LR' },
  { href: '/tf-cnn', label: 'CNN' },
  { href: '/tf-posenet', label: 'Posenet' },
  { href: '/tf-body-pix', label: 'Body Pix' },
  { href: '/tf-coco-ssd', label: 'Coco SSD' },
]

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [lastScrollY])

  useEffect(() => {
    setIsMenuOpen(false)
  }, [pathname])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        lastScrollY > 10 ? 'bg-background/80 backdrop-blur-sm shadow-md' : 'bg-background'
      }`}
    >
      <div className="w-full px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center" data-cy="home-link">
          <Image src="/images/logo.png" alt="Logo" width={50} height={50} />
        </Link>
        <nav className="hidden md:flex items-center grow mr-4 space-x-6">
          <div className="flex grow items-center justify-end space-x-4">
            {links.map(({ href, label }) => (
              <Link
                key={`nav-link-${href}-${label}`}
                href={href}
                className={`text-xs text-foreground hover:text-primary transition-colors ${
                  pathname === `/${href}` ? 'font-bold' : ''
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Button
            className="md:hidden"
            variant="outline"
            aria-label="Toggle menu"
            data-cy="menu-toggle"
            onClick={toggleMenu}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden">
          <nav className="flex flex-col items-center py-4 bg-background">
            <Link
              href="/about"
              className={`w-full text-center py-2 text-foreground hover:text-primary transition-colors ${
                pathname === '/about' ? 'font-bold' : ''
              }`}
              onClick={toggleMenu}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={`w-full text-center py-2 text-foreground hover:text-primary transition-colors ${
                pathname === '/contact' ? 'font-bold' : ''
              }`}
              onClick={toggleMenu}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

Navbar.displayName = 'Nav'

export { Navbar }
