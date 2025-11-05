import { render, screen } from '@testing-library/react'
import StatCard from '@/components/StatCard'
import { TrendingUp, ShoppingCart, Package, DollarSign, Users } from 'lucide-react'

describe('StatCard Component', () => {
  describe('Temel Render Testleri', () => {
    it('component başarıyla render edilmeli', () => {
      render(
        <StatCard
          title="Toplam Satış"
          value="₺125,000"
          icon={DollarSign}
        />
      )

      expect(screen.getByText('Toplam Satış')).toBeInTheDocument()
      expect(screen.getByText('₺125,000')).toBeInTheDocument()
    })

    it('title doğru şekilde görüntülenmeli', () => {
      render(
        <StatCard
          title="Test Başlık"
          value="Test Değer"
          icon={Package}
        />
      )

      const title = screen.getByText('Test Başlık')
      expect(title).toHaveClass('text-sm', 'font-medium', 'text-gray-600')
    })

    it('value doğru şekilde görüntülenmeli', () => {
      render(
        <StatCard
          title="Test"
          value="1,234"
          icon={ShoppingCart}
        />
      )

      const value = screen.getByText('1,234')
      expect(value).toHaveClass('text-3xl', 'font-bold', 'text-gray-900')
    })

    it('sayısal value değerleri desteklenmeli', () => {
      render(
        <StatCard
          title="Adet"
          value={42}
          icon={Package}
        />
      )

      expect(screen.getByText('42')).toBeInTheDocument()
    })
  })

  describe('Subtitle Testleri', () => {
    it('subtitle verildiğinde görüntülenmeli', () => {
      render(
        <StatCard
          title="Toplam"
          value="100"
          subtitle="Son 30 gün"
          icon={TrendingUp}
        />
      )

      const subtitle = screen.getByText('Son 30 gün')
      expect(subtitle).toBeInTheDocument()
      expect(subtitle).toHaveClass('text-sm', 'text-gray-500')
    })

    it('subtitle verilmediğinde render edilmemeli', () => {
      render(
        <StatCard
          title="Toplam"
          value="100"
          icon={TrendingUp}
        />
      )

      expect(screen.queryByText('Son 30 gün')).not.toBeInTheDocument()
    })
  })

  describe('Trend Testleri', () => {
    it('pozitif trend doğru şekilde görüntülenmeli', () => {
      render(
        <StatCard
          title="Satışlar"
          value="1000"
          icon={DollarSign}
          trend={{ value: 12.5, isPositive: true }}
        />
      )

      const trendElement = screen.getByText(/12.5%/)
      expect(trendElement).toBeInTheDocument()
      expect(trendElement).toHaveClass('text-green-600')
      expect(screen.getByText(/↑/)).toBeInTheDocument()
      expect(screen.getByText('son aya göre')).toBeInTheDocument()
    })

    it('negatif trend doğru şekilde görüntülenmeli', () => {
      render(
        <StatCard
          title="Satışlar"
          value="800"
          icon={DollarSign}
          trend={{ value: -8.3, isPositive: false }}
        />
      )

      const trendElement = screen.getByText(/8.3%/)
      expect(trendElement).toBeInTheDocument()
      expect(trendElement).toHaveClass('text-red-600')
      expect(screen.getByText(/↓/)).toBeInTheDocument()
    })

    it('trend değeri mutlak değer olarak gösterilmeli', () => {
      render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
          trend={{ value: -15, isPositive: false }}
        />
      )

      // Mutlak değer gösterilmeli
      expect(screen.getByText(/15%/)).toBeInTheDocument()
    })

    it('sıfır trend değeri doğru şekilde işlenmeli', () => {
      render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
          trend={{ value: 0, isPositive: true }}
        />
      )

      expect(screen.getByText(/0%/)).toBeInTheDocument()
    })

    it('trend verilmediğinde render edilmemeli', () => {
      render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
        />
      )

      expect(screen.queryByText(/son aya göre/)).not.toBeInTheDocument()
    })
  })

  describe('Icon Testleri', () => {
    it('icon başarıyla render edilmeli', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={ShoppingCart}
        />
      )

      // Icon container'ı kontrol et
      const iconContainer = container.querySelector('.p-3.rounded-lg')
      expect(iconContainer).toBeInTheDocument()
    })

    it('farklı icon tipleri desteklenmeli', () => {
      const icons = [ShoppingCart, Package, DollarSign, Users, TrendingUp]

      icons.forEach((Icon, index) => {
        const { container } = render(
          <StatCard
            title={`Test ${index}`}
            value={index.toString()}
            icon={Icon}
          />
        )

        const iconContainer = container.querySelector('.p-3.rounded-lg')
        expect(iconContainer).toBeInTheDocument()
      })
    })
  })

  describe('Color Testleri', () => {
    it('varsayılan renk blue olmalı', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
        />
      )

      const iconContainer = container.querySelector('.bg-blue-100.text-blue-600')
      expect(iconContainer).toBeInTheDocument()
    })

    it('green rengi doğru şekilde uygulanmalı', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
          color="green"
        />
      )

      const iconContainer = container.querySelector('.bg-green-100.text-green-600')
      expect(iconContainer).toBeInTheDocument()
    })

    it('yellow rengi doğru şekilde uygulanmalı', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
          color="yellow"
        />
      )

      const iconContainer = container.querySelector('.bg-yellow-100.text-yellow-600')
      expect(iconContainer).toBeInTheDocument()
    })

    it('red rengi doğru şekilde uygulanmalı', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
          color="red"
        />
      )

      const iconContainer = container.querySelector('.bg-red-100.text-red-600')
      expect(iconContainer).toBeInTheDocument()
    })

    it('purple rengi doğru şekilde uygulanmalı', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
          color="purple"
        />
      )

      const iconContainer = container.querySelector('.bg-purple-100.text-purple-600')
      expect(iconContainer).toBeInTheDocument()
    })
  })

  describe('Stil ve Layout Testleri', () => {
    it('card container doğru stil sınıflarına sahip olmalı', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
        />
      )

      const card = container.firstChild
      expect(card).toHaveClass(
        'bg-white',
        'rounded-lg',
        'border',
        'border-gray-200',
        'p-6',
        'hover:shadow-md',
        'transition-shadow'
      )
    })

    it('flex layout doğru şekilde uygulanmalı', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
        />
      )

      const flexContainer = container.querySelector('.flex.items-start.justify-between')
      expect(flexContainer).toBeInTheDocument()
    })
  })

  describe('Edge Case ve Integration Testleri', () => {
    it('tüm props birlikte doğru çalışmalı', () => {
      render(
        <StatCard
          title="Toplam Sipariş"
          value="1,543"
          subtitle="Bu ay toplam"
          icon={ShoppingCart}
          trend={{ value: 23.5, isPositive: true }}
          color="green"
        />
      )

      expect(screen.getByText('Toplam Sipariş')).toBeInTheDocument()
      expect(screen.getByText('1,543')).toBeInTheDocument()
      expect(screen.getByText('Bu ay toplam')).toBeInTheDocument()
      expect(screen.getByText(/23.5%/)).toBeInTheDocument()
      expect(screen.getByText('son aya göre')).toBeInTheDocument()
    })

    it('uzun metinler doğru şekilde işlenmeli', () => {
      render(
        <StatCard
          title="Çok Uzun Bir Başlık Metni Test İçin"
          value="999,999,999"
          subtitle="Çok uzun bir alt başlık metni test amaçlı"
          icon={Package}
        />
      )

      expect(screen.getByText('Çok Uzun Bir Başlık Metni Test İçin')).toBeInTheDocument()
      expect(screen.getByText('999,999,999')).toBeInTheDocument()
    })

    it('büyük negatif trend değerleri doğru gösterilmeli', () => {
      render(
        <StatCard
          title="Test"
          value="50"
          icon={Package}
          trend={{ value: -99.9, isPositive: false }}
        />
      )

      expect(screen.getByText(/99.9%/)).toBeInTheDocument()
      expect(screen.getByText(/↓/)).toBeInTheDocument()
    })

    it('küçük ondalıklı trend değerleri doğru gösterilmeli', () => {
      render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
          trend={{ value: 0.1, isPositive: true }}
        />
      )

      expect(screen.getByText(/0.1%/)).toBeInTheDocument()
    })

    it('boş string value render edilebilmeli', () => {
      render(
        <StatCard
          title="Test"
          value=""
          icon={Package}
        />
      )

      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  describe('Snapshot Testleri', () => {
    it('minimal props ile snapshot eşleşmeli', () => {
      const { container } = render(
        <StatCard
          title="Test"
          value="100"
          icon={Package}
        />
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('tüm props ile snapshot eşleşmeli', () => {
      const { container } = render(
        <StatCard
          title="Toplam Satış"
          value="₺125,000"
          subtitle="Bu ay"
          icon={DollarSign}
          trend={{ value: 15.5, isPositive: true }}
          color="green"
        />
      )

      expect(container.firstChild).toMatchSnapshot()
    })
  })
})
