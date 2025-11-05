import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import DataTable from '@/components/DataTable'

describe('DataTable Component', () => {
  const mockData = [
    { id: 1, name: 'John Doe', age: 30, email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', age: 25, email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', age: 35, email: 'bob@example.com' },
  ]

  const mockColumns = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'email', label: 'Email', sortable: false },
  ]

  it('should render table with data', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
  })

  it('should render column headers', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    expect(screen.getByText('ID')).toBeInTheDocument()
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Age')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('should display empty state when no data', () => {
    render(<DataTable data={[]} columns={mockColumns} />)

    expect(screen.getByText('Veri bulunamadı')).toBeInTheDocument()
  })

  it('should sort data by string column ascending', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    const nameHeader = screen.getByText('Name').closest('th')
    fireEvent.click(nameHeader!)

    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('Bob Johnson')
    expect(rows[2]).toHaveTextContent('Jane Smith')
    expect(rows[3]).toHaveTextContent('John Doe')
  })

  it('should sort data by string column descending', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    const nameHeader = screen.getByText('Name').closest('th')
    fireEvent.click(nameHeader!) // First click - asc
    fireEvent.click(nameHeader!) // Second click - desc

    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('John Doe')
    expect(rows[2]).toHaveTextContent('Jane Smith')
    expect(rows[3]).toHaveTextContent('Bob Johnson')
  })

  it('should sort data by number column ascending', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    const ageHeader = screen.getByText('Age').closest('th')
    fireEvent.click(ageHeader!)

    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('25')
    expect(rows[2]).toHaveTextContent('30')
    expect(rows[3]).toHaveTextContent('35')
  })

  it('should sort data by number column descending', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    const ageHeader = screen.getByText('Age').closest('th')
    fireEvent.click(ageHeader!) // First click - asc
    fireEvent.click(ageHeader!) // Second click - desc

    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('35')
    expect(rows[2]).toHaveTextContent('30')
    expect(rows[3]).toHaveTextContent('25')
  })

  it('should not sort non-sortable columns', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    const emailHeader = screen.getByText('Email').closest('th')
    const initialRows = screen.getAllByRole('row')
    const initialFirstRow = initialRows[1].textContent

    fireEvent.click(emailHeader!)

    const newRows = screen.getAllByRole('row')
    expect(newRows[1].textContent).toBe(initialFirstRow)
  })

  it('should render search input when searchable is true', () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={true} />)

    expect(screen.getByPlaceholderText('Ara...')).toBeInTheDocument()
  })

  it('should filter data based on search query', () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={true} />)

    const searchInput = screen.getByPlaceholderText('Ara...')
    fireEvent.change(searchInput, { target: { value: 'Jane' } })

    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument()
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
  })

  it('should search across all fields', () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={true} />)

    const searchInput = screen.getByPlaceholderText('Ara...')

    // Search by email
    fireEvent.change(searchInput, { target: { value: 'bob@example' } })
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument()
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument()

    // Search by age
    fireEvent.change(searchInput, { target: { value: '25' } })
    expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument()
  })

  it('should show empty state when search has no results', () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={true} />)

    const searchInput = screen.getByPlaceholderText('Ara...')
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

    expect(screen.getByText('Veri bulunamadı')).toBeInTheDocument()
  })

  it('should use custom search placeholder', () => {
    render(
      <DataTable
        data={mockData}
        columns={mockColumns}
        searchable={true}
        searchPlaceholder="Kullanıcı ara..."
      />
    )

    expect(screen.getByPlaceholderText('Kullanıcı ara...')).toBeInTheDocument()
  })

  it('should call onRowClick when row is clicked', () => {
    const onRowClick = jest.fn()
    render(<DataTable data={mockData} columns={mockColumns} onRowClick={onRowClick} />)

    const rows = screen.getAllByRole('row')
    fireEvent.click(rows[1]) // Click first data row

    expect(onRowClick).toHaveBeenCalledWith(mockData[0])
  })

  it('should render custom cell content using render function', () => {
    const columnsWithRender = [
      ...mockColumns,
      {
        key: 'status',
        label: 'Status',
        render: (value: any, row: any) => (
          <span className="badge">{row.age >= 30 ? 'Senior' : 'Junior'}</span>
        ),
      },
    ]

    render(<DataTable data={mockData} columns={columnsWithRender} />)

    const badges = screen.getAllByText(/Senior|Junior/)
    expect(badges).toHaveLength(3)
    expect(screen.getAllByText('Senior')).toHaveLength(2)
    expect(screen.getAllByText('Junior')).toHaveLength(1)
  })

  it('should maintain sort when searching', () => {
    render(<DataTable data={mockData} columns={mockColumns} searchable={true} />)

    // First sort by age
    const ageHeader = screen.getByText('Age').closest('th')
    fireEvent.click(ageHeader!)

    // Then search
    const searchInput = screen.getByPlaceholderText('Ara...')
    fireEvent.change(searchInput, { target: { value: 'e' } }) // Will match Jane and John

    const rows = screen.getAllByRole('row')
    // Should still be sorted by age ascending (25, then 30)
    expect(rows[1]).toHaveTextContent('25')
    expect(rows[2]).toHaveTextContent('30')
  })

  it('should have hover effect on clickable rows', () => {
    const onRowClick = jest.fn()
    render(<DataTable data={mockData} columns={mockColumns} onRowClick={onRowClick} />)

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]

    expect(firstDataRow).toHaveClass('cursor-pointer')
  })

  it('should not have hover effect on non-clickable rows', () => {
    render(<DataTable data={mockData} columns={mockColumns} />)

    const rows = screen.getAllByRole('row')
    const firstDataRow = rows[1]

    expect(firstDataRow).not.toHaveClass('cursor-pointer')
  })
})
