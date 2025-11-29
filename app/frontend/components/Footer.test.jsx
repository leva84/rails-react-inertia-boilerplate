import { render, screen } from '@testing-library/react'
import Footer from '@/components/Footer'

describe('Footer', () => {
  it('renders copyright with current year', () => {
    render(<Footer />)

    const currentYear = new Date().getFullYear()

    // Проверяем, что текст копирайта присутствует
    expect(screen.getByText(/RailsReactInertiaBoilerplate/i)).toBeInTheDocument()

    // Проверяем, что год актуальный
    expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument()
  })
})
