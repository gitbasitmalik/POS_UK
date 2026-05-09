import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { usePosStore } from '../store';

export default function Modal({ children, title, width = 520 }: { children: React.ReactNode; title: string; width?: number }) {
  const { closeModal } = usePosStore();
  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 'var(--z-modal)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {/* Backdrop */}
        <motion.div className="absolute inset-0 cursor-pointer" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={closeModal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
        {/* Content */}
        <motion.div className="relative flex flex-col" style={{ width, maxHeight: '85vh', borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)', boxShadow: 'var(--shadow-neu-raised)', overflow: 'hidden' }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>{title}</span>
            <motion.button className="flex items-center justify-center cursor-pointer" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: 'none', background: 'transparent', color: 'var(--color-slate-400)' }}
              whileHover={{ color: 'var(--color-slate-200)', background: 'rgba(255,255,255,0.05)' }} whileTap={{ scale: 0.9 }} onClick={closeModal} aria-label="Close">
              <X size={18} />
            </motion.button>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'thin' }}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
