import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Clock, AlertTriangle, TrendingDown, Zap, Percent, Package, Timer, ArrowRight, CheckCircle2, XCircle, BarChart3 } from 'lucide-react';
import { usePosStore } from '../store';

const TIER_CONFIG = [
  { label: 'Morning (25% off)', discount: 25, hour: 10, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  { label: 'Afternoon (50% off)', discount: 50, hour: 16, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  { label: 'Evening (75% off)', discount: 75, hour: 20, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
];

export default function YellowLabelPage() {
  const { products, markdowns, addMarkdown, deleteMarkdown, addToast, currentStaff } = usePosStore();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [reason, setReason] = useState<'expiring-today' | 'expiring-tomorrow' | 'damaged-packaging' | 'overstock' | 'seasonal'>('expiring-today');
  const [customDiscount, setCustomDiscount] = useState(25);
  const [autoMode, setAutoMode] = useState(true);

  const currentHour = new Date().getHours();
  const currentTier = TIER_CONFIG.reduce((acc, tier) => currentHour >= tier.hour ? tier : acc, TIER_CONFIG[0]);

  const freshCategories = ['dairy', 'bakery', 'produce', 'meat'];
  const freshProducts = products.filter(p => freshCategories.includes(p.category) && p.active);

  const activeMarkdowns = markdowns.filter(m => m.active);
  const totalSaved = activeMarkdowns.reduce((s, m) => s + (m.originalPrice - m.reducedPrice), 0);

  const stats = useMemo(() => ({
    activeCount: activeMarkdowns.length,
    totalSaved: totalSaved,
    wasteReduction: Math.min(100, Math.round(activeMarkdowns.length * 12.5)),
    avgDiscount: activeMarkdowns.length > 0 ? Math.round(activeMarkdowns.reduce((s, m) => s + ((m.originalPrice - m.reducedPrice) / m.originalPrice * 100), 0) / activeMarkdowns.length) : 0,
  }), [activeMarkdowns, totalSaved]);

  const toggleProduct = (id: string) => {
    setSelectedProducts(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  const applyMarkdowns = () => {
    if (selectedProducts.length === 0) { addToast('Select products to mark down', 'error'); return; }
    
    const discount = autoMode ? currentTier.discount : customDiscount;
    
    selectedProducts.forEach(pid => {
      const product = products.find(p => p.id === pid);
      if (!product) return;
      
      const reducedPrice = +(product.price * (1 - discount / 100)).toFixed(2);
      const markdown = {
        id: `MD-${Date.now()}-${pid}`,
        productId: pid,
        productName: product.name,
        originalPrice: product.price,
        reducedPrice,
        reason,
        expiresAt: new Date(Date.now() + (reason === 'expiring-today' ? 12 : 36) * 3600000).toISOString(),
        createdBy: currentStaff.name,
        createdAt: new Date().toISOString(),
        active: true,
      };
      addMarkdown(markdown);
    });

    addToast(`${selectedProducts.length} items marked down at ${discount}% off`, 'success');
    setSelectedProducts([]);
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[var(--radius-xl)] shadow-glow" style={{ background: 'linear-gradient(135deg, #FDE047, #F59E0B)', color: '#78350F' }}>
            <Tag size={24} />
          </div>
          <div>
            <h1 className="text-[var(--text-2xl)] font-black text-[var(--color-slate-100)] tracking-tight">
              Yellow Label Manager
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--color-slate-500)] font-medium">
              AI-powered reduced-to-clear pricing · Minimise waste, maximise recovery
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-500/20 bg-amber-500/10">
            <Timer size={16} className="text-amber-400" />
            <span className="text-sm font-black text-amber-400 uppercase tracking-wider">
              Current Tier: {currentTier.label}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Active Markdowns', value: stats.activeCount, icon: Tag, color: '#F59E0B' },
          { label: 'Total Savings', value: `£${stats.totalSaved.toFixed(2)}`, icon: TrendingDown, color: '#10B981' },
          { label: 'Waste Reduction', value: `${stats.wasteReduction}%`, icon: BarChart3, color: '#6366F1' },
          { label: 'Avg Discount', value: `${stats.avgDiscount}%`, icon: Percent, color: '#EF4444' },
        ].map((stat, idx) => (
          <div key={idx} className="p-5 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] flex items-center justify-between group hover:border-[var(--color-slate-700)] transition-all">
            <div>
              <p className="text-[9px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-1">{stat.label}</p>
              <h3 className="text-[var(--text-xl)] font-black text-[var(--color-slate-100)]">{stat.value}</h3>
            </div>
            <div className="p-2.5 rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
              <stat.icon size={22} />
            </div>
          </div>
        ))}
      </div>

      {/* Discount Timeline */}
      <div className="p-5 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
        <h3 className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-4">Auto-Pricing Timeline</h3>
        <div className="flex items-center gap-2">
          {TIER_CONFIG.map((tier, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2">
              <div className={`w-full py-3 rounded-xl text-center font-black text-sm border-2 transition-all ${currentTier.discount === tier.discount ? 'scale-105 shadow-lg' : 'opacity-50'}`}
                style={{ borderColor: tier.color, background: tier.bg, color: tier.color }}>
                {tier.discount}% OFF
              </div>
              <span className="text-[9px] font-bold text-[var(--color-slate-500)] uppercase">{tier.label.split('(')[0].trim()}</span>
              {idx < TIER_CONFIG.length - 1 && (
                <ArrowRight size={14} className="text-[var(--color-slate-700)] absolute right-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left: Product Selection */}
        <div className="col-span-7 flex flex-col gap-4 overflow-hidden">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-[var(--color-slate-300)] uppercase tracking-wider">
              Fresh Products ({freshProducts.length})
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[var(--color-slate-500)]">
                {selectedProducts.length} selected
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-2 gap-3 content-start pb-4">
            {freshProducts.map(product => {
              const isSelected = selectedProducts.includes(product.id);
              const existingMd = markdowns.find(m => m.productId === product.id && m.active);
              return (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                  onClick={() => !existingMd && toggleProduct(product.id)}
                  disabled={!!existingMd}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                    existingMd ? 'bg-amber-500/5 border-amber-500/20 opacity-60' :
                    isSelected ? 'bg-indigo-500/10 border-indigo-500/40 shadow-lg shadow-indigo-500/10' : 
                    'bg-[var(--color-surface-overlay)] border-[var(--color-surface-glass-border)] hover:border-[var(--color-slate-600)]'
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
                    <img src={product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--color-slate-200)] truncate">{product.name}</p>
                    <p className="text-xs font-mono text-[var(--color-slate-500)]">
                      £{product.price.toFixed(2)} · Stock: {product.stock}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {existingMd ? (
                      <span className="px-2 py-1 rounded-md text-[9px] font-black bg-amber-500/20 text-amber-400 uppercase">Marked</span>
                    ) : isSelected ? (
                      <CheckCircle2 size={20} className="text-indigo-400" />
                    ) : (
                      <div className="w-5 h-5 rounded-md border-2 border-[var(--color-slate-700)]" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="col-span-5 flex flex-col gap-4">
          {/* Mode Toggle */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
            <h3 className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-4">Pricing Mode</h3>
            <div className="flex p-1 rounded-xl bg-[var(--color-slate-900)] border border-[var(--color-surface-glass-border)]">
              <button onClick={() => setAutoMode(true)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${autoMode ? 'bg-indigo-500 text-white' : 'text-[var(--color-slate-500)]'}`}>
                <Zap size={12} className="inline mr-1" /> Auto (AI)
              </button>
              <button onClick={() => setAutoMode(false)} className={`flex-1 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${!autoMode ? 'bg-indigo-500 text-white' : 'text-[var(--color-slate-500)]'}`}>
                Manual
              </button>
            </div>

            {autoMode ? (
              <div className="mt-4 p-4 rounded-xl border-2 border-dashed" style={{ borderColor: currentTier.color, background: currentTier.bg }}>
                <p className="text-sm font-black" style={{ color: currentTier.color }}>{currentTier.discount}% Discount</p>
                <p className="text-xs text-[var(--color-slate-400)] mt-1">Based on current time tier</p>
              </div>
            ) : (
              <div className="mt-4">
                <input type="range" min={5} max={90} step={5} value={customDiscount} onChange={(e) => setCustomDiscount(+e.target.value)}
                  className="w-full accent-indigo-500" />
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] font-bold text-[var(--color-slate-500)]">5%</span>
                  <span className="text-lg font-black text-indigo-400">{customDiscount}%</span>
                  <span className="text-[10px] font-bold text-[var(--color-slate-500)]">90%</span>
                </div>
              </div>
            )}
          </div>

          {/* Reason Selection */}
          <div className="p-5 rounded-2xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
            <h3 className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-3">Markdown Reason</h3>
            <div className="flex flex-col gap-2">
              {[
                { value: 'expiring-today', label: 'Expiring Today', icon: '🔴' },
                { value: 'expiring-tomorrow', label: 'Expiring Tomorrow', icon: '🟡' },
                { value: 'damaged-packaging', label: 'Damaged Packaging', icon: '📦' },
                { value: 'overstock', label: 'Overstock', icon: '📊' },
                { value: 'seasonal', label: 'End of Season', icon: '🍂' },
              ].map(r => (
                <button key={r.value} onClick={() => setReason(r.value as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-left transition-all ${reason === r.value ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 border' : 'text-[var(--color-slate-400)] hover:text-[var(--color-slate-200)] border border-transparent'}`}>
                  <span>{r.icon}</span> {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Apply Button */}
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={applyMarkdowns}
            disabled={selectedProducts.length === 0}
            className="py-4 rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 disabled:opacity-30 disabled:grayscale transition-all"
            style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#78350F', boxShadow: '0 4px 20px rgba(245,158,11,0.3)' }}
          >
            <Tag size={18} /> Apply Yellow Labels ({selectedProducts.length})
          </motion.button>

          {/* Active Markdowns List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <h3 className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-3">Active Labels</h3>
            <div className="flex flex-col gap-2">
              {activeMarkdowns.map(md => (
                <div key={md.id} className="flex items-center justify-between p-3 rounded-xl bg-amber-500/5 border border-amber-500/15">
                  <div>
                    <p className="text-xs font-bold text-[var(--color-slate-200)]">{md.productName}</p>
                    <p className="text-[10px] font-mono text-[var(--color-slate-500)]">
                      <span className="line-through">£{md.originalPrice.toFixed(2)}</span>
                      <span className="text-amber-400 ml-2 font-black">£{md.reducedPrice.toFixed(2)}</span>
                    </p>
                  </div>
                  <button onClick={() => deleteMarkdown(md.id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all">
                    <XCircle size={14} />
                  </button>
                </div>
              ))}
              {activeMarkdowns.length === 0 && (
                <div className="py-8 text-center text-[var(--color-slate-700)]">
                  <Tag size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-bold uppercase tracking-wider">No active labels</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
