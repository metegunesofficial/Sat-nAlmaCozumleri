import Link from 'next/link'
import Image from 'next/image'
import ProductCard from '@/components/ProductCard'
import { ChevronRight, Truck, Shield, CreditCard, HeadphonesIcon } from 'lucide-react'

export default function Home() {
  // Mock data - Will be replaced with API calls
  const featuredProducts = []
  const newProducts = []
  const categories = []

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-dental-blue to-dental-light text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Ağız ve Diş Sağlığı<br />Ürünlerinde Uzman
              </h1>
              <p className="text-lg mb-6 text-blue-100">
                Kaliteli dental ürünler, uygun fiyatlar ve hızlı teslimat ile
                profesyonel çözüm ortağınız.
              </p>
              <div className="flex gap-4">
                <Link
                  href="/products"
                  className="bg-white text-dental-blue px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                >
                  Ürünleri İncele
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-dental-blue transition"
                >
                  Hakkımızda
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">🦷</div>
                  <h3 className="text-2xl font-bold mb-2">1000+ Ürün</h3>
                  <p className="text-blue-100">Geniş ürün yelpazesi</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Truck className="text-dental-blue" size={24} />
              </div>
              <div>
                <h4 className="font-semibold">Hızlı Kargo</h4>
                <p className="text-sm text-gray-600">Aynı gün kargo</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Shield className="text-dental-blue" size={24} />
              </div>
              <div>
                <h4 className="font-semibold">Güvenli Alışveriş</h4>
                <p className="text-sm text-gray-600">SSL sertifikalı</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <CreditCard className="text-dental-blue" size={24} />
              </div>
              <div>
                <h4 className="font-semibold">Kolay Ödeme</h4>
                <p className="text-sm text-gray-600">Taksit seçenekleri</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-lg">
                <HeadphonesIcon className="text-dental-blue" size={24} />
              </div>
              <div>
                <h4 className="font-semibold">7/24 Destek</h4>
                <p className="text-sm text-gray-600">Müşteri hizmetleri</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Kategoriler</h2>
            <Link
              href="/categories"
              className="text-dental-blue flex items-center gap-1 hover:gap-2 transition-all"
            >
              Tümünü Gör <ChevronRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Diş Fırçaları', icon: '🪥', count: 125 },
              { name: 'Diş Macunları', icon: '🧴', count: 89 },
              { name: 'Ağız Suları', icon: '💧', count: 56 },
              { name: 'Diş İplikleri', icon: '🧵', count: 43 },
              { name: 'Protezler', icon: '🦷', count: 78 },
              { name: 'İmplantlar', icon: '⚙️', count: 92 },
            ].map((category) => (
              <Link
                key={category.name}
                href={`/categories/${category.name.toLowerCase()}`}
                className="bg-white p-6 rounded-lg text-center hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-2">{category.icon}</div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.count} ürün</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Öne Çıkan Ürünler</h2>
            <Link
              href="/products?featured=true"
              className="text-dental-blue flex items-center gap-1 hover:gap-2 transition-all"
            >
              Tümünü Gör <ChevronRight size={20} />
            </Link>
          </div>

          {featuredProducts.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-600">
                Ürünler yükleniyor... Lütfen veritabanını yapılandırın.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* New Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">Yeni Ürünler</h2>
            <Link
              href="/products?new=true"
              className="text-dental-blue flex items-center gap-1 hover:gap-2 transition-all"
            >
              Tümünü Gör <ChevronRight size={20} />
            </Link>
          </div>

          {newProducts.length === 0 ? (
            <div className="bg-gray-100 rounded-lg p-12 text-center">
              <p className="text-gray-600">
                Ürünler yükleniyor... Lütfen veritabanını yapılandırın.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-dental-blue to-dental-light text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Toptan Alımlarınız İçin Özel Fiyatlar
          </h2>
          <p className="text-lg mb-6 text-blue-100">
            Kurumsal müşterilerimize özel indirimler ve ödeme koşulları
          </p>
          <Link
            href="/contact"
            className="inline-block bg-white text-dental-blue px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Bizimle İletişime Geçin
          </Link>
        </div>
      </section>
    </div>
  )
}
