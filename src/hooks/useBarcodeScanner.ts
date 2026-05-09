import { useEffect, useRef, useCallback } from 'react';
import { usePosStore } from '../store';

/**
 * useBarcodeScanner — Detects rapid keystrokes from a barcode scanner
 * 
 * Barcode scanners work by emitting keystrokes very quickly (< 50ms between keys)
 * followed by an Enter key. This hook distinguishes scanner input from normal typing.
 * 
 * Configuration:
 * - maxKeystrokeGap: Maximum ms between keystrokes to consider as scanner input
 * - minLength: Minimum barcode length (EAN-8 = 8, EAN-13 = 13, UPC = 12)
 */
export function useBarcodeScanner(options?: {
  enabled?: boolean;
  maxKeystrokeGap?: number;
  minLength?: number;
  onScan?: (barcode: string, product: any) => void;
  onScanFail?: (barcode: string) => void;
}) {
  const {
    enabled = true,
    maxKeystrokeGap = 50,
    minLength = 6,
    onScan,
    onScanFail,
  } = options || {};

  const bufferRef = useRef('');
  const lastKeystrokeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { scanBarcode, addToast, currentPage } = usePosStore();

  const processBuffer = useCallback(() => {
    const barcode = bufferRef.current.trim();
    bufferRef.current = '';

    if (barcode.length < minLength) return;

    // Only process on checkout page
    if (currentPage !== 'checkout') {
      addToast(`Scan detected: ${barcode} — switch to Checkout`, 'info');
      return;
    }

    const product = scanBarcode(barcode);
    if (product) {
      addToast(`Scanned: ${product.name}`);
      onScan?.(barcode, product);
    } else {
      addToast(`Unknown barcode: ${barcode}`, 'error');
      onScanFail?.(barcode);
    }
  }, [scanBarcode, addToast, currentPage, minLength, onScan, onScanFail]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
      
      // Allow scanner input even in inputs if it's rapid enough
      const now = Date.now();
      const gap = now - lastKeystrokeRef.current;
      lastKeystrokeRef.current = now;

      // If this is an Enter key and we have buffer content
      if (e.key === 'Enter' && bufferRef.current.length >= minLength) {
        e.preventDefault();
        e.stopPropagation();
        if (timerRef.current) clearTimeout(timerRef.current);
        processBuffer();
        return;
      }

      // Only accumulate single characters
      if (e.key.length !== 1) return;

      // If the gap is too long, this is manual typing — reset buffer
      if (gap > maxKeystrokeGap && bufferRef.current.length > 0) {
        bufferRef.current = '';
      }

      // If we're in an input and it's slow typing, don't capture
      if (isInput && gap > maxKeystrokeGap) return;

      bufferRef.current += e.key;

      // Auto-process after a short delay (in case Enter isn't sent)
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (bufferRef.current.length >= minLength) {
          processBuffer();
        } else {
          bufferRef.current = '';
        }
      }, 200);
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, maxKeystrokeGap, minLength, processBuffer]);
}
