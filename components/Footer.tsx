import Link from 'next/link'
import Image from 'next/image'
import { Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">ATTELIA</h3>
            <p className="text-sm mb-4">
              Ağız ve diş sağlığı ürünlerinde güvenilir çözüm ortağınız.
              Kaliteli ürünler, uygun fiyatlar ve hızlı teslimat.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white">
                <Facebook size={20} />
              </a>
              <a href="#" className="hover:text-white">
                <Instagram size={20} />
              </a>
              <a href="#" className="hover:text-white">
                <Twitter size={20} />
              </a>
              <a href="#" className="hover:text-white">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Hızlı Linkler</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-white">
                  Ürünler
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white">
                  Kategoriler
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white">
                  Sık Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Müşteri Hizmetleri</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shipping" className="hover:text-white">
                  Kargo ve Teslimat
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white">
                  İade ve Değişim
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white">
                  Kullanım Koşulları
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white">
                  Hesabım
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>
                  Örnek Mahallesi, Dental Sok. No:123<br />
                  Çankaya, Ankara
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={18} />
                <span>+90 (555) 123 45 67</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={18} />
                <span>info@attelia.com</span>
              </li>
            </ul>
            <div className="mt-4">
              <h4 className="text-white font-semibold mb-2">Çalışma Saatleri</h4>
              <p className="text-sm">
                Pazartesi - Cuma: 09:00 - 18:00<br />
                Cumartesi: 09:00 - 14:00
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <p>&copy; 2024 Attelia. Tüm hakları saklıdır.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Image src="/payment-visa.png" alt="Visa" width={48} height={24} className="h-6" />
              <Image src="/payment-mastercard.png" alt="Mastercard" width={48} height={24} className="h-6" />
              <Image src="/payment-amex.png" alt="American Express" width={48} height={24} className="h-6" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
