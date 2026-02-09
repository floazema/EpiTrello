import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render with text content', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click Me');
  });

  it('should apply all size variants', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'];
    sizes.forEach(size => {
      const { unmount } = render(<Button size={size}>Test</Button>);
      const btn = screen.getByRole('button');
      expect(btn.className).toContain(
        size === 'default' ? 'h-10' :
        size === 'sm' ? 'h-9' :
        size === 'lg' ? 'h-11' : 'h-10'
      );
      unmount();
    });
  });

  it('should apply all variants', () => {
    const variants = ['default', 'outline', 'ghost', 'link'];
    variants.forEach(variant => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const btn = screen.getByRole('button');
      if (variant === 'outline') expect(btn.className).toContain('border');
      if (variant === 'ghost') expect(btn.className).toContain('hover:bg');
      unmount();
    });
  });

  it('should handle disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn.className).toContain('disabled:opacity-50');
  });

  it('should handle onClick callback', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByRole('button').click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should support custom className', () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole('button')).toHaveClass('custom-class');
  });
});