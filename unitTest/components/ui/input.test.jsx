import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from '@/components/ui/input';

describe('Input', () => {
  it('should render input element', () => {
    render(<Input type="text" />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('should accept different input types', () => {
    const types = ['text', 'email', 'password', 'date'];
    types.forEach(type => {
      const { unmount } = render(<Input type={type} />);
      const input = screen.queryByRole(type === 'date' ? 'spinbutton' : 'textbox') || 
                    document.querySelector(`input[type="${type}"]`);
      expect(input).toBeInTheDocument();
      unmount();
    });
  });

  it('should handle placeholder text', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is set', () => {
    render(<Input disabled />);
    expect(screen.getByRole('textbox')).toBeDisabled();
  });

  it('should have proper styling classes', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border');
    expect(input.className).toContain('rounded-md');
  });

  it('should handle value changes', () => {
    const { container } = render(<Input defaultValue="test" />);
    const input = container.querySelector('input');
    expect(input.value).toBe('test');
  });
});