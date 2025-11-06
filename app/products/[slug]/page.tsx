'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart, Share2, Minus, Plus, Star } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'
import ProductCard from '@/components/ProductCard'

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [activeTab, setActiveTab] = useState('description')

  useEffect(() => {
    if (params.slug) {
      fetchProduct(params.slug as string)
    }
  }, [params.slug])

  const fetchProduct = async (slug: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${slug}`)
      const data = await response.json()

      if (data.success) {
        setProduct(data.data)
      }
    } catch (error) {
      console.error('Error fetching product')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = () => {
    if (!product) return

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += quantity
    } else {
      cart.push({ ...product, quantity })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))
    alert('Ürün sepete eklendi!')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-dental-blue"></div>
        <p className="mt-4 text-gray-600">Ürün yükleniyor...</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Ürün Bulunamadı</h1>
        <Link href="/products" className="text-dental-blue hover:underline">
          Ürünlere Geri Dön
        </Link>
      </div>
    )
  }

  const displayPrice = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.price - product.discountPrice!) / product.price) * 100)
    : 0

  return (
    <div className="bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-dental-blue">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-dental-blue">Ürünler</Link>
            <span>/</span>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-dental-blue">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square bg-gray-100 rounded-lg mb-4 overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[selectedImage]}
                    alt={product.name}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index
                          ? 'border-dental-blue'
                          : 'border-transparent'
                      }`}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              {/* Badges */}
              <div className="flex gap-2 mb-3">
                {product.isNew && (
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded">
                    YENİ
                  </span>
                )}
                {hasDiscount && (
                  <span className="bg-red-500 text-white text-xs px-3 py-1 rounded">
                    %{discountPercentage} İNDİRİM
                  </span>
                )}
              </div>

              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              {/* Rating & SKU */}
              <div className="flex items-center gap-4 mb-4">
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={18}
                          fill={i < Math.floor(product.rating!) ? 'currentColor' : 'none'}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      ({product.salesCount} değerlendirme)
                    </span>
                  </div>
                )}
                <span className="text-sm text-gray-600">SKU: {product.sku}</span>
              </div>

              {/* Short Description */}
              {product.shortDesc && (
                <p className="text-gray-600 mb-6">{product.shortDesc}</p>
              )}

              {/* Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4 mb-2">
                  <span className="text-4xl font-bold text-dental-blue">
                    {formatPrice(displayPrice)}
                  </span>
                  {hasDiscount && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                {product.wholesalePrice && (
                  <div className="text-sm">
                    <span className="text-green-600 font-semibold">
                      Toptan Fiyat: {formatPrice(product.wholesalePrice)}
                    </span>
                    {product.minOrderQty > 1 && (
                      <span className="text-gray-600 ml-2">
                        (Minimum {product.minOrderQty} {product.unit})
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-semibold">Stokta Var ({product.stock} adet)</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-semibold">Stokta Yok</span>
                  </div>
                )}
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex gap-4 mb-6">
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-100"
                  >
                    <Minus size={18} />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-x focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-gray-100"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <button
                  onClick={addToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold ${
                    product.stock === 0
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-dental-blue text-white hover:bg-dental-dark'
                  }`}
                >
                  <ShoppingCart size={20} />
                  <span>{product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-6">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg hover:bg-gray-50">
                  <Heart size={20} />
                  <span>Favorilere Ekle</span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 border rounded-lg hover:bg-gray-50">
                  <Share2 size={20} />
                  <span>Paylaş</span>
                </button>
              </div>

              {/* Product Details */}
              <div className="border-t pt-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Kategori:</span>
                    <Link
                      href={`/categories/${product.category.slug}`}
                      className="text-dental-blue hover:underline"
                    >
                      {product.category.name}
                    </Link>
                  </li>
                  {product.brand && (
                    <li className="flex justify-between">
                      <span className="text-gray-600">Marka:</span>
                      <span className="font-semibold">{product.brand}</span>
                    </li>
                  )}
                  {product.manufacturer && (
                    <li className="flex justify-between">
                      <span className="text-gray-600">Üretici:</span>
                      <span>{product.manufacturer}</span>
                    </li>
                  )}
                  {product.weight && (
                    <li className="flex justify-between">
                      <span className="text-gray-600">Ağırlık:</span>
                      <span>{product.weight} kg</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b">
            <div className="flex">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'description'
                    ? 'border-b-2 border-dental-blue text-dental-blue'
                    : 'text-gray-600'
                }`}
              >
                Açıklama
              </button>
              <button
                onClick={() => setActiveTab('specs')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'specs'
                    ? 'border-b-2 border-dental-blue text-dental-blue'
                    : 'text-gray-600'
                }`}
              >
                Özellikler
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-6 py-4 font-semibold ${
                  activeTab === 'reviews'
                    ? 'border-b-2 border-dental-blue text-dental-blue'
                    : 'text-gray-600'
                }`}
              >
                Değerlendirmeler
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'description' && (
              <div>
                <p className="text-gray-700 whitespace-pre-line">
                  {product.description || 'Ürün açıklaması henüz eklenmemiş.'}
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 text-gray-600 font-semibold w-1/3">SKU</td>
                      <td className="py-3">{product.sku}</td>
                    </tr>
                    {product.barcode && (
                      <tr className="border-b">
                        <td className="py-3 text-gray-600 font-semibold">Barkod</td>
                        <td className="py-3">{product.barcode}</td>
                      </tr>
                    )}
                    {product.brand && (
                      <tr className="border-b">
                        <td className="py-3 text-gray-600 font-semibold">Marka</td>
                        <td className="py-3">{product.brand}</td>
                      </tr>
                    )}
                    {product.manufacturer && (
                      <tr className="border-b">
                        <td className="py-3 text-gray-600 font-semibold">Üretici</td>
                        <td className="py-3">{product.manufacturer}</td>
                      </tr>
                    )}
                    {product.weight && (
                      <tr className="border-b">
                        <td className="py-3 text-gray-600 font-semibold">Ağırlık</td>
                        <td className="py-3">{product.weight} kg</td>
                      </tr>
                    )}
                    {product.dimensions && (
                      <tr className="border-b">
                        <td className="py-3 text-gray-600 font-semibold">Boyutlar</td>
                        <td className="py-3">{product.dimensions}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <p className="text-gray-600 text-center py-8">
                  Henüz değerlendirme yapılmamış.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
