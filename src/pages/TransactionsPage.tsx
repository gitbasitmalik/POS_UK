import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, RotateCcw, XCircle, Eye, Receipt } from 'lucide-react';
import { usePosStore } from '../store';
import Modal from '../components/Modal';

export default function TransactionsPage() {
  const { transactions, refundTransaction, voidTransaction, activeModal, openModal, closeModal, modalData, addToast } = usePosStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = useMemo(() => {
    let f = [...transactions];
    if (statusFilter !== 'all') f = f.filter((t) => t.status === statusFilter);
    if (search) { const q = search.toLowerCase(); f = f.filter((t) => t.id.toLowerCase().includes(q) || t.receiptNumber.toLowerCase().includes(q) || t.cashier.name.toLowerCase().includes(q)); }
    return f;
  }, [transactions, search, statusFilter]);

  const statusColors: any = { completed: 'var(--color-emerald)', refunded: 'var(--color-rose)', voided: 'var(--color-slate-500)', 'partial-refund': 'var(--color-amber)', held: 'var(--color-indigo-light)' };
  const statusBgs: any = { completed: 'var(--color-emerald-bg)', refunded: 'var(--color-rose-bg)', voided: 'rgba(113,113,122,0.12)', 'partial-refund': 'var(--color-amber-bg)', held: 'var(--color-indigo-subtle)' };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-slate-100)', margin: 0 }}>Transactions</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', marginTop: 4 }}>{transactions.length} total transactions</p>
        </div>
          <motion.button 
            onClick={() => {
              const headers = ['ID', 'Receipt', 'Date', 'Cashier', 'Subtotal', 'Tax', 'Total', 'Status', 'Payment Methods'];
              const rows = transactions.map(t => [
                t.id, 
                t.receiptNumber, 
                new Date(t.timestamp).toISOString(), 
                t.cashier.name, 
                t.subtotal, 
                t.tax, 
                t.total, 
                t.status, 
                t.payments.map(p => p.method).join(';')
              ].join(','));
              const csv = [headers.join(','), ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `transactions-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              URL.revokeObjectURL(url);
              addToast(`Exported ${rows.length} transactions to CSV`);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--color-slate-300)] text-[var(--text-sm)] font-bold hover:border-[var(--color-indigo)]/50 transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Receipt size={16} /> Export CSV
          </motion.button>
        </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1" style={{ maxWidth: 600 }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-slate-500)' }} />
          <input type="text" placeholder="Search by ID, receipt, cashier..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: 38, paddingLeft: 34, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-sans)' }} />
        </div>
        <div className="flex gap-1" style={{ padding: 2, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
          {['all', 'completed', 'refunded', 'voided'].map((s) => (
            <button key={s} className="cursor-pointer" onClick={() => setStatusFilter(s)} style={{ padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: statusFilter === s ? 'var(--color-indigo)' : 'transparent', color: statusFilter === s ? 'white' : 'var(--color-slate-400)', fontSize: 'var(--text-xs)', fontWeight: 600, textTransform: 'capitalize', fontFamily: 'var(--font-sans)' }}>{s}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-raised)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
            {['Transaction ID', 'Receipt', 'Date / Time', 'Cashier', 'Items', 'Total', 'Payment', 'Status', 'Actions'].map((h) => (
              <th key={h} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
                <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-indigo-light)' }}>{t.id}</td>
                <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-400)' }}>{t.receiptNumber}</td>
                <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', color: 'var(--color-slate-300)' }}>{new Date(t.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</td>
                <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', color: 'var(--color-slate-300)' }}>{t.cashier.name}</td>
                <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-400)' }}>{t.items.reduce((s, i) => s + i.quantity, 0)}</td>
                <td style={{ padding: '10px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-slate-100)' }}>£{t.total.toFixed(2)}</td>
                <td style={{ padding: '10px 12px', fontSize: 'var(--text-xs)', color: 'var(--color-slate-400)', textTransform: 'capitalize' }}>{t.payments.map((p) => p.method).join(', ')}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 700, color: statusColors[t.status], background: statusBgs[t.status] }}>{t.status}</span>
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <div className="flex gap-1">
                    <motion.button className="cursor-pointer flex items-center justify-center" title="View" style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)' }}
                      whileHover={{ color: 'var(--color-indigo-light)' }} onClick={() => openModal('txn-detail', t)}><Eye size={14} /></motion.button>
                    {t.status === 'completed' && <>
                      <motion.button className="cursor-pointer flex items-center justify-center" title="Refund" style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)' }}
                        whileHover={{ color: 'var(--color-amber)' }} onClick={() => { refundTransaction(t.id); addToast(`${t.id} refunded`, 'info'); }}><RotateCcw size={14} /></motion.button>
                      <motion.button className="cursor-pointer flex items-center justify-center" title="Void" style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)' }}
                        whileHover={{ color: 'var(--color-rose)' }} onClick={() => { voidTransaction(t.id); addToast(`${t.id} voided`, 'error'); }}><XCircle size={14} /></motion.button>
                    </>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {activeModal === 'txn-detail' && modalData && (
        <Modal title={`Transaction ${modalData.id}`} width={520}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Receipt</span><div style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-slate-200)' }}>{modalData.receiptNumber}</div></div>
              <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Cashier</span><div style={{ color: 'var(--color-slate-200)' }}>{modalData.cashier.name}</div></div>
              <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Date</span><div style={{ color: 'var(--color-slate-200)' }}>{new Date(modalData.timestamp).toLocaleString('en-GB')}</div></div>
              <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Status</span><div style={{ color: statusColors[modalData.status], fontWeight: 700, textTransform: 'capitalize' }}>{modalData.status}</div></div>
            </div>
            <div style={{ height: 1, background: 'var(--color-surface-glass-border)' }} />
            <div><span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Items</span>
              <div className="flex flex-col gap-2 mt-2">
                {modalData.items.map((i: any) => (
                  <div key={i.product.id} className="flex items-center justify-between" style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)' }}>
                    <div className="flex items-center gap-2"><img src={i.product.image} alt="" style={{ width: 28, height: 28, borderRadius: 4, objectFit: 'cover' }} /><span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-200)' }}>{i.product.name}</span></div>
                    <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-300)' }}>{i.quantity} × £{i.product.price.toFixed(2)} = £{(i.quantity * i.product.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--color-surface-glass-border)' }} />
            <div className="flex flex-col gap-1">
              <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)' }}><span>Subtotal</span><span style={{ fontFamily: 'var(--font-mono)' }}>£{modalData.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)' }}><span>VAT</span><span style={{ fontFamily: 'var(--font-mono)' }}>£{modalData.tax.toFixed(2)}</span></div>
              <div className="flex justify-between" style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}><span>Total</span><span style={{ fontFamily: 'var(--font-mono)' }}>£{modalData.total.toFixed(2)}</span></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
