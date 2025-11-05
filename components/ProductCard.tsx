import Link from 'next/link'
import Image from 'next/image'
import { ShoppingCart, Heart, Eye } from 'lucide-react'
import { Product } from '@/types'
import { formatPrice } from '@/lib/utils'

interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const displayPrice = product.discountPrice || product.price
  const hasDiscount = product.discountPrice && product.discountPrice < product.price

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    // Add to cart logic
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const existingItem = cart.find((item: any) => item.id === product.id)

    if (existingItem) {
      existingItem.quantity += 1
    } else {
      cart.push({ ...product, quantity: 1 })
    }

    localStorage.setItem('cart', JSON.stringify(cart))
    window.dispatchEvent(new Event('cartUpdated'))

    // Show notification
    alert('Ürün sepete eklendi!')
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {product.isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded">
                YENİ
              </span>
            )}
            {hasDiscount && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                İNDİRİM
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded">
                STOKTA YOK
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              title="Favorilere ekle"
            >
              <Heart size={18} />
            </button>
            <button
              className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
              title="Hızlı görünüm"
            >
              <Eye size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <div className="text-xs text-gray-500 mb-1">
            {product.category?.name}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[2.5rem]">
            {product.name}
          </h3>

          {/* SKU & Stock */}
          <div className="text-xs text-gray-500 mb-2">
            <span>SKU: {product.sku}</span>
            <span className="ml-3">Stok: {product.stock}</span>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex text-yellow-400">
                {'★'.repeat(Math.floor(product.rating))}
                {'☆'.repeat(5 - Math.floor(product.rating))}
              </div>
              <span className="text-xs text-gray-500">
                ({product.salesCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-dental-blue">
              {formatPrice(displayPrice)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Wholesale Price */}
          {product.wholesalePrice && (
            <div className="text-xs text-green-600 mb-3">
              Toptan: {formatPrice(product.wholesalePrice)}
              {product.minOrderQty > 1 && ` (Min: ${product.minOrderQty} ${product.unit})`}
            </div>
          )}

          {/* Add to Cart Button */}
          <button
            onClick={addToCart}
            disabled={product.stock === 0}
            className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
              product.stock === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-dental-blue text-white hover:bg-dental-dark'
            }`}
          >
            <ShoppingCart size={18} />
            <span>{product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}
