import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Package, AlertTriangle, Clock, BarChart3, ShoppingCart, Truck, Calendar, ArrowRight, Zap } from 'lucide-react';
import { usePosStore } from '../store';

export default function StockForecastPage() {
  const { products, transactions, supplierOrders, openModal } = usePosStore();

  const forecasts = useMemo(() => {
    return products
      .filter(p => p.active)
      .map(product => {
        // Calculate daily velocity from recent transactions
        const relevantTxns = transactions.filter(t => t.status === 'completed' && t.items.some(i => i.product.id === product.id));
        const totalSold = relevantTxns.reduce((s, t) => s + t.items.filter(i => i.product.id === product.id).reduce((ss, i) => ss + i.quantity, 0), 0);
        
        // Estimate daily velocity (assume data spans ~7 days)
        const dailyVelocity = Math.max(0.5, totalSold / 7);
        const daysOfCover = Math.round(product.stock / dailyVelocity);
        const weeklyDemand = Math.round(dailyVelocity * 7);
        const suggestedOrder = Math.max(0, Math.round((product.reorderPoint * 2) - product.stock));
        
        let riskLevel: 'critical' | 'warning' | 'healthy' | 'overstocked';
        if (daysOfCover <= 2) riskLevel = 'critical';
        else if (daysOfCover <= 5) riskLevel = 'warning';
        else if (daysOfCover > 21) riskLevel = 'overstocked';
        else riskLevel = 'healthy';

        const revenueAtRisk = riskLevel === 'critical' ? +(dailyVelocity * product.price * 3).toFixed(2) : 0;

        return {
          product,
          dailyVelocity: +dailyVelocity.toFixed(1),
          daysOfCover,
          weeklyDemand,
          suggestedOrder,
          riskLevel,
          revenueAtRisk,
        };
      })
      .sort((a, b) => a.daysOfCover - b.daysOfCover);
  }, [products, transactions]);

  const riskColors = {
    critical: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', dot: 'bg-rose-500' },
    warning: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
    healthy: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
    overstocked: { text: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  };

  const stats = useMemo(() => ({
    critical: forecasts.filter(f => f.riskLevel === 'critical').length,
    warning: forecasts.filter(f => f.riskLevel === 'warning').length,
    healthy: forecasts.filter(f => f.riskLevel === 'healthy').length,
    totalRevenueAtRisk: forecasts.reduce((s, f) => s + f.revenueAtRisk, 0),
    avgDaysOfCover: Math.round(forecasts.reduce((s, f) => s + f.daysOfCover, 0) / (forecasts.length || 1)),
  }), [forecasts]);

  return (
    <div className="p-8 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-indigo-subtle)] text-[var(--color-indigo-light)] shadow-glow">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-[var(--text-2xl)] font-black text-[var(--color-slate-100)] tracking-tight">
              Smart Stock Forecasting
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--color-slate-500)] font-medium">
              AI-powered demand prediction and automatic reorder suggestions
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => openModal('supplier-order')}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-indigo)] text-white text-sm font-bold shadow-glow-indigo"
        >
          <Truck size={18} /> Auto-Generate PO
        </motion.button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Critical', value: stats.critical, icon: AlertTriangle, color: '#EF4444', suffix: ' SKUs' },
          { label: 'At Risk', value: stats.warning, icon: Clock, color: '#F59E0B', suffix: ' SKUs' },
          { label: 'Healthy', value: stats.healthy, icon: Package, color: '#10B981', suffix: ' SKUs' },
          { label: 'Revenue at Risk', value: `£${stats.totalRevenueAtRisk.toFixed(0)}`, icon: TrendingDown, color: '#EF4444', suffix: '' },
          { label: 'Avg Cover', value: stats.avgDaysOfCover, icon: Calendar, color: '#6366F1', suffix: ' days' },
        ].map((stat, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] flex items-center justify-between group hover:border-[var(--color-slate-700)] transition-all">
            <div>
              <p className="text-[9px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-0.5">{stat.label}</p>
              <h3 className="text-lg font-black text-[var(--color-slate-100)] font-mono">{stat.value}{stat.suffix}</h3>
            </div>
            <div className="p-2 rounded-lg transition-transform group-hover:scale-110" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Forecast Table */}
      <div className="flex-1 rounded-2xl border border-[var(--color-surface-glass-border)] bg-[var(--color-surface-overlay)] shadow-xl overflow-hidden">
        <div className="overflow-y-auto custom-scrollbar max-h-full">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10" style={{ background: 'var(--color-surface-overlay)' }}>
              <tr style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
                {['Product', 'Stock', 'Daily Velocity', 'Days of Cover', 'Weekly Demand', 'Risk', 'Suggested Order'].map(h => (
                  <th key={h} className="px-5 py-3 text-[9px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {forecasts.map((f, idx) => {
                const rc = riskColors[f.riskLevel];
                return (
                  <motion.tr
                    key={f.product.id}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    className="border-b border-[var(--color-surface-glass-border)]/30 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={f.product.image} alt="" className="w-9 h-9 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-slate-200)]">{f.product.name}</p>
                          <p className="text-[10px] text-[var(--color-slate-500)] font-mono">{f.product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-sm text-[var(--color-slate-300)]">{f.product.stock}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5">
                        {f.dailyVelocity > 3 ? <TrendingUp size={14} className="text-emerald-400" /> : <TrendingDown size={14} className="text-amber-400" />}
                        <span className="font-mono font-bold text-sm text-[var(--color-slate-300)]">{f.dailyVelocity}/day</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 rounded-full bg-[var(--color-slate-800)] overflow-hidden">
                          <div className={`h-full rounded-full ${rc.dot}`} style={{ width: `${Math.min(100, (f.daysOfCover / 21) * 100)}%` }} />
                        </div>
                        <span className={`font-mono font-black text-sm ${rc.text}`}>{f.daysOfCover}d</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono font-bold text-sm text-[var(--color-slate-300)]">{f.weeklyDemand}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${rc.bg} ${rc.text} border ${rc.border}`}>
                        {f.riskLevel}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {f.suggestedOrder > 0 ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-sm text-indigo-400">{f.suggestedOrder}</span>
                          <span className="text-[9px] text-[var(--color-slate-500)] uppercase">units</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-[var(--color-slate-600)] font-bold uppercase">—</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
