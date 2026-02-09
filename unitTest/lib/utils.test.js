import { cn } from '@/lib/utils.js'

describe('cn utility', () => {
  it('merges tailwind classes by specificity', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-sm', 'text-lg')).toBe('text-lg')
  })

  it('includes truthy conditional classes', () => {
    const result = cn('btn', { active: true, disabled: false }, undefined, null)
    expect(result).toContain('active')
    expect(result).toContain('btn')
  })
})