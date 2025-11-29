import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

describe('Footer', () => {
  it('renders copyright with current year', () => {
    render(<Footer />)

    const currentYear = new Date().getFullYear()

    // Check that the copyright text is present
    expect(screen.getByText(/RailsReactInertiaBoilerplate/i)).toBeInTheDocument()

    // Check that the year is current
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
  })
})
