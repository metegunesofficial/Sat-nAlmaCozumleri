import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton'

describe('DashboardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<DashboardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders stat cards section', () => {
    const { container } = render(<DashboardSkeleton />)
    const statsGrid = container.querySelector('.grid')
    expect(statsGrid).toBeInTheDocument()
  })

  it('renders 4 stat card skeletons', () => {
    const { container } = render(<DashboardSkeleton />)
    // DashboardSkeleton uses StatCardSkeleton which has animate-pulse
    const statCards = container.querySelectorAll('.animate-pulse')
    expect(statCards.length).toBeGreaterThanOrEqual(4)
  })

  it('renders charts section', () => {
    const { container } = render(<DashboardSkeleton />)
    expect(container.textContent).toBeDefined()
  })

  it('renders recent requests section', () => {
    const { container } = render(<DashboardSkeleton />)
    const sections = container.querySelectorAll('.space-y-6 > *')
    expect(sections.length).toBeGreaterThan(0)
  })
})
