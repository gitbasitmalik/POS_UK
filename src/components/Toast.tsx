import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import { usePosStore } from '../store';

const icons = { success: CheckCircle, error: XCircle, info: Info };
const colors = { success: 'var(--color-emerald)', error: 'var(--color-rose)', info: 'var(--color-indigo-light)' };
const bgs = { success: 'var(--color-emerald-bg)', error: 'var(--color-rose-bg)', info: 'var(--color-indigo-subtle)' };

export default function ToastContainer() {
  const { toasts, removeToast } = usePosStore();
  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2" style={{ zIndex: 'var(--z-toast)', maxWidth: 360 }}>
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = icons[t.type];
          return (
            <motion.div key={t.id} className="flex items-center gap-3 cursor-pointer" style={{ padding: '12px 16px', borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-overlay)', border: `1px solid ${colors[t.type]}30`, boxShadow: 'var(--shadow-neu-raised)' }}
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 100 }} onClick={() => removeToast(t.id)}>
              <Icon size={18} style={{ color: colors[t.type], minWidth: 18 }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-200)', flex: 1 }}>{t.message}</span>
              <X size={14} style={{ color: 'var(--color-slate-500)', minWidth: 14 }} />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
