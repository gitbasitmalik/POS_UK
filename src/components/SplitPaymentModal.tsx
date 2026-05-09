import { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Banknote, Smartphone, Ticket, Check } from 'lucide-react';
import Modal from './Modal';
import { usePosStore } from '../store';
import type { PaymentSplit, PaymentMethod } from '../types';

const methods: { id: PaymentMethod; icon: any; label: string; color: string }[] = [
  { id: 'cash', icon: Banknote, label: 'Cash', color: '#10B981' },
  { id: 'card', icon: CreditCard, label: 'Card', color: '#6366F1' },
  { id: 'contactless', icon: Smartphone, label: 'Contactless', color: '#3B82F6' },
  { id: 'voucher', icon: Ticket, label: 'Voucher', color: '#F59E0B' },
];

export default function SplitPaymentModal({ total: propTotal, onConfirm: propConfirm }: { total?: number; onConfirm?: (splits: PaymentSplit[]) => void }) {
  const { closeModal, cartTotal, completeSale } = usePosStore();
  const total = propTotal ?? cartTotal();
  const onConfirm = propConfirm ?? completeSale;
  
  const [splits, setSplits] = useState<PaymentSplit[]>([{ method: 'card', amount: total }]);

  const allocated = splits.reduce((s, sp) => s + sp.amount, 0);
  const remaining = Math.max(0, +(total - allocated).toFixed(2));

  const addSplit = (method: PaymentMethod) => {
    if (splits.find((s) => s.method === method)) return;
    setSplits([...splits, { method, amount: 0 }]);
  };

  const updateAmount = (idx: number, value: number) => {
    const updated = [...splits];
    updated[idx] = { ...updated[idx], amount: Math.max(0, value) };
    setSplits(updated);
  };

  const removeSplit = (idx: number) => {
    if (splits.length <= 1) return;
    setSplits(splits.filter((_, i) => i !== idx));
  };

  const autoFillLast = () => {
    if (splits.length < 2) return;
    const updated = [...splits];
    const othersTotal = updated.slice(0, -1).reduce((s, sp) => s + sp.amount, 0);
    updated[updated.length - 1] = { ...updated[updated.length - 1], amount: +(total - othersTotal).toFixed(2) };
    setSplits(updated);
  };

  const isValid = Math.abs(allocated - total) < 0.01 && splits.every((s) => s.amount > 0);

  return (
    <Modal title="Split Payment" width={480}>
      <div className="flex flex-col gap-4">
        {/* Total */}
        <div className="flex items-center justify-between" style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)' }}>Total to pay</span>
          <span style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-slate-100)' }}>£{total.toFixed(2)}</span>
        </div>

        {/* Active splits */}
        <div className="flex flex-col gap-2">
          {splits.map((split, idx) => {
            const m = methods.find((mt) => mt.id === split.method)!;
            return (
              <motion.div key={split.method} className="flex items-center gap-3" style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <m.icon size={16} style={{ color: m.color }} />
                </div>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)', flex: 1 }}>{m.label}</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-500)', fontFamily: 'var(--font-mono)' }}>£</span>
                  <input type="number" step="0.01" min="0" value={split.amount || ''} onChange={(e) => updateAmount(idx, parseFloat(e.target.value) || 0)}
                    style={{ width: 110, height: 36, paddingLeft: 24, paddingRight: 8, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-base)', color: 'var(--color-slate-100)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, outline: 'none', textAlign: 'right' }} />
                </div>
                {splits.length > 1 && (
                  <motion.button className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--color-rose-bg)', color: 'var(--color-rose)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}
                    whileTap={{ scale: 0.9 }} onClick={() => removeSplit(idx)}>×</motion.button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Add method buttons */}
        <div className="flex gap-2">
          {methods.filter((m) => !splits.find((s) => s.method === m.id)).map((m) => (
            <motion.button key={m.id} className="flex items-center gap-1.5 cursor-pointer" style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px dashed var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)', fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
              whileHover={{ borderColor: `${m.color}50`, color: m.color }} whileTap={{ scale: 0.96 }} onClick={() => addSplit(m.id)}>
              <m.icon size={12} /> + {m.label}
            </motion.button>
          ))}
        </div>

        {/* Remaining / auto-fill */}
        <div className="flex items-center justify-between" style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: remaining > 0.01 ? 'var(--color-rose-bg)' : 'var(--color-emerald-bg)' }}>
          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: remaining > 0.01 ? 'var(--color-rose)' : 'var(--color-emerald)' }}>
            {remaining > 0.01 ? `£${remaining.toFixed(2)} remaining` : 'Fully allocated ✓'}
          </span>
          {remaining > 0.01 && splits.length >= 2 && (
            <motion.button className="cursor-pointer" style={{ padding: '3px 10px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--color-indigo)', color: 'white', fontSize: 'var(--text-xs)', fontWeight: 600 }}
              whileTap={{ scale: 0.96 }} onClick={autoFillLast}>Auto-fill last</motion.button>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-1">
          <motion.button className="cursor-pointer" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
            whileTap={{ scale: 0.97 }} onClick={closeModal}>Cancel</motion.button>
          <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '10px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: isValid ? 'linear-gradient(135deg, var(--color-indigo), var(--color-indigo-dark))' : 'var(--color-surface-overlay)', color: isValid ? 'white' : 'var(--color-slate-500)', fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'var(--font-sans)', boxShadow: isValid ? 'var(--shadow-glow-indigo)' : 'none', opacity: isValid ? 1 : 0.5 }}
            whileHover={isValid ? { scale: 1.02 } : {}} whileTap={isValid ? { scale: 0.97 } : {}} onClick={() => isValid && onConfirm(splits)} disabled={!isValid}>
            <Check size={14} /> Confirm Payment
          </motion.button>
        </div>
      </div>
    </Modal>
  );
}
