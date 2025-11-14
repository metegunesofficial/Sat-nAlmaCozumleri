'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useNotification } from '@/contexts/NotificationContext'
import Loading from '@/components/Loading'
import { ShoppingBag, CreditCard, Truck, CheckCircle, AlertCircle } from 'lucide-react'

interface CartItem {
  id: string
  productId: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    discountPrice?: number
    images: string[]
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { success, error } = useNotification()

  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState(1) // 1: Info, 2: Payment, 3: Confirmation

  const [formData, setFormData] = useState({
    // Billing info
    billingName: user?.name || '',
    billingEmail: user?.email || '',
    billingPhone: '',
    billingAddress: '',
    billingCity: '',
    billingDistrict: '',
    billingPostal: '',

    // Shipping info
    sameAsBilling: true,
    shippingName: '',
    shippingPhone: '',
    shippingAddress: '',
    shippingCity: '',
    shippingDistrict: '',
    shippingPostal: '',

    // Payment
    paymentMethod: 'BANK_TRANSFER' as 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH_ON_DELIVERY',
    notes: '',
  })

  useEffect(() => {
    loadCart()
  }, [])

  const loadCart = () => {
    try {
      const cartData = localStorage.getItem('cart')
      if (cartData) {
        setCart(JSON.parse(cartData))
      }
    } catch (err) {
      error('Sepet yüklenemedi')
    } finally {
      setIsLoading(false)
    }
  }

  const calculateSubtotal = () => {
    return cart.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price
      return sum + (price * item.quantity)
    }, 0)
  }

  const subtotal = calculateSubtotal()
  const shippingCost = subtotal > 500 ? 0 : 50 // Free shipping over 500 TL
  const tax = subtotal * 0.18 // 18% VAT
  const total = subtotal + shippingCost + tax

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const validateStep1 = () => {
    if (!formData.billingName || !formData.billingEmail || !formData.billingPhone ||
        !formData.billingAddress || !formData.billingCity || !formData.billingDistrict ||
        !formData.billingPostal) {
      error('Lütfen tüm fatura bilgilerini doldurun')
      return false
    }

    if (!formData.sameAsBilling) {
      if (!formData.shippingName || !formData.shippingAddress || !formData.shippingCity) {
        error('Lütfen teslimat bilgilerini doldurun')
        return false
      }
    }

    return true
  }

  const handleContinue = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2)
      }
    } else if (step === 2) {
      handlePlaceOrder()
    }
  }

  const handlePlaceOrder = async () => {
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        error('Lütfen giriş yapın')
        router.push('/login')
        return
      }

      const orderData = {
        ...formData,
        shippingName: formData.sameAsBilling ? formData.billingName : formData.shippingName,
        shippingPhone: formData.sameAsBilling ? formData.billingPhone : formData.shippingPhone,
        shippingAddress: formData.sameAsBilling ? formData.billingAddress : formData.shippingAddress,
        shippingCity: formData.sameAsBilling ? formData.billingCity : formData.shippingCity,
        shippingDistrict: formData.sameAsBilling ? formData.billingDistrict : formData.shippingDistrict,
        shippingPostal: formData.sameAsBilling ? formData.billingPostal : formData.shippingPostal,
        shippingCost,
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (result.success) {
        success('Siparişiniz başarıyla oluşturuldu!')
        localStorage.removeItem('cart')
        setStep(3)

        // Redirect to orders page after 3 seconds
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        error(result.error || 'Sipariş oluşturulamadı')
      }
    } catch (err: any) {
      console.error('Order error:', err)
      error('Sipariş oluşturulurken bir hata oluştu')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading message="Ödeme sayfası yükleniyor..." />
      </DashboardLayout>
    )
  }

  if (cart.length === 0) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Sepetiniz Boş</h2>
          <p className="text-gray-600 mb-6">Sipariş vermek için önce sepete ürün eklemelisiniz</p>
          <button
            onClick={() => router.push('/products')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Ürünlere Gözat
          </button>
        </div>
      </DashboardLayout>
    )
  }

  if (step === 3) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Sipariş Tamamlandı!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Siparişiniz başarıyla alındı. Kısa süre içinde onay sürecine alınacaktır.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <p className="text-sm text-blue-800">
              Sipariş detaylarınız e-posta adresinize gönderildi.
            </p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Ödeme</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </div>
            <div className="text-sm ml-2">Adres Bilgileri</div>
          </div>
          <div className={`w-24 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </div>
            <div className="text-sm ml-2">Ödeme</div>
          </div>
          <div className={`w-24 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </div>
            <div className="text-sm ml-2">Onay</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <Truck className="w-6 h-6 mr-2" />
                  Teslimat Bilgileri
                </h2>

                {/* Billing Info */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">Fatura Bilgileri</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                      <input
                        type="text"
                        name="billingName"
                        value={formData.billingName}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
                      <input
                        type="email"
                        name="billingEmail"
                        value={formData.billingEmail}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                      <input
                        type="tel"
                        name="billingPhone"
                        value={formData.billingPhone}
                        onChange={handleInputChange}
                        placeholder="5xxxxxxxxx"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                      <input
                        type="text"
                        name="billingAddress"
                        value={formData.billingAddress}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
                      <input
                        type="text"
                        name="billingCity"
                        value={formData.billingCity}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">İlçe</label>
                      <input
                        type="text"
                        name="billingDistrict"
                        value={formData.billingDistrict}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Posta Kodu</label>
                      <input
                        type="text"
                        name="billingPostal"
                        value={formData.billingPostal}
                        onChange={handleInputChange}
                        placeholder="34000"
                        maxLength={5}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Same as Billing Checkbox */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="sameAsBilling"
                      checked={formData.sameAsBilling}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Teslimat adresi fatura adresi ile aynı</span>
                  </label>
                </div>

                {/* Shipping Info */}
                {!formData.sameAsBilling && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Teslimat Adresi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                        <input
                          type="text"
                          name="shippingName"
                          value={formData.shippingName}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                        <input
                          type="tel"
                          name="shippingPhone"
                          value={formData.shippingPhone}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">İl</label>
                        <input
                          type="text"
                          name="shippingCity"
                          value={formData.shippingCity}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
                        <input
                          type="text"
                          name="shippingAddress"
                          value={formData.shippingAddress}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <CreditCard className="w-6 h-6 mr-2" />
                  Ödeme Yöntemi
                </h2>

                <div className="space-y-4 mb-6">
                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="BANK_TRANSFER"
                      checked={formData.paymentMethod === 'BANK_TRANSFER'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 font-medium">Havale / EFT</span>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CASH_ON_DELIVERY"
                      checked={formData.paymentMethod === 'CASH_ON_DELIVERY'}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 font-medium">Kapıda Ödeme</span>
                  </label>

                  <label className="flex items-center p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 transition-colors opacity-50">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="CREDIT_CARD"
                      disabled
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="ml-3 font-medium">Kredi Kartı (Yakında)</span>
                  </label>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sipariş Notu (Opsiyonel)</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Siparişiniz ile ilgili özel notlarınız..."
                  />
                </div>

                {formData.paymentMethod === 'BANK_TRANSFER' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-medium mb-2">Banka Bilgileri:</p>
                    <p>Türkiye İş Bankası - Şube: 1234</p>
                    <p>IBAN: TR00 0000 0000 0000 0000 0000 00</p>
                    <p className="mt-2 text-xs">Açıklama kısmına sipariş numaranızı yazınız.</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-4">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Sipariş Özeti</h2>

              <div className="space-y-3 mb-6">
                {cart.map((item) => {
                  const price = item.product.discountPrice || item.product.price
                  return (
                    <div key={item.id} className="flex items-center text-sm">
                      <div className="flex-1">
                        <p className="text-gray-800">{item.product.name}</p>
                        <p className="text-gray-500">{item.quantity} x {price.toFixed(2)} ₺</p>
                      </div>
                      <div className="font-medium">{(price * item.quantity).toFixed(2)} ₺</div>
                    </div>
                  )
                })}
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam</span>
                  <span className="font-medium">{subtotal.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo</span>
                  <span className="font-medium">{shippingCost > 0 ? `${shippingCost.toFixed(2)} ₺` : 'Ücretsiz'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">KDV (18%)</span>
                  <span className="font-medium">{tax.toFixed(2)} ₺</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between text-lg font-bold">
                  <span>Toplam</span>
                  <span className="text-blue-600">{total.toFixed(2)} ₺</span>
                </div>
              </div>

              {subtotal < 500 && (
                <div className="mt-4 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  500 ₺ ve üzeri alışverişlerde kargo ücretsiz
                </div>
              )}

              <div className="mt-6 space-y-3">
                {step === 1 && (
                  <button
                    onClick={handleContinue}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                  >
                    Devam Et
                  </button>
                )}

                {step === 2 && (
                  <>
                    <button
                      onClick={handleContinue}
                      disabled={isSubmitting}
                      className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? 'İşleniyor...' : 'Siparişi Tamamla'}
                    </button>
                    <button
                      onClick={() => setStep(1)}
                      disabled={isSubmitting}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-medium transition-colors"
                    >
                      Geri Dön
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
