import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from '@/components/ui/modal';

describe('Modal', () => {
  it('should not render when isOpen is false', () => {
    render(<Modal isOpen={false} onClose={vi.fn()} title="Test">Content</Modal>);
    expect(screen.queryByText('Test')).not.toBeInTheDocument();
  });

  // it('should render modal when isOpen is true', () => {
  //   render(<Modal isOpen={true} onClose={vi.fn()} title="Test">Content</Modal>);
  //   expect(screen.getByText('Test')).toBeInTheDocument();
  //   expect(screen.getByText('Content')).toBeInTheDocument();
  // });

  // it('should display modal title', () => {
  //   render(<Modal isOpen={true} onClose={vi.fn()} title="Modal Title">Body</Modal>);
  //   expect(screen.getByText('Modal Title')).toBeInTheDocument();
  // });

  // it('should call onClose when close button clicked', () => {
  //   const onClose = vi.fn();
  //   render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
  //   const closeBtn = screen.getByRole('button');
  //   closeBtn.click();
  //   expect(onClose).toHaveBeenCalledTimes(1);
  // });

  // it('should call onClose when backdrop clicked', () => {
  //   const onClose = vi.fn();
  //   render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
  //   const backdrop = document.querySelector('[class*="bg-black"]');
  //   backdrop?.click();
  //   expect(onClose).toHaveBeenCalled();
  // });

  // it('should close on Escape key press', () => {
  //   const onClose = vi.fn();
  //   render(<Modal isOpen={true} onClose={onClose} title="Test">Content</Modal>);
  //   fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
  //   expect(onClose).toHaveBeenCalled();
  // });

  // it('should apply size variants', () => {
  //   const sizes = ['sm', 'md', 'lg', 'xl'];
  //   sizes.forEach(size => {
  //     const { unmount, container } = render(
  //       <Modal isOpen={true} onClose={vi.fn()} size={size} title="Test">Content</Modal>
  //     );
  //     const modal = container.querySelector('[class*="max-w"]');
  //     expect(modal).toBeInTheDocument();
  //     unmount();
  //   });
  // });

  // it('should prevent body scroll when open', () => {
  //   const { rerender } = render(
  //     <Modal isOpen={false} onClose={vi.fn()} title="Test">Content</Modal>
  //   );
  //   expect(document.body.style.overflow).not.toBe('hidden');
    
  //   rerender(<Modal isOpen={true} onClose={vi.fn()} title="Test">Content</Modal>);
  //   expect(document.body.style.overflow).toBe('hidden');
  // });
});