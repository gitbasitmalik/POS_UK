import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Trash2, Crown, Star } from 'lucide-react';
import { usePosStore } from '../store';
import Modal from '../components/Modal';

const tierColors: any = { bronze: '#CD7F32', silver: '#C0C0C0', gold: '#FFD700', platinum: '#E5E4E2' };

export default function CustomersPage() {
  const { customers, addCustomer, updateCustomer, deleteCustomer, activeModal, openModal, closeModal, addToast } = usePosStore();
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<any>(null);

  const filtered = search ? customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)) : customers;

  const handleSave = () => {
    if (!form) return;
    if (form.id && customers.find((c) => c.id === form.id)) { updateCustomer(form.id, form); addToast(`${form.name} updated`); }
    else { addCustomer({ ...form, id: `c-${Date.now()}`, loyaltyPoints: 0, loyaltyTier: 'bronze', totalSpend: 0, visitCount: 0, lastVisit: new Date().toISOString(), createdAt: new Date().toISOString() }); addToast(`${form.name} added`); }
    closeModal(); setForm(null);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      <div className="flex items-center justify-between mb-5">
        <div><h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-slate-100)', margin: 0 }}>Customers</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', marginTop: 4 }}>{customers.length} registered customers</p></div>
        <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--color-indigo), var(--color-indigo-dark))', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600, boxShadow: 'var(--shadow-glow-indigo)' }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => { setForm({ name: '', email: '', phone: '', notes: '' }); openModal('customer-form'); }}><Plus size={14} /> Add Customer</motion.button>
      </div>

      <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
        style={{ width: '100%', maxWidth: 360, height: 38, padding: '0 14px', marginBottom: 16, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-sans)' }} />

      <div className="grid grid-cols-3 gap-4 flex-1 overflow-y-auto" style={{ alignContent: 'start' }}>
        {filtered.map((c) => (
          <motion.div key={c.id} style={{ padding: 20, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)', boxShadow: 'var(--shadow-neu-flat)' }}
            whileHover={{ boxShadow: 'var(--shadow-neu-raised)' }}>
            <div className="flex items-center gap-3 mb-3">
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, var(--color-indigo), #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: 'white' }}>{c.name.split(' ').map((n) => n[0]).join('')}</div>
              <div className="flex-1">
                <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>{c.name}</div>
                <div className="flex items-center gap-1"><Crown size={10} style={{ color: tierColors[c.loyaltyTier] }} /><span style={{ fontSize: 10, fontWeight: 700, color: tierColors[c.loyaltyTier], textTransform: 'capitalize' }}>{c.loyaltyTier}</span></div>
              </div>
              <div className="flex gap-1">
                <motion.button className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  whileHover={{ color: 'var(--color-indigo-light)' }} onClick={() => { setForm({ ...c }); openModal('customer-form'); }}><Edit2 size={12} /></motion.button>
                <motion.button className="cursor-pointer" style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  whileHover={{ color: 'var(--color-rose)' }} onClick={() => { deleteCustomer(c.id); addToast(`${c.name} removed`, 'error'); }}><Trash2 size={12} /></motion.button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-400)' }}>
              <div>Email<div style={{ color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)' }}>{c.email}</div></div>
              <div>Phone<div style={{ color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)' }}>{c.phone}</div></div>
              <div>Total Spend<div style={{ color: 'var(--color-emerald)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>£{c.totalSpend.toFixed(2)}</div></div>
              <div>Loyalty Pts<div style={{ color: 'var(--color-amber)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{c.loyaltyPoints.toLocaleString()}</div></div>
              <div>Visits<div style={{ color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)' }}>{c.visitCount}</div></div>
              <div>Last Visit<div style={{ color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)' }}>{new Date(c.lastVisit).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</div></div>
            </div>
            {c.notes && <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-surface-overlay)', fontSize: 'var(--text-xs)', color: 'var(--color-slate-400)', fontStyle: 'italic' }}>{c.notes}</div>}
          </motion.div>
        ))}
      </div>

      {activeModal === 'customer-form' && form && (
        <Modal title={form.id ? 'Edit Customer' : 'Add Customer'} width={440}>
          <div className="flex flex-col gap-4">
            {[{ label: 'Full Name', key: 'name' }, { label: 'Email', key: 'email' }, { label: 'Phone', key: 'phone' }, { label: 'Notes', key: 'notes' }].map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>{f.label}</label>
                <input type="text" value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none' }} />
              </div>
            ))}
            <div className="flex justify-end gap-3 mt-2">
              <motion.button className="cursor-pointer" style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600 }} onClick={closeModal}>Cancel</motion.button>
              <motion.button className="cursor-pointer" style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-indigo)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600 }} whileHover={{ scale: 1.02 }} onClick={handleSave}>Save</motion.button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
