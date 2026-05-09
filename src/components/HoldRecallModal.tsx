import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PauseCircle, PlayCircle, Trash2, Clock, ShoppingBag } from 'lucide-react';
import Modal from './Modal';
import { usePosStore } from '../store';

export default function HoldRecallModal() {
  const { heldTransactions, holdTransaction, recallTransaction, deleteHeldTransaction, closeModal, cart, addToast } = usePosStore();
  const [holdLabel, setHoldLabel] = useState('');
  const [tab, setTab] = useState<'hold' | 'recall'>(cart.length > 0 ? 'hold' : 'recall');

  const handleHold = () => {
    if (cart.length === 0) return;
    holdTransaction(holdLabel || `Order #${heldTransactions.length + 1}`);
    addToast('Transaction held');
    closeModal();
  };

  const handleRecall = (id: string) => {
    recallTransaction(id);
    addToast('Transaction recalled');
    closeModal();
  };

  return (
    <Modal title="Hold / Recall Transaction" width={480}>
      <div className="flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex gap-1" style={{ padding: 2, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
          <button className="cursor-pointer flex-1" onClick={() => setTab('hold')} style={{ padding: '8px 0', borderRadius: 'var(--radius-sm)', border: 'none', background: tab === 'hold' ? 'var(--color-indigo)' : 'transparent', color: tab === 'hold' ? 'white' : 'var(--color-slate-400)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
            Hold Current
          </button>
          <button className="cursor-pointer flex-1" onClick={() => setTab('recall')} style={{ padding: '8px 0', borderRadius: 'var(--radius-sm)', border: 'none', background: tab === 'recall' ? 'var(--color-indigo)' : 'transparent', color: tab === 'recall' ? 'white' : 'var(--color-slate-400)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>
            Recall ({heldTransactions.length})
          </button>
        </div>

        {tab === 'hold' ? (
          <div className="flex flex-col gap-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center py-8" style={{ color: 'var(--color-slate-500)' }}>
                <ShoppingBag size={32} strokeWidth={1} style={{ opacity: 0.4, marginBottom: 8 }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>Cart is empty — nothing to hold</span>
              </div>
            ) : (
              <>
                <div style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Current cart: </span>
                  <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-slate-200)' }}>{cart.length} items</span>
                </div>
                <div className="flex flex-col gap-1">
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Label (optional)</label>
                  <input type="text" value={holdLabel} onChange={(e) => setHoldLabel(e.target.value)} placeholder="e.g. Table 3, Customer waiting..."
                    style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
                </div>
                <motion.button className="flex items-center justify-center gap-2 cursor-pointer w-full" style={{ height: 44, borderRadius: 'var(--radius-md)', border: 'none', background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'var(--font-sans)' }}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={handleHold}>
                  <PauseCircle size={16} /> Hold Transaction
                </motion.button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {heldTransactions.length === 0 ? (
              <div className="flex flex-col items-center py-8" style={{ color: 'var(--color-slate-500)' }}>
                <Clock size={32} strokeWidth={1} style={{ opacity: 0.4, marginBottom: 8 }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>No held transactions</span>
              </div>
            ) : (
              <AnimatePresence>
                {heldTransactions.map((h) => (
                  <motion.div key={h.id} className="flex items-center gap-3" style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <div className="flex-1">
                      <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)' }}>{h.label}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', marginTop: 2 }}>
                        {h.items.length} items • {h.heldBy} • {new Date(h.heldAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <motion.button className="flex items-center gap-1 cursor-pointer" style={{ padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: 'var(--color-indigo)', color: 'white', fontSize: 'var(--text-xs)', fontWeight: 600 }}
                      whileTap={{ scale: 0.95 }} onClick={() => handleRecall(h.id)}>
                      <PlayCircle size={12} /> Recall
                    </motion.button>
                    <motion.button className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      whileHover={{ color: 'var(--color-rose)' }} whileTap={{ scale: 0.9 }} onClick={() => { deleteHeldTransaction(h.id); addToast('Held transaction deleted', 'info'); }}>
                      <Trash2 size={12} />
                    </motion.button>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
