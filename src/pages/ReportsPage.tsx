import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { usePosStore } from '../store';
import { generateSalesData } from '../data';
import { Download, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899'];

export default function ReportsPage() {
  const { transactions, products, wasteLog, staff, addToast } = usePosStore();
  const [tab, setTab] = useState<'sales' | 'products' | 'waste' | 'staff'>('sales');
  
  const totalSales = transactions.filter((t) => t.status === 'completed').reduce((s, t) => s + t.total, 0);
  const totalRefunds = transactions.filter((t) => t.status === 'refunded').reduce((s, t) => s + t.total, 0);
  const totalWaste = wasteLog.reduce((s, w) => s + w.cost, 0);

  const exportFullReport = () => {
    const sections = [
      ['SALES SUMMARY'],
      ['Total Revenue', totalSales.toFixed(2)],
      ['Total Refunds', totalRefunds.toFixed(2)],
      ['Net Sales', (totalSales - totalRefunds).toFixed(2)],
      [],
      ['WASTE SUMMARY'],
      ['Total Waste Cost', totalWaste.toFixed(2)],
      [],
      ['TOP PRODUCTS BY REVENUE'],
      ['Name', 'Sold', 'Revenue', 'Margin %']
    ];

    const prodRows = products.map((p) => {
      const sold = transactions.filter((t) => t.status === 'completed').reduce((s, t) => s + t.items.filter((i) => i.product.id === p.id).reduce((ss, i) => ss + i.quantity, 0), 0);
      return [p.name, sold, (sold * p.price).toFixed(2), ((p.price - p.cost) / p.price * 100).toFixed(2)];
    }).sort((a, b) => (b[2] as any) - (a[2] as any)).slice(0, 50);

    const csv = [...sections, ...prodRows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `full-report-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    addToast('Full business report generated');
  };

  return (
    <div className="flex-1 flex flex-col overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-slate-100)', margin: 0 }}>Reports & Analytics</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', marginTop: 4 }}>Business performance and operational insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1" style={{ padding: 2, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
            {[{ id: 'sales', label: 'Sales' }, { id: 'products', label: 'Products' }, { id: 'waste', label: 'Waste' }, { id: 'staff', label: 'Staff' }].map((t) => (
              <button key={t.id} className="cursor-pointer" onClick={() => setTab(t.id as any)} style={{ padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: 'none', background: tab === t.id ? 'var(--color-indigo)' : 'transparent', color: tab === t.id ? 'white' : 'var(--color-slate-400)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}>{t.label}</button>
            ))}
          </div>
          <motion.button 
            onClick={exportFullReport}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-lg)] bg-[var(--color-indigo)] text-white text-[var(--text-sm)] font-bold shadow-glow-indigo cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText size={16} /> Generate Full Report
          </motion.button>
        </div>
      </div>

      {tab === 'sales' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            {[{ label: 'Total Revenue', value: `£${totalSales.toFixed(2)}`, color: 'var(--color-emerald)' }, { label: 'Refunds', value: `£${totalRefunds.toFixed(2)}`, color: 'var(--color-rose)' }, { label: 'Net Sales', value: `£${(totalSales - totalRefunds).toFixed(2)}`, color: 'var(--color-indigo-light)' }].map((k) => (
              <div key={k.label} style={cardStyle}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-400)', fontWeight: 500, textTransform: 'uppercase', marginBottom: 4 }}>{k.label}</div>
                <div style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-mono)', fontWeight: 800, color: k.color }}>{k.value}</div>
              </div>
            ))}
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)', marginBottom: 16 }}>Hourly Sales Trend</div>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={salesData}><XAxis dataKey="hour" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} /><Tooltip contentStyle={{ background: '#2A2A2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, color: '#E4E4E7' }} /><Line type="monotone" dataKey="sales" stroke="#6366F1" strokeWidth={2.5} dot={{ fill: '#6366F1', r: 3 }} /></LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)', marginBottom: 16 }}>Top Products by Revenue</div>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productSales} layout="vertical"><XAxis type="number" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} /><YAxis type="category" dataKey="name" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} width={120} /><Tooltip contentStyle={{ background: '#2A2A2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12, color: '#E4E4E7' }} /><Bar dataKey="revenue" fill="#6366F1" radius={[0, 4, 4, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {tab === 'waste' && (
        <div className="grid grid-cols-2 gap-4">
          <div style={cardStyle}>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)', marginBottom: 4 }}>Total Waste Cost</div>
            <div style={{ fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-rose)' }}>£{totalWaste.toFixed(2)}</div>
            <div style={{ marginTop: 16 }}>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart><Pie data={wasteByReason} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>{wasteByReason.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}</Pie><Tooltip contentStyle={{ background: '#2A2A2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12, color: '#E4E4E7' }} /></PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={cardStyle}>
            <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)', marginBottom: 12 }}>Waste Log</div>
            <div className="flex flex-col gap-2">
              {wasteLog.map((w) => (
                <div key={w.id} className="flex items-center justify-between" style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)' }}>
                  <div><div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)' }}>{w.productName}</div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-400)' }}>{w.reason} • {w.quantity} units • {w.loggedBy}</div></div>
                  <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-rose)' }}>-£{w.cost.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'staff' && (
        <div style={cardStyle}>
          <div style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)', marginBottom: 16 }}>Staff Performance</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={staff.filter((s) => s.role !== 'admin').map((s) => ({ name: s.name, sales: s.salesTotal, txns: s.transactionCount }))}><XAxis dataKey="name" tick={{ fill: '#A1A1AA', fontSize: 11 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} /><Tooltip contentStyle={{ background: '#2A2A2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12, color: '#E4E4E7' }} /><Bar dataKey="sales" fill="#6366F1" radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
