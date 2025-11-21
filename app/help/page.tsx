'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  FileText,
  ShoppingCart,
  Users,
  Settings,
  Mail
} from 'lucide-react'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const faqData: FAQItem[] = [
  {
    id: '1',
    category: 'Satın Alma Talepleri',
    question: 'Nasıl yeni bir satın alma talebi oluşturabilirim?',
    answer: 'Sol menüden "Talepler" > "Yeni Talep" seçeneğine tıklayın. Formu doldurup ürünleri ekledikten sonra "Gönder" butonuna basarak talebinizi onaya sunabilirsiniz.'
  },
  {
    id: '2',
    category: 'Satın Alma Talepleri',
    question: 'Talebimin durumunu nasıl takip edebilirim?',
    answer: '"Talepler" sayfasından tüm taleplerinizi görebilirsiniz. Her talebin yanında durumu (Beklemede, Onaylandı, Reddedildi vb.) görüntülenir. Detaylar için talebe tıklayabilirsiniz.'
  },
  {
    id: '3',
    category: 'Satın Alma Talepleri',
    question: 'Reddedilen talebimi düzenleyebilir miyim?',
    answer: 'Evet, reddedilen talepleri düzenleyip tekrar onaya sunabilirsiniz. Talep detay sayfasında "Düzenle" butonuna tıklayarak gerekli değişiklikleri yapabilirsiniz.'
  },
  {
    id: '4',
    category: 'Onay Süreci',
    question: 'Onay süreci nasıl işliyor?',
    answer: 'Talepler, tutarına ve türüne göre farklı onay aşamalarından geçer. Departman müdürü, finans ve genel müdür onayı gerekebilir. Her aşamada ilgili kişiye bildirim gönderilir.'
  },
  {
    id: '5',
    category: 'Onay Süreci',
    question: 'Onay bekleyen talepleri nasıl görebilirim?',
    answer: '"Onaylar" sayfasından size atanan tüm onay bekleyen talepleri görebilirsiniz. Hızlı işlemler ile doğrudan onaylama veya reddetme yapabilirsiniz.'
  },
  {
    id: '6',
    category: 'Bütçe',
    question: 'Departman bütçemi nasıl kontrol edebilirim?',
    answer: '"Raporlar" sayfasından departman bazlı bütçe kullanımını görebilirsiniz. Ayrıca dashboard üzerinde de özet bütçe bilgisi görüntülenir.'
  },
  {
    id: '7',
    category: 'Bütçe',
    question: 'Bütçe aşıldığında ne olur?',
    answer: 'Bütçe %80\'e ulaştığında uyarı, %90\'ı aştığında kritik uyarı görüntülenir. Bütçe aşımı durumunda talepler otomatik olarak üst yönetim onayına yönlendirilir.'
  },
  {
    id: '8',
    category: 'Siparişler',
    question: 'Siparişlerimi nasıl takip edebilirim?',
    answer: '"Siparişler" sayfasından tüm siparişlerinizi görebilirsiniz. Sipariş durumu (İşleniyor, Kargoda, Teslim Edildi) anlık olarak güncellenir.'
  },
  {
    id: '9',
    category: 'Hesap',
    question: 'Şifremi nasıl değiştirebilirim?',
    answer: 'Sağ üst köşedeki profil ikonuna tıklayıp "Profil" sayfasına gidin. "Şifre Değiştir" sekmesinden yeni şifrenizi belirleyebilirsiniz.'
  },
  {
    id: '10',
    category: 'Hesap',
    question: 'Bildirim tercihlerimi nasıl ayarlayabilirim?',
    answer: 'Admin panelinden "Ayarlar" > "Bildirimler" sekmesine giderek hangi bildirimleri almak istediğinizi seçebilirsiniz.'
  }
]

const categories = ['Tümü', 'Satın Alma Talepleri', 'Onay Süreci', 'Bütçe', 'Siparişler', 'Hesap']

const categoryIcons: Record<string, any> = {
  'Satın Alma Talepleri': FileText,
  'Onay Süreci': Users,
  'Bütçe': ShoppingCart,
  'Siparişler': ShoppingCart,
  'Hesap': Settings,
}

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tümü')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const filteredFAQ = faqData.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'Tümü' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-blue-600 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Yardım Merkezi</h1>
          <p className="text-gray-600 mt-2">Sıkça sorulan sorular ve kullanım kılavuzu</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Soru veya anahtar kelime ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="space-y-3">
          {filteredFAQ.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <HelpCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="text-gray-600 mt-4">Sonuç bulunamadı</p>
            </div>
          ) : (
            filteredFAQ.map((item) => (
              <div key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                      {item.category}
                    </span>
                    <span className="font-medium">{item.question}</span>
                  </div>
                  {expandedId === item.id ? (
                    <ChevronUp className="text-gray-400" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400" size={20} />
                  )}
                </button>
                {expandedId === item.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                    <p className="text-gray-600 mt-3">{item.answer}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Contact Support */}
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <Mail className="mx-auto h-8 w-8 text-blue-600 mb-3" />
          <h3 className="font-semibold text-gray-900">Hala yardıma mı ihtiyacınız var?</h3>
          <p className="text-gray-600 mt-1 mb-4">Destek ekibimize ulaşın</p>
          <a
            href="mailto:destek@attelia.com"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            <Mail size={18} />
            destek@attelia.com
          </a>
        </div>
      </div>
    </DashboardLayout>
  )
}
