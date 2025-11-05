import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCardSkeleton from '@/components/skeletons/StatCardSkeleton'

describe('StatCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<StatCardSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('has animate-pulse class for animation', () => {
    const { container } = render(<StatCardSkeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })

  it('renders skeleton elements', () => {
    const { container } = render(<StatCardSkeleton />)
    const skeletonElements = container.querySelectorAll('.bg-gray-200')
    expect(skeletonElements.length).toBeGreaterThan(0)
  })
})
