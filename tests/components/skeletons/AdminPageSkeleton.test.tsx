import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import AdminPageSkeleton from '@/components/skeletons/AdminPageSkeleton'

describe('AdminPageSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<AdminPageSkeleton />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders with default 3 stat cards', () => {
    const { container } = render(<AdminPageSkeleton />)
    const grids = container.querySelectorAll('.grid')
    expect(grids.length).toBeGreaterThan(0)
  })

  it('renders with custom number of stat cards', () => {
    const { container } = render(<AdminPageSkeleton statCards={5} />)
    expect(container).toBeInTheDocument()
  })

  it('renders header skeleton', () => {
    const { container } = render(<AdminPageSkeleton />)
    const headers = container.querySelectorAll('.animate-pulse')
    expect(headers.length).toBeGreaterThan(0)
  })

  it('renders table skeleton', () => {
    const { container } = render(<AdminPageSkeleton />)
    expect(container.textContent).toBeDefined()
  })

  it('respects tableColumns and tableRows props', () => {
    const { container } = render(
      <AdminPageSkeleton statCards={2} tableColumns={6} tableRows={10} />
    )
    expect(container.firstChild).toBeInTheDocument()
  })
})
