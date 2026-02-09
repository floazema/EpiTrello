import React from 'react'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button.jsx'

describe('Button', () => {
  it('renders with default variant and size', () => {
    render(<Button>Click Me</Button>)
    const btn = screen.getByRole('button', { name: 'Click Me' })
    expect(btn).toBeInTheDocument()
    expect(btn.className).toContain('bg-zinc-900')
    expect(btn.className).toContain('h-10')
  })

  it('applies outline variant and sm size', () => {
    render(<Button variant="outline" size="sm">Outline</Button>)
    const btn = screen.getByRole('button', { name: 'Outline' })
    expect(btn.className).toContain('border')
    expect(btn.className).toContain('h-9')
  })
})