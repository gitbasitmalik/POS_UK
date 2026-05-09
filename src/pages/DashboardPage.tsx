import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShoppingCart, TrendingUp, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { usePosStore } from '../store';
import { generateSalesData } from '../data';

const KPI = ({ title, value, change, icon: Icon, color }: any) => (
  <motion.div className="flex flex-col gap-2" style={{ padding: 20, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)', boxShadow: 'var(--shadow-neu-flat)' }}
    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
    <div className="flex items-center justify-between">
      <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', fontWeight: 500 }}>{title}</span>
      <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
    <span style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--color-slate-100)', letterSpacing: '-0.5px' }}>{value}</span>
    <div className="flex items-center gap-1" style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: change >= 0 ? 'var(--color-emerald)' : 'var(--color-rose)' }}>
      {change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
      <span>{Math.abs(change)}% vs yesterday</span>
    </div>
  </motion.div>
);

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#3B82F6', '#EC4899'];

export default function DashboardPage() {
  const { transactions, products, alerts, staff } = usePosStore();
  const [salesData, setSalesData] = useState(generateSalesData());

  useEffect(() => {
    const t = setInterval(() => setSalesData(generateSalesData()), 30000);
    return () => clearInterval(t);
  }, []);

  const todaySales = salesData.reduce((s, d) => s + d.sales, 0);
  const todayTxns = salesData.reduce((s, d) => s + d.transactions, 0);
  const avgBasket = todayTxns > 0 ? todaySales / todayTxns : 0;
  const lowStock = products.filter((p) => p.stock <= p.reorderPoint);
  const unreadAlerts = alerts.filter((a) => !a.read);

  const categoryData = ['beverages', 'snacks', 'dairy', 'bakery', 'produce', 'meat', 'household'].map((cat, i) => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    value: products.filter((p) => p.category === cat).reduce((s, p) => s + p.stock, 0),
  }));

  const topProducts = [...products].sort((a, b) => (b.stock < b.reorderPoint ? 1 : 0) - (a.stock < a.reorderPoint ? 1 : 0)).slice(0, 5);

  return (
    <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'thin' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-slate-100)', margin: 0 }}>Dashboard</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', marginTop: 4 }}>Real-time overview of your store performance</p>
        </div>
        <div className="flex items-center gap-2" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)' }}>
          <Clock size={14} />
          <span>{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPI title="Today's Sales" value={`£${todaySales.toLocaleString()}`} change={12.4} icon={DollarSign} color="var(--color-emerald)" />
        <KPI title="Transactions" value={todayTxns} change={8.2} icon={ShoppingCart} color="var(--color-indigo)" />
        <KPI title="Avg Basket" value={`£${avgBasket.toFixed(2)}`} change={3.1} icon={TrendingUp} color="var(--color-amber)" />
        <KPI title="Low Stock Items" value={lowStock.length} change={-2} icon={AlertTriangle} color="var(--color-rose)" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Hourly Sales Bar Chart */}
        <div className="col-span-2" style={{ padding: 20, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>Hourly Sales</span>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', fontFamily: 'var(--font-mono)' }}>Last 12 hours</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salesData}>
              <XAxis dataKey="hour" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v}`} />
              <Tooltip contentStyle={{ background: '#2A2A2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 13, color: '#E4E4E7' }} />
              <Bar dataKey="sales" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Distribution Pie */}
        <div style={{ padding: 20, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)' }}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>Stock by Category</span>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#2A2A2E', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, fontSize: 12, color: '#E4E4E7' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Top Products */}
        <div style={{ padding: 20, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)' }}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>Attention Needed</span>
          <div className="flex flex-col gap-2 mt-4">
            {lowStock.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-center gap-3" style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)' }}>
                <img src={p.image} alt="" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                <div className="flex-1 min-w-0">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: p.stock <= 5 ? 'var(--color-rose)' : 'var(--color-amber)' }}>{p.stock} in stock / min {p.reorderPoint}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Performance */}
        <div style={{ padding: 20, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)' }}>
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>Staff Leaderboard</span>
          <div className="flex flex-col gap-2 mt-4">
            {staff.filter((s) => s.role !== 'admin').sort((a, b) => b.salesTotal - a.salesTotal).map((s, i) => (
              <div key={s.id} className="flex items-center gap-3" style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)' }}>
                <div style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', background: i === 0 ? 'linear-gradient(135deg,#F59E0B,#D97706)' : 'var(--color-surface-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? 'white' : 'var(--color-slate-400)' }}>{s.avatar}</div>
                <div className="flex-1">
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)' }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--color-slate-500)' }}>{s.transactionCount} txns</div>
                </div>
                <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-emerald)' }}>£{s.salesTotal.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div style={{ padding: 20, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)' }}>
          <div className="flex items-center justify-between">
            <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--color-slate-100)' }}>Alerts</span>
            {unreadAlerts.length > 0 && <span style={{ padding: '1px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-rose-bg)', color: 'var(--color-rose)', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{unreadAlerts.length}</span>}
          </div>
          <div className="flex flex-col gap-2 mt-4">
            {alerts.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3" style={{ padding: 8, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', opacity: a.read ? 0.6 : 1 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 5, background: a.severity === 'critical' ? 'var(--color-rose)' : a.severity === 'warning' ? 'var(--color-amber)' : 'var(--color-indigo-light)', minWidth: 8 }} />
                <div>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)' }}>{a.title}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-400)', marginTop: 2 }}>{a.message}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
