import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import TableSkeleton from '@/components/skeletons/TableSkeleton'

describe('TableSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<TableSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with default 5 rows', () => {
    const { container } = render(<TableSkeleton />)
    const rows = container.querySelectorAll('.divide-y > div')
    expect(rows).toHaveLength(5)
  })

  it('renders with custom number of rows', () => {
    const { container } = render(<TableSkeleton rows={3} />)
    const rows = container.querySelectorAll('.divide-y > div')
    expect(rows).toHaveLength(3)
  })

  it('renders with custom number of columns', () => {
    const { container } = render(<TableSkeleton columns={7} />)
    // Check if grid template has correct number of columns
    const headerGrid = container.querySelector('.grid')
    expect(headerGrid).toBeInTheDocument()
  })

  it('has animate-pulse class', () => {
    const { container } = render(<TableSkeleton />)
    expect(container.firstChild).toHaveClass('animate-pulse')
  })
})
