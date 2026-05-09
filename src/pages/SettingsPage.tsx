import { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Receipt, Printer, Wifi, Database, Save } from 'lucide-react';
import { usePosStore } from '../store';

export default function SettingsPage() {
  const { addToast } = usePosStore();
  const [settings, setSettings] = useState({
    storeName: 'AuraFlow Market', address: '42 High Street, London, E1 6AN', phone: '020 7946 0958', vatNumber: 'GB 123 4567 89',
    vatStandard: 20, vatReduced: 5, vatZero: 0, currency: 'GBP',
    receiptHeader: 'Thank you for shopping with us!', receiptFooter: 'Returns accepted within 14 days with receipt.',
    digitalReceipts: true, autoReorder: false,
  });

  const update = (key: string, value: any) => setSettings({ ...settings, [key]: value });
  const inputStyle = { height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none', width: '100%' };
  const labelStyle = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' as const, letterSpacing: '0.5px' };
  const sectionStyle = { padding: 24, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)' };

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
      <div className="flex items-center justify-between mb-6">
        <div><h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-slate-100)', margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', marginTop: 4 }}>Configure your store and POS system</p></div>
        <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-indigo)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600, boxShadow: 'var(--shadow-glow-indigo)' }}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={() => addToast('Settings saved successfully')}><Save size={14} /> Save Changes</motion.button>
      </div>

      <div className="flex flex-col gap-6" style={{ maxWidth: 720 }}>
        {/* Store Profile */}
        <div style={sectionStyle}>
          <div className="flex items-center gap-2 mb-4"><Store size={18} style={{ color: 'var(--color-indigo-light)' }} /><span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>Store Profile</span></div>
          <div className="grid grid-cols-2 gap-4">
            {[{ label: 'Store Name', key: 'storeName' }, { label: 'Phone', key: 'phone' }, { label: 'Address', key: 'address' }, { label: 'VAT Number', key: 'vatNumber' }].map((f) => (
              <div key={f.key} className="flex flex-col gap-1"><label style={labelStyle}>{f.label}</label><input type="text" value={(settings as any)[f.key]} onChange={(e) => update(f.key, e.target.value)} style={inputStyle} /></div>
            ))}
          </div>
        </div>

        {/* Tax Configuration */}
        <div style={sectionStyle}>
          <div className="flex items-center gap-2 mb-4"><Receipt size={18} style={{ color: 'var(--color-amber)' }} /><span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>Tax Configuration</span></div>
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'Standard Rate (%)', key: 'vatStandard' }, { label: 'Reduced Rate (%)', key: 'vatReduced' }, { label: 'Zero Rate (%)', key: 'vatZero' }].map((f) => (
              <div key={f.key} className="flex flex-col gap-1"><label style={labelStyle}>{f.label}</label><input type="number" value={(settings as any)[f.key]} onChange={(e) => update(f.key, parseFloat(e.target.value))} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} /></div>
            ))}
          </div>
        </div>

        {/* Receipt */}
        <div style={sectionStyle}>
          <div className="flex items-center gap-2 mb-4"><Printer size={18} style={{ color: 'var(--color-emerald)' }} /><span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>Receipt Settings</span></div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1"><label style={labelStyle}>Receipt Header</label><input type="text" value={settings.receiptHeader} onChange={(e) => update('receiptHeader', e.target.value)} style={inputStyle} /></div>
            <div className="flex flex-col gap-1"><label style={labelStyle}>Receipt Footer</label><input type="text" value={settings.receiptFooter} onChange={(e) => update('receiptFooter', e.target.value)} style={inputStyle} /></div>
            <label className="flex items-center gap-3 cursor-pointer" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-300)' }}>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: settings.digitalReceipts ? 'var(--color-indigo)' : 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)', position: 'relative', transition: 'background 200ms ease', cursor: 'pointer' }} onClick={() => update('digitalReceipts', !settings.digitalReceipts)}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: settings.digitalReceipts ? 22 : 2, transition: 'left 200ms ease' }} />
              </div>
              Enable Digital Receipts (Email / SMS / QR)
            </label>
          </div>
        </div>

        {/* System */}
        <div style={sectionStyle}>
          <div className="flex items-center gap-2 mb-4"><Database size={18} style={{ color: 'var(--color-rose)' }} /><span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>System</span></div>
          <div className="flex flex-col gap-4">
            <label className="flex items-center gap-3 cursor-pointer" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-300)' }}>
              <div style={{ width: 44, height: 24, borderRadius: 12, background: settings.autoReorder ? 'var(--color-indigo)' : 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)', position: 'relative', transition: 'background 200ms ease', cursor: 'pointer' }} onClick={() => update('autoReorder', !settings.autoReorder)}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: settings.autoReorder ? 22 : 2, transition: 'left 200ms ease' }} />
              </div>
              Auto-Reorder when stock below reorder point
            </label>
            <div className="flex gap-3">
              <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600 }}
                whileHover={{ borderColor: 'rgba(99,102,241,0.3)' }} onClick={() => addToast('Backup created', 'info')}><Database size={14} /> Create Backup</motion.button>
              <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600 }}
                whileHover={{ borderColor: 'rgba(99,102,241,0.3)' }} onClick={() => addToast('Sync complete', 'info')}><Wifi size={14} /> Force Sync</motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
