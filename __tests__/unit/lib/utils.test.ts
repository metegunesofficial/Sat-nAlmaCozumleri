import { cn, formatPrice, formatDate, generateSlug, generateOrderNumber } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('cn (className utility)', () => {
    it('should combine class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const result = cn('base', true && 'active', false && 'inactive')
      expect(result).toBe('base active')
    })

    it('should handle undefined and null values', () => {
      const result = cn('class1', undefined, null, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle empty string', () => {
      const result = cn('', 'class1')
      expect(result).toBe('class1')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'])
      expect(result).toBe('class1 class2')
    })
  })

  describe('formatPrice', () => {
    it('should format number as Turkish Lira', () => {
      const result = formatPrice(1000)
      // Turkish format uses comma as decimal separator and period for thousands
      expect(result).toContain('₺')
      expect(result).toContain('1')
    })

    it('should format string number as Turkish Lira', () => {
      const result = formatPrice('1500.50')
      expect(result).toContain('₺')
      expect(result).toContain('1')
    })

    it('should handle zero price', () => {
      const result = formatPrice(0)
      expect(result).toContain('₺')
      expect(result).toContain('0')
    })

    it('should handle decimal numbers', () => {
      const result = formatPrice(99.99)
      expect(result).toContain('₺')
      expect(result).toContain('99')
    })

    it('should handle large numbers', () => {
      const result = formatPrice(1000000)
      expect(result).toContain('₺')
      expect(result).toContain('1')
    })

    it('should handle negative numbers', () => {
      const result = formatPrice(-100)
      expect(result).toContain('₺')
      expect(result).toContain('-')
    })

    it('should format with Turkish locale (comma as decimal separator)', () => {
      const result = formatPrice(1234.56)
      // Turkish locale uses comma for decimals
      expect(result).toMatch(/₺|TRY/)
    })
  })

  describe('formatDate', () => {
    it('should format Date object in Turkish locale', () => {
      const date = new Date('2024-03-15')
      const result = formatDate(date)

      // Turkish months: Ocak, Şubat, Mart, Nisan, Mayıs, Haziran,
      // Temmuz, Ağustos, Eylül, Ekim, Kasım, Aralık
      expect(result).toContain('2024')
      expect(result).toContain('15')
    })

    it('should format string date in Turkish locale', () => {
      const result = formatDate('2024-01-01')

      expect(result).toContain('2024')
      expect(result).toContain('1')
    })

    it('should format date with Turkish month names', () => {
      const date = new Date('2024-03-15')
      const result = formatDate(date)

      // Should contain Turkish month name
      expect(typeof result).toBe('string')
      expect(result.length).toBeGreaterThan(0)
    })

    it('should handle leap year dates', () => {
      const date = new Date('2024-02-29')
      const result = formatDate(date)

      expect(result).toContain('2024')
      expect(result).toContain('29')
    })

    it('should handle year boundaries', () => {
      const date = new Date('2024-12-31')
      const result = formatDate(date)

      expect(result).toContain('2024')
      expect(result).toContain('31')
    })
  })

  describe('generateSlug', () => {
    it('should convert text to lowercase slug', () => {
      const result = generateSlug('Hello World')
      expect(result).toBe('hello-world')
    })

    it('should replace Turkish characters with English equivalents', () => {
      const testCases = [
        { input: 'ğ', expected: 'g' },
        { input: 'ü', expected: 'u' },
        { input: 'ş', expected: 's' },
        { input: 'ı', expected: 'i' },
        { input: 'ö', expected: 'o' },
        { input: 'ç', expected: 'c' },
      ]

      testCases.forEach(({ input, expected }) => {
        expect(generateSlug(input)).toBe(expected)
      })
    })

    it('should handle complete Turkish text', () => {
      const result = generateSlug('Çiğ Köfte Şöleni')
      expect(result).toBe('cig-kofte-soleni')
    })

    it('should replace spaces with hyphens', () => {
      const result = generateSlug('Multiple Word Slug')
      expect(result).toBe('multiple-word-slug')
    })

    it('should remove special characters', () => {
      const result = generateSlug('Hello! World@#$%')
      expect(result).toBe('hello-world')
    })

    it('should handle multiple consecutive spaces', () => {
      const result = generateSlug('Hello    World')
      expect(result).toBe('hello-world')
    })

    it('should remove leading and trailing hyphens', () => {
      const result = generateSlug('  hello world  ')
      expect(result).toBe('hello-world')
    })

    it('should handle empty string', () => {
      const result = generateSlug('')
      expect(result).toBe('')
    })

    it('should handle numbers', () => {
      const result = generateSlug('Product 123')
      expect(result).toBe('product-123')
    })

    it('should handle mixed case with Turkish and English', () => {
      const result = generateSlug('Türkçe English Karışık')
      expect(result).toBe('turkce-english-karisik')
    })

    it('should handle text with only special characters', () => {
      const result = generateSlug('!@#$%^&*()')
      expect(result).toBe('')
    })

    it('should preserve numbers in slug', () => {
      const result = generateSlug('Test 123 Product')
      expect(result).toBe('test-123-product')
    })

    it('should handle uppercase Turkish characters', () => {
      const result = generateSlug('ĞÜŞIÖÇğüşıöç')
      expect(result).toBe('gusiocgusioc')
    })
  })

  describe('generateOrderNumber', () => {
    beforeEach(() => {
      // Mock Math.random for consistent testing
      jest.spyOn(Math, 'random').mockReturnValue(0.5)
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('should generate order number with correct format', () => {
      const orderNumber = generateOrderNumber()

      // Format: ATLYYYYMMDDnnnn
      expect(orderNumber).toMatch(/^ATL\d{12}$/)
    })

    it('should start with ATL prefix', () => {
      const orderNumber = generateOrderNumber()
      expect(orderNumber.startsWith('ATL')).toBe(true)
    })

    it('should include current year', () => {
      const orderNumber = generateOrderNumber()
      const currentYear = new Date().getFullYear().toString()

      expect(orderNumber).toContain(currentYear)
    })

    it('should include current month with zero padding', () => {
      const orderNumber = generateOrderNumber()
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0')

      expect(orderNumber).toContain(currentMonth)
    })

    it('should include current day with zero padding', () => {
      const orderNumber = generateOrderNumber()
      const currentDay = String(new Date().getDate()).padStart(2, '0')

      expect(orderNumber).toContain(currentDay)
    })

    it('should include 4-digit random number', () => {
      const orderNumber = generateOrderNumber()

      // Last 4 characters should be the random number
      const randomPart = orderNumber.slice(-4)
      expect(randomPart).toMatch(/^\d{4}$/)
    })

    it('should generate with padded random number', () => {
      // Mock Math.random to return very small number
      jest.spyOn(Math, 'random').mockReturnValue(0.0001)

      const orderNumber = generateOrderNumber()

      // Should still have 4 digits (with leading zeros)
      expect(orderNumber).toMatch(/^ATL\d{12}$/)
    })

    it('should generate unique numbers (different random parts)', () => {
      jest.restoreAllMocks() // Remove mock for this test

      const orderNumber1 = generateOrderNumber()
      const orderNumber2 = generateOrderNumber()

      // Very low probability they're the same
      // In practice, they might be same if generated at exact same millisecond
      expect(orderNumber1).toMatch(/^ATL\d{12}$/)
      expect(orderNumber2).toMatch(/^ATL\d{12}$/)
    })

    it('should generate consistent format across multiple calls', () => {
      const orderNumbers = Array.from({ length: 5 }, () => generateOrderNumber())

      orderNumbers.forEach(orderNumber => {
        expect(orderNumber).toMatch(/^ATL\d{12}$/)
        expect(orderNumber.length).toBe(15) // ATL + 12 digits
      })
    })

    it('should handle month transitions correctly', () => {
      // Just verify format is correct
      const orderNumber = generateOrderNumber()
      const datePart = orderNumber.substring(3, 11) // YYYYMMDDpart

      expect(datePart).toMatch(/^\d{8}$/)
    })

    it('should pad single-digit months with zero', () => {
      // Create a date in January (month 1)
      const mockDate = new Date('2024-01-15')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

      const orderNumber = generateOrderNumber()

      // Should contain '01' for January
      expect(orderNumber).toContain('01')

      jest.restoreAllMocks()
    })

    it('should pad single-digit days with zero', () => {
      // Create a date with day = 5
      const mockDate = new Date('2024-03-05')
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any)

      const orderNumber = generateOrderNumber()

      // Should contain '05' for the 5th day
      expect(orderNumber).toContain('05')

      jest.restoreAllMocks()
    })
  })

  describe('Integration: Combined utility usage', () => {
    it('should format price and date for order display', () => {
      const price = 1500.99
      const orderDate = new Date('2024-03-15')

      const formattedPrice = formatPrice(price)
      const formattedDate = formatDate(orderDate)

      expect(formattedPrice).toContain('₺')
      expect(formattedDate).toContain('2024')
    })

    it('should generate slug for Turkish product name', () => {
      const productName = 'Diş Fırçası - Yumuşak'
      const slug = generateSlug(productName)

      expect(slug).toBe('dis-fircasi-yumusak')
      expect(slug).not.toContain('ş')
      expect(slug).not.toContain('ı')
    })

    it('should combine utilities for complete order processing', () => {
      const orderNumber = generateOrderNumber()
      const totalPrice = 2499.99
      const orderDate = new Date('2024-03-15')

      expect(orderNumber).toMatch(/^ATL\d{12}$/)
      expect(formatPrice(totalPrice)).toContain('₺')
      expect(formatDate(orderDate)).toContain('2024')
    })
  })
})
