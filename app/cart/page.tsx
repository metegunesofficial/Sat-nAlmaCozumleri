'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface CartItem {
  id: string
  name: string
  slug: string
  price: number
  discountPrice?: number
  images: string[]
  stock: number
  quantity: number
  unit: string
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    setCartItems(cart)
    setLoading(false)
  }

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedCart = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (itemId: string) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId)
    setCartItems(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const clearCart = () => {
    if (confirm('Sepeti temizlemek istediğinizden emin misiniz?')) {
      setCartItems([])
      localStorage.setItem('cart', JSON.stringify([]))
      window.dispatchEvent(new Event('cartUpdated'))
    }
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.discountPrice || item.price
      return total + (price * item.quantity)
    }, 0)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const shipping = subtotal > 500 ? 0 : 50 // Free shipping over 500 TL
    const tax = subtotal * 0.18 // 18% KDV
    return subtotal + shipping + tax
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
        <p className="mt-4 text-gray-600">Sepet yükleniyor...</p>
      </div>
    )
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-white rounded-lg shadow-md p-12">
            <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold mb-4">Sepetiniz Boş</h2>
            <p className="text-gray-600 mb-6">
              Sepetinizde henüz ürün bulunmamaktadır. Alışverişe başlamak için ürünlerimize göz atın.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-dental-blue text-white px-6 py-3 rounded-lg hover:bg-dental-dark transition"
            >
              Ürünleri İncele
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = calculateSubtotal()
  const shipping = subtotal > 500 ? 0 : 50
  const tax = subtotal * 0.18
  const total = calculateTotal()

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">Alışveriş Sepeti</h1>
          <p className="text-gray-600 mt-2">{cartItems.length} ürün</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              {/* Header */}
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Sepetinizdeki Ürünler</h2>
                <button
                  onClick={clearCart}
                  className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1"
                >
                  <Trash2 size={16} />
                  Sepeti Temizle
                </button>
              </div>

              {/* Items */}
              <div className="divide-y">
                {cartItems.map((item) => {
                  const displayPrice = item.discountPrice || item.price
                  const itemTotal = displayPrice * item.quantity

                  return (
                    <div key={item.id} className="p-6">
                      <div className="flex gap-4">
                        {/* Image */}
                        <Link
                          href={`/products/${item.slug}`}
                          className="flex-shrink-0"
                        >
                          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                            {item.images && item.images.length > 0 ? (
                              <Image
                                src={item.images[0]}
                                alt={item.name}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                No Image
                              </div>
                            )}
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1">
                          <Link
                            href={`/products/${item.slug}`}
                            className="font-semibold hover:text-dental-blue block mb-2"
                          >
                            {item.name}
                          </Link>

                          <div className="flex items-center gap-4 mb-3">
                            <span className="text-lg font-bold text-dental-blue">
                              {formatPrice(displayPrice)}
                            </span>
                            {item.discountPrice && item.discountPrice < item.price && (
                              <span className="text-sm text-gray-400 line-through">
                                {formatPrice(item.price)}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={16} />
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1
                                  updateQuantity(item.id, val)
                                }}
                                className="w-16 text-center border-x focus:outline-none"
                                min="1"
                                max={item.stock}
                              />
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100"
                                disabled={item.quantity >= item.stock}
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            {/* Item Total */}
                            <div className="text-right">
                              <div className="font-bold text-lg">
                                {formatPrice(itemTotal)}
                              </div>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 ml-auto mt-1"
                              >
                                <Trash2 size={14} />
                                Kaldır
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Continue Shopping */}
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-dental-blue hover:underline mt-6"
            >
              ← Alışverişe Devam Et
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Sipariş Özeti</h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-semibold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Kargo:</span>
                  <span className="font-semibold">
                    {shipping === 0 ? (
                      <span className="text-green-600">Ücretsiz</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">KDV (18%):</span>
                  <span className="font-semibold">{formatPrice(tax)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg">
                  <span className="font-bold">Toplam:</span>
                  <span className="font-bold text-dental-blue text-xl">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>

              {/* Free Shipping Progress */}
              {shipping > 0 && (
                <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-dental-blue mb-2">
                    {formatPrice(500 - subtotal)} daha alışveriş yapın,
                    <br />
                    <strong>Kargo Ücretsiz!</strong>
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-dental-blue h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((subtotal / 500) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Link
                href="/checkout"
                className="w-full bg-dental-blue text-white py-3 rounded-lg font-semibold hover:bg-dental-dark transition flex items-center justify-center gap-2"
              >
                Ödemeye Geç
                <ArrowRight size={20} />
              </Link>

              {/* Security Badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Güvenli Ödeme
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Hızlı Kargo
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Kolay İade
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
