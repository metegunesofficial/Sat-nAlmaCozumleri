'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)

    // Get cart count from localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartCount(cart.length)
  }, [])

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-dental-blue text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex gap-4">
            <span>📞 +90 (555) 123 45 67</span>
            <span>✉️ info@attelia.com</span>
          </div>
          <div className="hidden md:flex gap-4">
            <Link href="/about" className="hover:text-dental-light">
              Hakkımızda
            </Link>
            <Link href="/contact" className="hover:text-dental-light">
              İletişim
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold text-dental-blue">
              ATTELIA
            </div>
            <div className="text-sm text-gray-600 hidden sm:block">
              Ağız ve Diş Sağlığı
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Ürün, kategori veya marka ara..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-dental-blue">
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* User */}
            <Link
              href={isLoggedIn ? '/account' : '/login'}
              className="flex items-center gap-2 hover:text-dental-blue"
            >
              <User size={24} />
              <span className="hidden lg:inline">
                {isLoggedIn ? 'Hesabım' : 'Giriş'}
              </span>
            </Link>

            {/* Cart */}
            <Link
              href="/cart"
              className="flex items-center gap-2 hover:text-dental-blue relative"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
              <span className="hidden lg:inline">Sepet</span>
            </Link>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden mt-4">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Ürün ara..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dental-blue"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 text-dental-blue">
              <Search size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-gray-50 border-t">
        <div className="container mx-auto px-4">
          <ul className="hidden md:flex gap-8 py-3">
            <li>
              <Link href="/" className="hover:text-dental-blue font-medium">
                Ana Sayfa
              </Link>
            </li>
            <li>
              <Link href="/products" className="hover:text-dental-blue font-medium">
                Tüm Ürünler
              </Link>
            </li>
            <li>
              <Link href="/categories" className="hover:text-dental-blue font-medium">
                Kategoriler
              </Link>
            </li>
            <li>
              <Link href="/new-products" className="hover:text-dental-blue font-medium">
                Yeni Ürünler
              </Link>
            </li>
            <li>
              <Link href="/deals" className="hover:text-dental-blue font-medium">
                Fırsatlar
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <nav className="container mx-auto px-4 py-4">
            <ul className="space-y-4">
              <li>
                <Link
                  href="/"
                  className="block hover:text-dental-blue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="block hover:text-dental-blue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Tüm Ürünler
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="block hover:text-dental-blue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="block hover:text-dental-blue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="block hover:text-dental-blue"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  İletişim
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </header>
  )
}
