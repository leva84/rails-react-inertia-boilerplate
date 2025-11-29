import { useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { getNavLinkClasses } from '@/utils/navLinksHelpers'
import BurgerButton from '@/components/BurgerButton'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { url } = usePage()

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          {/* Logo + Desktop */}
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link
                href="/"
                className="text-xl font-bold text-indigo-600 transition hover:text-indigo-500"
              >
                RailsReactInertiaBoilerplate
              </Link>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link href="/" className={getNavLinkClasses(url, '/')}>
                Root
              </Link>
              <Link href="/inertia-example" className={getNavLinkClasses(url, '/inertia-example')}>
                InertiaExample
              </Link>
            </div>
          </div>

          {/* Hamburger */}
          <BurgerButton
            isOpen={isMobileMenuOpen}
            onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 md:hidden">
          <div className="space-y-1 pt-2 pb-3">
            <Link
              href="/"
              className={getNavLinkClasses(url, '/', true)}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Root
            </Link>
            <Link
              href="/inertia-example"
              className={getNavLinkClasses(url, '/inertia-example', true)}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              InertiaExample
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
