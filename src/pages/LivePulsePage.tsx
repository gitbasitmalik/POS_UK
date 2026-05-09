import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, DollarSign, Users, ShoppingCart, Clock, ArrowUpRight, ArrowDownRight, Wifi, WifiOff, Shield, BarChart3, Eye, Package, AlertTriangle, Bell } from 'lucide-react';
import { usePosStore } from '../store';

export default function LivePulsePage() {
  const { transactions, cart, currentStaff, staff, products, alerts, cartTotal, cartItemCount, auditTrail, customers } = usePosStore();
  const [clock, setClock] = useState(new Date());
  const [view, setView] = useState<'overview' | 'feed'>('overview');

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const todayTxns = useMemo(() => {
    const today = new Date().toDateString();
    return transactions.filter(t => new Date(t.timestamp).toDateString() === today && t.status === 'completed');
  }, [transactions]);

  const stats = useMemo(() => {
    const totalRevenue = todayTxns.reduce((s, t) => s + t.total, 0);
    const totalItems = todayTxns.reduce((s, t) => s + t.items.reduce((ss, i) => ss + i.quantity, 0), 0);
    const avgBasket = todayTxns.length > 0 ? totalRevenue / todayTxns.length : 0;
    const cardPayments = todayTxns.filter(t => t.payments.some(p => p.method === 'card' || p.method === 'contactless')).length;
    const cashPayments = todayTxns.filter(t => t.payments.some(p => p.method === 'cash')).length;
    const lowStockCount = products.filter(p => p.stock < p.reorderPoint).length;
    const unreadAlerts = alerts?.filter(a => !a.read).length || 0;

    return { totalRevenue, totalItems, avgBasket, txnCount: todayTxns.length, cardPayments, cashPayments, lowStockCount, unreadAlerts };
  }, [todayTxns, products, alerts]);

  const recentActivity = useMemo(() => {
    return auditTrail.slice(0, 15);
  }, [auditTrail]);

  const activityIcons: Record<string, any> = {
    'sale': ShoppingCart,
    'refund': ArrowDownRight,
    'void': AlertTriangle,
    'login': Shield,
    'stock-adjust': Package,
    'markdown': ArrowDownRight,
    'gift-card-issue': DollarSign,
  };

  return (
    <div className="p-6 h-full flex flex-col gap-5 overflow-y-auto custom-scrollbar" style={{ maxWidth: 1200, margin: '0 auto', width: '100%' }}>
      {/* Mobile-style Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[3px]">Live</span>
          </div>
          <h1 className="text-2xl font-black text-[var(--color-slate-100)] tracking-tight">Manager's Pulse</h1>
          <p className="text-xs text-[var(--color-slate-500)] font-medium">{clock.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-3xl font-black text-white font-mono" style={{ textShadow: '0 0 20px rgba(99,102,241,0.2)' }}>
            {clock.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <span className="text-[10px] font-bold text-[var(--color-slate-500)]">
            Logged in as: {currentStaff.name}
          </span>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex p-1 rounded-xl bg-[var(--color-slate-900)] border border-[var(--color-surface-glass-border)] self-start">
        {(['overview', 'feed'] as const).map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${view === v ? 'bg-indigo-500 text-white' : 'text-[var(--color-slate-500)] hover:text-white'}`}>
            {v === 'overview' ? '📊 Overview' : '📡 Activity Feed'}
          </button>
        ))}
      </div>

      {view === 'overview' ? (
        <>
          {/* KPI Cards — Mobile Bento */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Today\'s Revenue', value: `£${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: '#10B981', trend: '+12%' },
              { label: 'Transactions', value: stats.txnCount, icon: ShoppingCart, color: '#6366F1', trend: `${stats.txnCount} today` },
              { label: 'Avg Basket', value: `£${stats.avgBasket.toFixed(2)}`, icon: TrendingUp, color: '#F59E0B', trend: 'per txn' },
              { label: 'Items Sold', value: stats.totalItems, icon: Package, color: '#8B5CF6', trend: 'units' },
            ].map((kpi, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] shadow-xl group hover:border-[var(--color-slate-700)] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg transition-transform group-hover:scale-110" style={{ backgroundColor: `${kpi.color}15`, color: kpi.color }}>
                    <kpi.icon size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-[var(--color-slate-500)]">{kpi.trend}</span>
                </div>
                <h3 className="text-2xl font-black text-white font-mono">{kpi.value}</h3>
                <p className="text-[9px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mt-1">{kpi.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-12 gap-4">
            {/* Staff Status */}
            <div className="col-span-5 p-5 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
              <h3 className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-4">
                <Users size={12} className="inline mr-1" /> Staff on Shift
              </h3>
              <div className="space-y-3">
                {staff.filter(s => s.active).map(s => (
                  <div key={s.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>
                      {s.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--color-slate-200)] truncate">{s.name}</p>
                      <p className="text-[10px] text-[var(--color-slate-500)] capitalize">{s.role}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      <span className="text-[10px] font-bold text-emerald-400">Online</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Mix */}
            <div className="col-span-4 p-5 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
              <h3 className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-4">Payment Mix</h3>
              <div className="space-y-4">
                {[
                  { label: 'Card / Contactless', count: stats.cardPayments, color: '#6366F1', pct: stats.txnCount > 0 ? Math.round(stats.cardPayments / stats.txnCount * 100) : 0 },
                  { label: 'Cash', count: stats.cashPayments, color: '#10B981', pct: stats.txnCount > 0 ? Math.round(stats.cashPayments / stats.txnCount * 100) : 0 },
                ].map((pm, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold text-[var(--color-slate-300)]">{pm.label}</span>
                      <span className="text-xs font-mono font-bold" style={{ color: pm.color }}>{pm.pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--color-slate-800)] overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pm.pct}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full" style={{ backgroundColor: pm.color }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts Summary */}
            <div className="col-span-3 p-5 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
              <h3 className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-4">
                <Bell size={12} className="inline mr-1" /> Alerts
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/5 border border-rose-500/15">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-rose-400" />
                    <span className="text-xs font-bold text-rose-400">Low Stock</span>
                  </div>
                  <span className="text-lg font-black text-rose-400 font-mono">{stats.lowStockCount}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <div className="flex items-center gap-2">
                    <Bell size={14} className="text-amber-400" />
                    <span className="text-xs font-bold text-amber-400">Unread</span>
                  </div>
                  <span className="text-lg font-black text-amber-400 font-mono">{stats.unreadAlerts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Cart Preview */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
            <h3 className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-3">
              <Eye size={12} className="inline mr-1" /> Current Till — Live View
            </h3>
            {cart.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                  {cart.slice(0, 5).map(item => (
                    <img key={item.product.id} src={item.product.image} alt="" className="w-10 h-10 rounded-lg border-2 border-[var(--color-surface-base)] object-cover" />
                  ))}
                  {cart.length > 5 && <div className="w-10 h-10 rounded-lg bg-[var(--color-slate-800)] border-2 border-[var(--color-surface-base)] flex items-center justify-center text-xs font-bold text-white">+{cart.length - 5}</div>}
                </div>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[9px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Items</p>
                    <p className="text-lg font-black text-white font-mono">{cartItemCount()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Running Total</p>
                    <p className="text-lg font-black text-indigo-400 font-mono">£{cartTotal().toFixed(2)}</p>
                  </div>
                </div>
                <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}
                  className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Activity size={14} className="text-emerald-400" />
                  <span className="text-[10px] font-black text-emerald-400 uppercase">Transaction in Progress</span>
                </motion.div>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-[var(--color-slate-600)]">
                <Clock size={16} />
                <span className="text-xs font-bold uppercase tracking-wider">Till idle — waiting for next customer</span>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Activity Feed */
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[var(--color-slate-600)]">
              <Activity size={48} strokeWidth={1} className="opacity-30 mb-3" />
              <p className="text-sm font-bold uppercase tracking-wider">No recent activity</p>
            </div>
          ) : (
            recentActivity.map((entry, idx) => {
              const Icon = activityIcons[entry.action] || Activity;
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] hover:bg-white/[0.02] transition-all"
                >
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 flex-shrink-0">
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-slate-200)] truncate">{entry.description}</p>
                    <p className="text-[10px] text-[var(--color-slate-500)]">
                      {entry.staffName} · {new Date(entry.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                    entry.action === 'sale' ? 'bg-emerald-500/10 text-emerald-400' :
                    entry.action === 'refund' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-[var(--color-slate-800)] text-[var(--color-slate-400)]'
                  }`}>
                    {entry.action}
                  </span>
                </motion.div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
