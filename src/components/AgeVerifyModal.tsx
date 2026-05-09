import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Calendar } from 'lucide-react';
import Modal from './Modal';
import { usePosStore } from '../store';

export default function AgeVerifyModal({ product: propProduct, onApprove: propApprove, onReject: propReject }: { product?: any; onApprove?: () => void; onReject?: () => void }) {
  const { closeModal, modalData } = usePosStore();
  const product = propProduct ?? modalData?.product;
  const onApprove = propApprove ?? modalData?.onApprove;
  const onReject = propReject ?? modalData?.onReject;

  if (!product) return null;
  const minAge = product.minAge || 18;

  const bornBefore = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - minAge);
    return d;
  }, [minAge]);

  const [confirmed, setConfirmed] = useState<boolean | null>(null);

  const handleApprove = () => {
    setConfirmed(true);
    setTimeout(() => { onApprove(); closeModal(); }, 400);
  };

  const handleReject = () => {
    setConfirmed(false);
    setTimeout(() => { onReject(); closeModal(); }, 400);
  };

  return (
    <Modal title="Age Verification Required" width={420}>
      <div className="flex flex-col items-center gap-5">
        {/* Icon */}
        <motion.div style={{ width: 72, height: 72, borderRadius: 'var(--radius-full)', background: confirmed === true ? 'var(--color-emerald-bg)' : confirmed === false ? 'var(--color-rose-bg)' : 'var(--color-amber-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${confirmed === true ? 'rgba(16,185,129,0.3)' : confirmed === false ? 'rgba(244,63,94,0.3)' : 'rgba(245,158,11,0.3)'}` }}
          animate={{ scale: confirmed !== null ? [1, 1.1, 1] : 1 }} transition={{ duration: 0.3 }}>
          {confirmed === true ? <ShieldCheck size={32} style={{ color: 'var(--color-emerald)' }} /> :
           confirmed === false ? <ShieldAlert size={32} style={{ color: 'var(--color-rose)' }} /> :
           <ShieldAlert size={32} style={{ color: 'var(--color-amber)' }} />}
        </motion.div>

        {/* Product info */}
        <div className="text-center">
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>{product.name}</div>
          <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-rose)', fontWeight: 600, marginTop: 4 }}>
            This product is restricted to {minAge}+
          </div>
        </div>

        {/* Born before date */}
        <div style={{ padding: 16, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)', width: '100%', textAlign: 'center' }}>
          <div className="flex items-center justify-center gap-2 mb-1">
            <Calendar size={14} style={{ color: 'var(--color-slate-400)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Customer must be born before</span>
          </div>
          <div style={{ fontSize: 'var(--text-xl)', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-amber)', letterSpacing: '1px' }}>
            {bornBefore.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Challenge question */}
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-300)', textAlign: 'center', fontWeight: 500 }}>
          Does the customer appear to be over {minAge} years old?
        </div>

        {/* Action buttons */}
        {confirmed === null && (
          <div className="flex gap-3 w-full">
            <motion.button className="flex-1 flex items-center justify-center gap-2 cursor-pointer" style={{ height: 48, borderRadius: 'var(--radius-md)', border: '2px solid rgba(244,63,94,0.3)', background: 'var(--color-rose-bg)', color: 'var(--color-rose)', fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}
              whileHover={{ borderColor: 'rgba(244,63,94,0.5)' }} whileTap={{ scale: 0.97 }} onClick={handleReject}>
              <ShieldAlert size={16} /> Reject Sale
            </motion.button>
            <motion.button className="flex-1 flex items-center justify-center gap-2 cursor-pointer" style={{ height: 48, borderRadius: 'var(--radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--color-emerald), #059669)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'var(--font-sans)', boxShadow: '0 0 20px rgba(16,185,129,0.2)' }}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleApprove}>
              <ShieldCheck size={16} /> Approve ({minAge}+)
            </motion.button>
          </div>
        )}

        {confirmed !== null && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: confirmed ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
            {confirmed ? '✓ Age verified — item added' : '✗ Sale rejected'}
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
