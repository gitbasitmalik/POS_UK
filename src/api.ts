/* ========================================================================
   AuraFlow POS — Mock API Layer
   Simulates: GET /products, POST /transactions, PATCH /inventory
   ======================================================================== */

import type { Product, Transaction, CartItem, PaymentSplit, Staff } from './types';
import { VAT_RATES } from './data';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/* ── POST /transactions ────────────────────────────────────────── */
export async function createTransaction(payload: {
  items: CartItem[];
  payments: PaymentSplit[];
  cashier: Staff;
  customer?: any;
}): Promise<{ data: Transaction; success: boolean }> {
  await delay(250);

  const subtotal = payload.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity - item.discount, 0
  );
  const tax = payload.items.reduce((sum, item) => {
    const rate = VAT_RATES[item.product.vatRate];
    return sum + (item.product.price * item.quantity - item.discount) * rate;
  }, 0);

  const transaction: Transaction = {
    id: `TXN-${Date.now().toString(36).toUpperCase()}`,
    items: payload.items,
    subtotal,
    tax,
    discount: payload.items.reduce((s, i) => s + i.discount, 0),
    total: subtotal + tax,
    payments: payload.payments,
    timestamp: new Date().toISOString(),
    cashier: payload.cashier,
    customer: payload.customer,
    status: 'completed',
    receiptNumber: `R-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`,
    notes: '',
  };

  return { data: transaction, success: true };
}

/* ── PATCH /inventory ──────────────────────────────────────────── */
export async function updateInventory(
  updates: { productId: string; quantityChange: number }[]
): Promise<{ success: boolean; updated: number }> {
  await delay(80);
  return { success: true, updated: updates.length };
}
