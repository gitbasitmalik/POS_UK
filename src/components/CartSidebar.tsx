import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, CreditCard, Banknote, Smartphone, ShoppingBag, Receipt, PauseCircle, Split, Wallet, Tag } from 'lucide-react';
import { usePosStore } from '../store';
import type { PaymentSplit } from '../types';
import CheckoutAddons from './CheckoutAddons';

export default function CartSidebar() {
  const { 
    cart, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    cartSubtotal, 
    cartTax, 
    cartTotal, 
    cartItemCount, 
    openModal, 
    addToast, 
    addTransaction, 
    currentStaff, 
    selectedCustomer, 
    heldTransactions,
    calculateDiscounts,
    appliedGiftCard,
    redeemGiftCard,
    setAppliedGiftCard,
    donationAmount
  } = usePosStore();

  const discount = calculateDiscounts();
  const sub = cartSubtotal();
  const tax = cartTax();
  const total = cartTotal();
  const count = cartItemCount();

  const handleQuickPay = (method: 'cash' | 'card' | 'contactless') => {
    if (cart.length === 0) return;
    const { completeSale } = usePosStore.getState();
    completeSale([{ method, amount: total }]);
  };

  return (
    <aside className="flex flex-col h-full" style={{ width: '380px', minWidth: '380px', background: 'var(--color-surface-raised)', borderLeft: '1px solid var(--color-surface-glass-border)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
        <div className="flex items-center gap-2">
          <ShoppingBag size={18} style={{ color: 'var(--color-indigo-light)' }} />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>Current Order</span>
          {count > 0 && (
            <span style={{ padding: '1px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-indigo)', color: 'white', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{count}</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <motion.button className="cursor-pointer relative" style={{ padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245,158,11,0.2)', background: 'var(--color-amber-bg)', color: 'var(--color-amber)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)' }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={() => openModal('hold-recall')} aria-label="Hold/Recall">
            <PauseCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
            Hold
            {heldTransactions.length > 0 && (
              <span style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16, borderRadius: '50%', background: 'var(--color-amber)', color: '#000', fontSize: 9, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{heldTransactions.length}</span>
            )}
          </motion.button>
          {cart.length > 0 && (
            <motion.button className="cursor-pointer" style={{ padding: '4px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(244,63,94,0.2)', background: 'var(--color-rose-bg)', color: 'var(--color-rose)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)' }} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} onClick={clearCart}>Clear</motion.button>
          )}
        </div>
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {cart.length === 0 ? (
            <motion.div key="empty" className="flex flex-col items-center justify-center h-full text-[var(--color-slate-500)]" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Receipt size={40} strokeWidth={1} style={{ opacity: 0.3, marginBottom: 12 }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>No items yet</span>
              <span style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>Tap a product or scan a barcode</span>
            </motion.div>
          ) : (
            cart.map((item) => (
              <motion.div key={item.product.id} className="flex items-center gap-3 mb-2" style={{ padding: '10px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-overlay)', border: `1px solid ${item.product.ageRestricted ? 'rgba(244,63,94,0.15)' : 'var(--color-surface-glass-border)'}` }}
                layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="relative" style={{ width: 44, height: 44, minWidth: 44, borderRadius: 'var(--radius-md)', overflow: 'hidden', background: '#3331' }}>
                  <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                  {item.product.ageRestricted && (
                    <div className="absolute top-0 right-0" style={{ padding: '0 3px', borderRadius: '0 0 0 4px', background: 'var(--color-rose)', color: 'white', fontSize: 7, fontWeight: 800 }}>{item.product.minAge}+</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.product.name}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--color-slate-400)', marginTop: 2 }}>
                    £{item.product.price.toFixed(2)}
                    {item.discount > 0 && <span style={{ color: 'var(--color-emerald)', marginLeft: 6 }}>-£{item.discount.toFixed(2)}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <motion.button className="flex items-center justify-center cursor-pointer" style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-base)', color: 'var(--color-slate-400)' }}
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                    {item.quantity === 1 ? <Trash2 size={12} style={{ color: 'var(--color-rose)' }} /> : <Minus size={12} />}
                  </motion.button>
                  <span style={{ width: 24, textAlign: 'center', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-slate-100)' }}>{item.quantity}</span>
                  <motion.button className="flex items-center justify-center cursor-pointer" style={{ width: 24, height: 24, borderRadius: 'var(--radius-sm)', border: '1px solid rgba(99,102,241,0.2)', background: 'var(--color-indigo-subtle)', color: 'var(--color-indigo-light)' }}
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                    <Plus size={12} />
                  </motion.button>
                </div>
                <span style={{ minWidth: 50, textAlign: 'right', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-slate-100)' }}>£{(item.product.price * item.quantity - item.discount).toFixed(2)}</span>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Totals & Addons */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)' }}>
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex justify-between" style={{ fontSize: 12, color: 'var(--color-slate-400)', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>Subtotal</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate-200)' }}>£{(sub + discount).toFixed(2)}</span>
          </div>
          
          {discount > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-between" style={{ fontSize: 12, color: 'var(--color-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>
              <div className="flex items-center gap-1"><Tag size={12} /> PROMO DISCOUNT</div>
              <span style={{ fontFamily: 'var(--font-mono)' }}>-£{discount.toFixed(2)}</span>
            </motion.div>
          )}

          <div className="flex justify-between" style={{ fontSize: 12, color: 'var(--color-slate-400)', fontWeight: 600, textTransform: 'uppercase' }}>
            <span>VAT (20%)</span>
            <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate-200)' }}>£{tax.toFixed(2)}</span>
          </div>

          <CheckoutAddons />

          <div style={{ height: 1, background: 'var(--color-surface-glass-border)', margin: '8px 0' }} />
          <div className="flex justify-between items-center">
            <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--color-slate-500)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total to pay</span>
            <span style={{ fontSize: 28, fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'white' }}>£{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { icon: Banknote, label: 'Cash', method: 'cash' as const },
            { icon: CreditCard, label: 'Card', method: 'card' as const },
            { icon: Smartphone, label: 'Tap', method: 'contactless' as const },
            { icon: Split, label: 'Split', method: null },
          ].map((m, idx) => (
            <motion.button key={idx} className="flex flex-col items-center gap-1 cursor-pointer" style={{ padding: '10px 0', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-base)', color: 'var(--color-slate-400)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}
              whileHover={{ borderColor: 'rgba(99,102,241,0.3)', color: 'var(--color-indigo-light)' }} whileTap={{ scale: 0.96 }}
              onClick={() => m.method ? handleQuickPay(m.method) : openModal('split-payment')}>
              <m.icon size={18} />
              <span>{m.label}</span>
            </motion.button>
          ))}
        </div>

        <motion.button className="w-full flex items-center justify-center gap-2 cursor-pointer" style={{ height: 54, borderRadius: 'var(--radius-lg)', border: 'none', background: 'linear-gradient(135deg, var(--color-indigo), var(--color-indigo-dark))', color: 'white', fontSize: 16, fontWeight: 800, textTransform: 'uppercase', boxShadow: 'var(--shadow-glow-indigo)', letterSpacing: '1px' }}
          whileHover={{ filter: 'brightness(1.1)' }} whileTap={{ scale: 0.98 }}
          onClick={() => handleQuickPay('card')}>
          <Wallet size={20} />
          <span>Complete Payment</span>
        </motion.button>
      </div>
    </aside>
  );
}

