import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import Modal from '@/components/Modal'

describe('Modal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    document.body.style.overflow = 'unset'
  })

  it('should render modal when isOpen is true', () => {
    render(<Modal {...defaultProps} />)

    expect(screen.getByText('Test Modal')).toBeInTheDocument()
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
  })

  it('should not render modal when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />)

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument()
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('should call onClose when close button is clicked', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const closeButton = screen.getByRole('button')
    fireEvent.click(closeButton)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should call onClose when backdrop is clicked', () => {
    const onClose = jest.fn()
    render(<Modal {...defaultProps} onClose={onClose} />)

    const backdrop = document.querySelector('.bg-black\\/50')
    fireEvent.click(backdrop!)

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should set body overflow to hidden when modal is open', () => {
    render(<Modal {...defaultProps} />)

    expect(document.body.style.overflow).toBe('hidden')
  })

  it('should restore body overflow when modal is closed', () => {
    const { rerender } = render(<Modal {...defaultProps} />)

    expect(document.body.style.overflow).toBe('hidden')

    rerender(<Modal {...defaultProps} isOpen={false} />)

    expect(document.body.style.overflow).toBe('unset')
  })

  it('should render with small size', () => {
    render(<Modal {...defaultProps} size="sm" />)

    const modalContent = document.querySelector('.max-w-md')
    expect(modalContent).toBeInTheDocument()
  })

  it('should render with medium size (default)', () => {
    render(<Modal {...defaultProps} />)

    const modalContent = document.querySelector('.max-w-lg')
    expect(modalContent).toBeInTheDocument()
  })

  it('should render with large size', () => {
    render(<Modal {...defaultProps} size="lg" />)

    const modalContent = document.querySelector('.max-w-2xl')
    expect(modalContent).toBeInTheDocument()
  })

  it('should render with xl size', () => {
    render(<Modal {...defaultProps} size="xl" />)

    const modalContent = document.querySelector('.max-w-4xl')
    expect(modalContent).toBeInTheDocument()
  })

  it('should render with full size', () => {
    render(<Modal {...defaultProps} size="full" />)

    const modalContent = document.querySelector('.max-w-7xl')
    expect(modalContent).toBeInTheDocument()
  })

  it('should render footer when provided', () => {
    const footer = (
      <div>
        <button>Cancel</button>
        <button>Save</button>
      </div>
    )

    render(<Modal {...defaultProps} footer={footer} />)

    expect(screen.getByText('Cancel')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('should not render footer when not provided', () => {
    render(<Modal {...defaultProps} />)

    const footerContainer = document.querySelector('.bg-gray-50')
    expect(footerContainer).not.toBeInTheDocument()
  })

  it('should render title in header', () => {
    render(<Modal {...defaultProps} title="Custom Title" />)

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
  })

  it('should render children content', () => {
    render(
      <Modal {...defaultProps}>
        <div>
          <h2>Child Heading</h2>
          <p>Child paragraph</p>
        </div>
      </Modal>
    )

    expect(screen.getByText('Child Heading')).toBeInTheDocument()
    expect(screen.getByText('Child paragraph')).toBeInTheDocument()
  })

  it('should have scrollable content area', () => {
    render(<Modal {...defaultProps} />)

    const contentArea = document.querySelector('.px-6.py-4.max-h-\\[calc\\(100vh-200px\\)\\]')
    expect(contentArea).toBeInTheDocument()
    expect(contentArea).toHaveClass('overflow-y-auto')
  })

  it('should cleanup body overflow on unmount', () => {
    const { unmount } = render(<Modal {...defaultProps} />)

    expect(document.body.style.overflow).toBe('hidden')

    unmount()

    expect(document.body.style.overflow).toBe('unset')
  })

  it('should have proper z-index for overlay', () => {
    render(<Modal {...defaultProps} />)

    const overlay = document.querySelector('.z-50')
    expect(overlay).toBeInTheDocument()
  })

  it('should center modal on screen', () => {
    render(<Modal {...defaultProps} />)

    const container = document.querySelector('.flex.min-h-screen.items-center.justify-center')
    expect(container).toBeInTheDocument()
  })
})
