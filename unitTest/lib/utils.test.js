// import { cn } from '@/lib/utils.js'

// describe('cn utility', () => {
//   it('merges tailwind classes by specificity', () => {
//     expect(cn('px-2', 'px-4')).toBe('px-4')
//     expect(cn('text-sm', 'text-lg')).toBe('text-lg')
//   })

//   it('includes truthy conditional classes', () => {
//     const result = cn('btn', { active: true, disabled: false }, undefined, null)
//     expect(result).toContain('active')
//     expect(result).toContain('btn')
//   })
// })

// Utility function tests for the cn class merging utility

// import { cn } from '../utils';

// describe('cn class merging utility', () => {
//     test('merges multiple classes correctly', () => {
//         expect(cn('class1', 'class2')).toBe('class1 class2');
//     });

//     test('handles undefined classes', () => {
//         expect(cn('class1', undefined)).toBe('class1');
//     });

//     test('handles empty string classes', () => {
//         expect(cn('class1', '')).toBe('class1');
//     });

//     test('removes duplicate classes', () => {
//         expect(cn('class1', 'class1')).toBe('class1');
//     });

//     test('merges classes with additional spaces', () => {
//         expect(cn(' class1 ', ' class2 ')).toBe('class1 class2');
//     });
// });


import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('cn utility', () => {
  it('should merge multiple class strings', () => {
    const result = cn('p-4', 'text-lg', 'text-white');
    expect(result).toContain('p-4');
    expect(result).toContain('text-lg');
    expect(result).toContain('text-white');
  });

  it('should handle undefined and null values', () => {
    const result = cn('btn', undefined, null, 'active');
    expect(result).toContain('btn');
    expect(result).toContain('active');
  });

  it('should handle objects with boolean values', () => {
    const result = cn('base', { active: true, disabled: false });
    expect(result).toContain('active');
    expect(result).not.toContain('disabled');
  });

  it('should resolve tailwind conflicts correctly', () => {
    // px-4 should override px-2
    const result = cn('px-2', 'px-4');
    expect(result).toContain('px-4');
    expect(result).not.toContain('px-2');
  });

  it('should handle empty input', () => {
    expect(cn()).toBe('');
    expect(cn('', '', '')).toBe('');
  });
});