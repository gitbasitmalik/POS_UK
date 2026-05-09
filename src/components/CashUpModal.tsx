import { useState } from 'react';
import { motion } from 'framer-motion';
import { Banknote, CreditCard, Smartphone, Check, AlertTriangle } from 'lucide-react';
import Modal from './Modal';
import { usePosStore } from '../store';

const denominations = [
  { label: '£50', value: 50 }, { label: '£20', value: 20 }, { label: '£10', value: 10 },
  { label: '£5', value: 5 }, { label: '£2', value: 2 }, { label: '£1', value: 1 },
  { label: '50p', value: 0.5 }, { label: '20p', value: 0.2 }, { label: '10p', value: 0.1 },
  { label: '5p', value: 0.05 }, { label: '2p', value: 0.02 }, { label: '1p', value: 0.01 },
];

export default function CashUpModal() {
  const { closeModal, addToast, transactions } = usePosStore();
  const [step, setStep] = useState(0); // 0=count, 1=review
  const [counts, setCounts] = useState<Record<string, number>>({});

  const completedTxns = transactions.filter((t) => t.status === 'completed');
  const expectedCash = completedTxns.reduce((s, t) => s + t.payments.filter((p) => p.method === 'cash').reduce((ss, p) => ss + Math.max(0, p.amount), 0), 0);
  const expectedCard = completedTxns.reduce((s, t) => s + t.payments.filter((p) => p.method === 'card').reduce((ss, p) => ss + p.amount, 0), 0);
  const expectedContactless = completedTxns.reduce((s, t) => s + t.payments.filter((p) => p.method === 'contactless').reduce((ss, p) => ss + p.amount, 0), 0);

  const actualCash = denominations.reduce((s, d) => s + (counts[d.label] || 0) * d.value, 0);
  const variance = +(actualCash - expectedCash).toFixed(2);

  const handleFinish = () => {
    addToast(`Cash-up complete. ${Math.abs(variance) < 0.01 ? 'No variance ✓' : `Variance: £${variance.toFixed(2)}`}`, Math.abs(variance) < 0.5 ? 'success' : 'error');
    closeModal();
  };

  return (
    <Modal title="End-of-Day Cash-Up" width={540}>
      {step === 0 ? (
        <div className="flex flex-col gap-4">
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)' }}>Count the cash in your drawer by denomination:</p>
          <div className="grid grid-cols-3 gap-2">
            {denominations.map((d) => (
              <div key={d.label} className="flex items-center gap-2" style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--color-slate-200)', width: 36 }}>{d.label}</span>
                <span style={{ color: 'var(--color-slate-500)', fontSize: 'var(--text-xs)' }}>×</span>
                <input type="number" min="0" value={counts[d.label] || ''} onChange={(e) => setCounts({ ...counts, [d.label]: parseInt(e.target.value) || 0 })} placeholder="0"
                  style={{ width: 50, height: 30, textAlign: 'center', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-base)', color: 'var(--color-slate-100)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
                <span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-400)', marginLeft: 'auto' }}>
                  £{((counts[d.label] || 0) * d.value).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between" style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-indigo)40' }}>
            <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-300)' }}>Counted Total</span>
            <span style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-indigo-light)' }}>£{actualCash.toFixed(2)}</span>
          </div>
          <motion.button className="w-full flex items-center justify-center gap-2 cursor-pointer" style={{ height: 44, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-indigo)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 700 }}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => setStep(1)}>
            Review Reconciliation →
          </motion.button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            {[
              { label: 'Cash', icon: Banknote, expected: expectedCash, actual: actualCash, showVariance: true },
              { label: 'Card', icon: CreditCard, expected: expectedCard, actual: expectedCard, showVariance: false },
              { label: 'Contactless', icon: Smartphone, expected: expectedContactless, actual: expectedContactless, showVariance: false },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-3" style={{ padding: 14, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
                <r.icon size={18} style={{ color: 'var(--color-slate-400)' }} />
                <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)', flex: 1 }}>{r.label}</span>
                <div className="flex flex-col items-end">
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Expected: <span style={{ fontFamily: 'var(--font-mono)' }}>£{r.expected.toFixed(2)}</span></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-400)' }}>Actual: <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-slate-100)' }}>£{r.actual.toFixed(2)}</span></div>
                </div>
              </div>
            ))}
          </div>

          {/* Variance */}
          <div style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: Math.abs(variance) < 0.01 ? 'var(--color-emerald-bg)' : Math.abs(variance) < 1 ? 'var(--color-amber-bg)' : 'var(--color-rose-bg)', border: `1px solid ${Math.abs(variance) < 0.01 ? 'rgba(16,185,129,0.2)' : Math.abs(variance) < 1 ? 'rgba(245,158,11,0.2)' : 'rgba(244,63,94,0.2)'}`, textAlign: 'center' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: Math.abs(variance) < 0.01 ? 'var(--color-emerald)' : 'var(--color-amber)', textTransform: 'uppercase', marginBottom: 4 }}>Cash Variance</div>
            <div className="flex items-center justify-center gap-2">
              {Math.abs(variance) >= 0.01 && <AlertTriangle size={16} style={{ color: Math.abs(variance) < 1 ? 'var(--color-amber)' : 'var(--color-rose)' }} />}
              <span style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-mono)', fontWeight: 800, color: Math.abs(variance) < 0.01 ? 'var(--color-emerald)' : Math.abs(variance) < 1 ? 'var(--color-amber)' : 'var(--color-rose)' }}>
                {Math.abs(variance) < 0.01 ? '£0.00 ✓' : `${variance > 0 ? '+' : ''}£${variance.toFixed(2)}`}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <motion.button className="cursor-pointer" style={{ padding: '10px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600 }}
              onClick={() => setStep(0)}>← Back to Count</motion.button>
            <motion.button className="flex-1 flex items-center justify-center gap-2 cursor-pointer" style={{ height: 44, borderRadius: 'var(--radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--color-emerald), #059669)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 700 }}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleFinish}>
              <Check size={16} /> Complete Cash-Up
            </motion.button>
          </div>
        </div>
      )}
    </Modal>
  );
}
