import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '@/components/ProductCard'
import { Product } from '@/types'

// Mock next/link and next/image
jest.mock('next/link', () => {
  return ({ children, href }: any) => {
    return <a href={href}>{children}</a>
  }
})

jest.mock('next/image', () => {
  return ({ src, alt }: any) => {
    return <img src={src} alt={alt} />
  }
})

describe('ProductCard Component', () => {
  const mockProduct: Product = {
    id: '1',
    name: 'Test Dental Product',
    slug: 'test-dental-product',
    sku: 'SKU001',
    description: 'A test product',
    price: 100,
    stock: 10,
    isActive: true,
    images: ['https://example.com/image.jpg'],
    category: {
      id: 'cat1',
      name: 'Dental Tools',
      slug: 'dental-tools',
    },
    rating: 4.5,
    salesCount: 25,
    isNew: false,
    isFeatured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should render product information correctly', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('Test Dental Product')).toBeInTheDocument()
    expect(screen.getByText('SKU: SKU001')).toBeInTheDocument()
    expect(screen.getByText(/Stok: 10/)).toBeInTheDocument()
    expect(screen.getByText('Dental Tools')).toBeInTheDocument()
  })

  it('should display product image', () => {
    render(<ProductCard product={mockProduct} />)

    const image = screen.getByAltText('Test Dental Product')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg')
  })

  it('should show "No Image" when product has no images', () => {
    const productWithoutImage = { ...mockProduct, images: [] }
    render(<ProductCard product={productWithoutImage} />)

    expect(screen.getByText('No Image')).toBeInTheDocument()
  })

  it('should display "YENİ" badge for new products', () => {
    const newProduct = { ...mockProduct, isNew: true }
    render(<ProductCard product={newProduct} />)

    expect(screen.getByText('YENİ')).toBeInTheDocument()
  })

  it('should display discount badge and price when product has discount', () => {
    const discountedProduct = { ...mockProduct, discountPrice: 80 }
    render(<ProductCard product={discountedProduct} />)

    expect(screen.getByText('İNDİRİM')).toBeInTheDocument()
    expect(screen.getByText('₺80,00')).toBeInTheDocument()
    expect(screen.getByText('₺100,00')).toBeInTheDocument()
  })

  it('should display "STOKTA YOK" badge when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)

    expect(screen.getByText('STOKTA YOK')).toBeInTheDocument()
  })

  it('should display rating stars', () => {
    render(<ProductCard product={mockProduct} />)

    expect(screen.getByText('(25)')).toBeInTheDocument()
    const ratingContainer = screen.getByText('(25)').previousSibling
    expect(ratingContainer?.textContent).toContain('★★★★')
  })

  it('should display wholesale price when available', () => {
    const wholesaleProduct = {
      ...mockProduct,
      wholesalePrice: 90,
      minOrderQty: 10,
      unit: 'adet',
    }
    render(<ProductCard product={wholesaleProduct} />)

    expect(screen.getByText(/Toptan: ₺90,00/)).toBeInTheDocument()
    expect(screen.getByText(/Min: 10 adet/)).toBeInTheDocument()
  })

  it('should add product to cart when "Sepete Ekle" button is clicked', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {})
    const dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')

    render(<ProductCard product={mockProduct} />)

    const addToCartButton = screen.getByText('Sepete Ekle')
    fireEvent.click(addToCartButton)

    // Check localStorage
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    expect(cart).toHaveLength(1)
    expect(cart[0].id).toBe('1')
    expect(cart[0].quantity).toBe(1)

    // Check alert was shown
    expect(alertMock).toHaveBeenCalledWith('Ürün sepete eklendi!')

    // Check event was dispatched
    expect(dispatchEventSpy).toHaveBeenCalled()

    alertMock.mockRestore()
  })

  it('should update quantity when adding existing product to cart', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {})

    // Pre-populate cart
    const existingCart = [{ ...mockProduct, quantity: 2 }]
    localStorage.setItem('cart', JSON.stringify(existingCart))

    render(<ProductCard product={mockProduct} />)

    const addToCartButton = screen.getByText('Sepete Ekle')
    fireEvent.click(addToCartButton)

    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    expect(cart).toHaveLength(1)
    expect(cart[0].quantity).toBe(3)

    alertMock.mockRestore()
  })

  it('should disable "Sepete Ekle" button when out of stock', () => {
    const outOfStockProduct = { ...mockProduct, stock: 0 }
    render(<ProductCard product={outOfStockProduct} />)

    const button = screen.getByText('Stokta Yok').closest('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('bg-gray-300', 'cursor-not-allowed')
  })

  it('should render link to product detail page', () => {
    render(<ProductCard product={mockProduct} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/products/test-dental-product')
  })

  it('should have hover effects on action buttons', () => {
    render(<ProductCard product={mockProduct} />)

    const favoriteButton = screen.getByTitle('Favorilere ekle')
    const quickViewButton = screen.getByTitle('Hızlı görünüm')

    expect(favoriteButton).toBeInTheDocument()
    expect(quickViewButton).toBeInTheDocument()
  })
})
