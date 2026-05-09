import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, ShieldCheck, ShieldAlert, UserPlus } from 'lucide-react';
import { usePosStore } from '../store';
import Modal from '../components/Modal';
import type { StaffRole } from '../types';

const roleColors: Record<StaffRole, string> = { cashier: 'var(--color-indigo-light)', supervisor: 'var(--color-amber)', manager: 'var(--color-emerald)', admin: 'var(--color-rose)' };
const roleIcons: Record<StaffRole, any> = { cashier: Shield, supervisor: ShieldCheck, manager: ShieldAlert, admin: ShieldAlert };

export default function StaffPage() {
  const { staff, addStaff, updateStaff, deleteStaff, currentStaff, switchStaff, activeModal, openModal, closeModal, addToast } = usePosStore();
  const [form, setForm] = useState<any>(null);
  const [switchPin, setSwitchPin] = useState('');

  const handleSave = () => {
    if (!form) return;
    if (form.id && staff.find((s) => s.id === form.id)) { updateStaff(form.id, form); addToast(`${form.name} updated`); }
    else { addStaff({ ...form, id: `s-${Date.now()}`, active: true, salesTotal: 0, transactionCount: 0 }); addToast(`${form.name} added`); }
    closeModal(); setForm(null);
  };

  const handleSwitch = () => {
    const found = switchStaff(switchPin);
    if (found) { addToast(`Switched to ${found.name}`); closeModal(); setSwitchPin(''); }
    else { addToast('Invalid PIN', 'error'); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      <div className="flex items-center justify-between mb-5">
        <div><h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-slate-100)', margin: 0 }}>Staff Management</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', marginTop: 4 }}>Logged in as <strong style={{ color: 'var(--color-indigo-light)' }}>{currentStaff.name}</strong> ({currentStaff.role})</p></div>
        <div className="flex gap-3">
          <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600 }}
            whileHover={{ borderColor: 'rgba(99,102,241,0.3)' }} onClick={() => openModal('staff-switch')}><UserPlus size={14} /> Quick Switch</motion.button>
          <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--color-indigo), var(--color-indigo-dark))', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600, boxShadow: 'var(--shadow-glow-indigo)' }}
            whileHover={{ scale: 1.02 }} onClick={() => { setForm({ name: '', email: '', role: 'cashier', pin: '', avatar: '', hireDate: new Date().toISOString().split('T')[0] }); openModal('staff-form'); }}><Plus size={14} /> Add Staff</motion.button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto" style={{ alignContent: 'start' }}>
        {staff.map((s) => {
          const RoleIcon = roleIcons[s.role];
          return (
            <motion.div key={s.id} className="flex items-center gap-4" style={{ padding: 20, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: `1px solid ${s.id === currentStaff.id ? 'rgba(99,102,241,0.3)' : 'var(--color-surface-glass-border)'}`, boxShadow: s.id === currentStaff.id ? 'var(--shadow-glow-indigo)' : 'var(--shadow-neu-flat)' }}
              whileHover={{ boxShadow: 'var(--shadow-neu-raised)' }}>
              <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-full)', background: s.id === currentStaff.id ? 'linear-gradient(135deg, var(--color-indigo), #8B5CF6)' : 'var(--color-surface-overlay)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 700, color: s.id === currentStaff.id ? 'white' : 'var(--color-slate-300)' }}>{s.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>{s.name}</span>
                  {s.id === currentStaff.id && <span style={{ padding: '1px 6px', borderRadius: 'var(--radius-full)', background: 'var(--color-indigo-subtle)', color: 'var(--color-indigo-light)', fontSize: 9, fontWeight: 700 }}>ACTIVE</span>}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <RoleIcon size={12} style={{ color: roleColors[s.role] }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: roleColors[s.role], textTransform: 'capitalize' }}>{s.role}</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>•</span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>{s.email}</span>
                </div>
                <div className="flex items-center gap-4 mt-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-400)' }}>
                  <span>Sales: <strong style={{ color: 'var(--color-emerald)', fontFamily: 'var(--font-mono)' }}>£{s.salesTotal.toLocaleString()}</strong></span>
                  <span>Txns: <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-slate-300)' }}>{s.transactionCount}</strong></span>
                  <span>Since: {new Date(s.hireDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <motion.button className="cursor-pointer" style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  whileHover={{ color: 'var(--color-indigo-light)' }} onClick={() => { setForm({ ...s }); openModal('staff-form'); }}><Edit2 size={13} /></motion.button>
                <motion.button className="cursor-pointer" style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  whileHover={{ color: 'var(--color-rose)' }} onClick={() => { deleteStaff(s.id); addToast(`${s.name} removed`, 'error'); }}><Trash2 size={13} /></motion.button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Switch Modal */}
      {activeModal === 'staff-switch' && (
        <Modal title="Quick Staff Switch" width={360}>
          <div className="flex flex-col gap-4 items-center">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', textAlign: 'center' }}>Enter your 4-digit PIN to switch user</p>
            <input type="password" maxLength={4} value={switchPin} onChange={(e) => setSwitchPin(e.target.value.replace(/\D/g, ''))} placeholder="• • • •" autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSwitch()}
              style={{ width: 160, height: 52, textAlign: 'center', fontSize: 'var(--text-xl)', fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 8, borderRadius: 'var(--radius-lg)', border: '2px solid var(--color-indigo)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-100)', outline: 'none' }} />
            <motion.button className="cursor-pointer w-full" style={{ height: 44, borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-indigo)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 700 }}
              whileHover={{ scale: 1.02 }} onClick={handleSwitch}>Switch User</motion.button>
          </div>
        </Modal>
      )}

      {/* Staff Form Modal */}
      {activeModal === 'staff-form' && form && (
        <Modal title={form.id ? 'Edit Staff' : 'Add Staff'} width={440}>
          <div className="flex flex-col gap-4">
            {[{ label: 'Full Name', key: 'name' }, { label: 'Email', key: 'email' }, { label: 'PIN (4 digits)', key: 'pin' }, { label: 'Initials/Avatar', key: 'avatar' }].map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>{f.label}</label>
                <input type={f.key === 'pin' ? 'password' : 'text'} maxLength={f.key === 'pin' ? 4 : undefined} value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: f.key === 'pin' ? e.target.value.replace(/\D/g, '') : e.target.value })}
                  style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: f.key === 'pin' ? 'var(--font-mono)' : 'var(--font-sans)', outline: 'none' }} />
              </div>
            ))}
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
                style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none' }}>
                <option value="cashier">Cashier</option><option value="supervisor">Supervisor</option><option value="manager">Manager</option><option value="admin">Admin</option>
              </select>
            </div>
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
