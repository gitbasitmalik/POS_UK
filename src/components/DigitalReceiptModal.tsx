import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, QrCode, Printer, Check, Send } from 'lucide-react';
import Modal from './Modal';
import { usePosStore } from '../store';

const receiptMethods = [
  { id: 'email', icon: Mail, label: 'Email Receipt', desc: 'Send to customer email', color: '#6366F1' },
  { id: 'sms', icon: MessageSquare, label: 'SMS Receipt', desc: 'Send via text message', color: '#10B981' },
  { id: 'qr', icon: QrCode, label: 'QR Code', desc: 'Customer scans to save', color: '#3B82F6' },
  { id: 'print', icon: Printer, label: 'Print Receipt', desc: 'Traditional paper receipt', color: '#A1A1AA' },
];

export default function DigitalReceiptModal({ total: propTotal, receiptNumber: propReceipt }: { total?: number; receiptNumber?: string }) {
  const { closeModal, addToast, selectedCustomer, modalData } = usePosStore();
  const total = propTotal ?? modalData?.total ?? 0;
  const receiptNumber = propReceipt ?? modalData?.receiptNumber ?? '';
  const [selected, setSelected] = useState<string | null>(null);
  const [email, setEmail] = useState(selectedCustomer?.email || '');
  const [phone, setPhone] = useState(selectedCustomer?.phone || '');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
    const method = receiptMethods.find((m) => m.id === selected);
    addToast(`Receipt sent via ${method?.label || 'selected method'}`);
    setTimeout(() => closeModal(), 800);
  };

  return (
    <Modal title="Send Receipt" width={440}>
      <div className="flex flex-col gap-4">
        {/* Receipt summary */}
        <div className="flex items-center justify-between" style={{ padding: 12, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
          <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Receipt </span><span style={{ fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-300)' }}>{receiptNumber}</span></div>
          <span style={{ fontSize: 'var(--text-md)', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-slate-100)' }}>£{total.toFixed(2)}</span>
        </div>

        {/* Method selection */}
        <div className="grid grid-cols-2 gap-2">
          {receiptMethods.map((m) => (
            <motion.button key={m.id} className="flex flex-col items-center gap-2 cursor-pointer" style={{ padding: 16, borderRadius: 'var(--radius-lg)', border: `2px solid ${selected === m.id ? `${m.color}50` : 'var(--color-surface-glass-border)'}`, background: selected === m.id ? `${m.color}08` : 'var(--color-surface-overlay)', color: selected === m.id ? m.color : 'var(--color-slate-400)', fontFamily: 'var(--font-sans)', transition: 'all 200ms ease' }}
              whileHover={{ borderColor: `${m.color}30` }} whileTap={{ scale: 0.97 }} onClick={() => setSelected(m.id)}>
              <m.icon size={22} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{m.label}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>{m.desc}</span>
            </motion.button>
          ))}
        </div>

        {/* Input fields based on selection */}
        {selected === 'email' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-1">
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com"
              style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-base)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none' }} />
          </motion.div>
        )}
        {selected === 'sms' && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col gap-1">
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07700 900000"
              style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-base)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
          </motion.div>
        )}
        {selected === 'qr' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-2 py-2">
            <div style={{ width: 140, height: 140, borderRadius: 'var(--radius-lg)', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
              <div style={{ width: '100%', height: '100%', background: `repeating-conic-gradient(#000 0% 25%, #fff 0% 50%) 50% / 12px 12px`, borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Customer scans with phone camera</span>
          </motion.div>
        )}

        {/* Send button */}
        <motion.button className="flex items-center justify-center gap-2 cursor-pointer w-full" style={{ height: 44, borderRadius: 'var(--radius-md)', border: 'none', background: sent ? 'var(--color-emerald)' : selected ? 'linear-gradient(135deg, var(--color-indigo), var(--color-indigo-dark))' : 'var(--color-surface-overlay)', color: selected || sent ? 'white' : 'var(--color-slate-500)', fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'var(--font-sans)', boxShadow: selected ? 'var(--shadow-glow-indigo)' : 'none', opacity: selected || sent ? 1 : 0.5 }}
          whileHover={selected && !sent ? { scale: 1.01 } : {}} whileTap={selected && !sent ? { scale: 0.98 } : {}} onClick={!sent && selected ? handleSend : undefined}>
          {sending ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><Send size={16} /></motion.div> :
           sent ? <><Check size={16} /> Sent!</> :
           selected === 'print' ? <><Printer size={16} /> Print Receipt</> :
           <><Send size={16} /> {selected ? `Send via ${receiptMethods.find((m) => m.id === selected)?.label}` : 'Select a method'}</>}
        </motion.button>

        {/* Skip */}
        <button className="cursor-pointer" style={{ background: 'none', border: 'none', color: 'var(--color-slate-500)', fontSize: 'var(--text-xs)', fontWeight: 500, textDecoration: 'underline', fontFamily: 'var(--font-sans)', padding: 4 }}
          onClick={() => { addToast('No receipt issued', 'info'); closeModal(); }}>Skip — no receipt</button>
      </div>
    </Modal>
  );
}
