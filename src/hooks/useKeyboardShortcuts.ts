import { useEffect } from 'react';
import { usePosStore } from '../store';

/**
 * useKeyboardShortcuts — Global POS keyboard shortcuts
 * 
 * F1 = Cash payment | F2 = Card payment | F3 = Contactless
 * F4 = Split payment | F5 = Hold/Recall | F6 = Customer lookup
 * F8 = Cash-Up | F9 = Void last item | F10 = Clear cart
 * Esc = Close modal | H = Hold transaction
 * Ctrl+P = Print receipt | Ctrl+F = Focus search
 * Ctrl+Shift+T = Training mode toggle
 * Number keys (0-9) = Quick quantity when cart focused
 */
export function useKeyboardShortcuts() {
  const store = usePosStore;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const state = store.getState();
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';

      // Don't intercept when typing in inputs (except for F-keys and Escape)
      if (isInput && !e.key.startsWith('F') && e.key !== 'Escape') return;

      // Escape — close any modal
      if (e.key === 'Escape') {
        if (state.activeModal) {
          e.preventDefault();
          state.closeModal();
          return;
        }
      }

      // Only process shortcuts on checkout page for payment actions
      const isCheckout = state.currentPage === 'checkout';

      // F1 — Cash payment
      if (e.key === 'F1') {
        e.preventDefault();
        if (isCheckout && state.cart.length > 0) {
          state.addToast('⌨️ Cash payment (F1)', 'info');
          // Trigger payment via the store or modal
        }
        return;
      }

      // F2 — Card payment
      if (e.key === 'F2') {
        e.preventDefault();
        if (isCheckout && state.cart.length > 0) {
          state.addToast('⌨️ Card payment (F2)', 'info');
        }
        return;
      }

      // F3 — Contactless
      if (e.key === 'F3') {
        e.preventDefault();
        if (isCheckout && state.cart.length > 0) {
          state.addToast('⌨️ Contactless (F3)', 'info');
        }
        return;
      }

      // F4 — Split payment
      if (e.key === 'F4') {
        e.preventDefault();
        if (isCheckout && state.cart.length > 0) {
          state.openModal('split-payment');
        }
        return;
      }

      // F5 — Hold/Recall
      if (e.key === 'F5') {
        e.preventDefault();
        if (isCheckout) {
          state.openModal('hold-recall');
        }
        return;
      }

      // F6 — Customer lookup
      if (e.key === 'F6') {
        e.preventDefault();
        state.setPage('customers');
        return;
      }

      // F8 — Cash-Up
      if (e.key === 'F8') {
        e.preventDefault();
        state.setPage('checkout');
        state.openModal('cash-up');
        return;
      }

      // F9 — Remove last item from cart
      if (e.key === 'F9') {
        e.preventDefault();
        if (isCheckout && state.cart.length > 0) {
          const lastItem = state.cart[state.cart.length - 1];
          state.removeFromCart(lastItem.product.id);
          state.addToast(`Removed ${lastItem.product.name}`, 'info');
        }
        return;
      }

      // F10 — Clear cart
      if (e.key === 'F10') {
        e.preventDefault();
        if (isCheckout && state.cart.length > 0) {
          state.clearCart();
          state.addToast('Cart cleared', 'info');
        }
        return;
      }

      // Ctrl+F — Focus search
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) searchInput.focus();
        return;
      }

      // Ctrl+Shift+T — Toggle training mode
      if (e.ctrlKey && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        state.toggleTrainingMode();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}

/** Shortcut reference data for help overlay */
export const SHORTCUTS = [
  { key: 'F1', action: 'Cash Payment', section: 'Payment' },
  { key: 'F2', action: 'Card Payment', section: 'Payment' },
  { key: 'F3', action: 'Contactless', section: 'Payment' },
  { key: 'F4', action: 'Split Payment', section: 'Payment' },
  { key: 'F5', action: 'Hold / Recall', section: 'Transaction' },
  { key: 'F6', action: 'Customer Lookup', section: 'Navigation' },
  { key: 'F8', action: 'Cash-Up', section: 'Operations' },
  { key: 'F9', action: 'Remove Last Item', section: 'Cart' },
  { key: 'F10', action: 'Clear Cart', section: 'Cart' },
  { key: 'Esc', action: 'Close Modal', section: 'General' },
  { key: 'Ctrl+F', action: 'Focus Search', section: 'General' },
  { key: 'Ctrl+Shift+T', action: 'Training Mode', section: 'General' },
];
