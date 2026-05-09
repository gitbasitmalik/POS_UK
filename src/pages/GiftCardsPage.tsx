import { useState } from 'react';
import { usePosStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Search, Plus, CreditCard, ArrowUpRight, ArrowDownLeft, Clock, ShieldCheck, Filter, Download, MoreHorizontal, Trash2 } from 'lucide-react';
import type { GiftCard } from '../types';

export default function GiftCardsPage() {
  const { giftCards, addToast, openModal } = usePosStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'empty'>('all');

  const filteredCards = giftCards.filter(gc => {
    const matchesSearch = gc.code.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === 'active') return matchesSearch && gc.active && gc.balance > 0;
    if (filter === 'empty') return matchesSearch && gc.balance <= 0;
    return matchesSearch;
  });

  const stats = {
    totalValue: giftCards.reduce((s, c) => s + c.balance, 0),
    activeCount: giftCards.filter(c => c.active && c.balance > 0).length,
    issuedToday: giftCards.filter(c => new Date(c.issuedAt).toDateString() === new Date().toDateString()).length
  };

  const exportCSV = () => {
    const headers = ['Code', 'Balance', 'Initial Value', 'Issued At', 'Expiry Date', 'Status'];
    const rows = giftCards.map(c => [
      c.code,
      c.balance.toFixed(2),
      c.initialValue.toFixed(2),
      new Date(c.issuedAt).toISOString(),
      new Date(c.expiryDate).toISOString(),
      c.active ? 'Active' : 'Disabled'
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `gift-cards-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${rows.length} gift cards to CSV`);
  };

  return (
    <div className="flex-1 p-8 h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-amber-bg)] text-[var(--color-amber)] shadow-glow">
            <Gift size={24} />
          </div>
          <div>
            <h1 className="text-[var(--text-2xl)] font-black text-[var(--color-slate-100)] tracking-tight">Gift Card Registry</h1>
            <p className="text-[var(--text-sm)] text-[var(--color-slate-500)] font-medium">Manage corporate rewards and customer gift credit</p>
          </div>
        </div>
        <button 
          onClick={() => openModal('gift-card')}
          className="flex items-center gap-2 px-5 py-3 rounded-[var(--radius-lg)] bg-[var(--color-amber)] text-white text-[var(--text-sm)] font-bold shadow-glow-amber transition-all hover:scale-[1.02]"
        >
          <Plus size={18} /> Issue New Gift Card
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Total Liability', value: `£${stats.totalValue.toFixed(2)}`, icon: CreditCard, color: 'var(--color-amber)' },
          { label: 'Active Cards', value: stats.activeCount, icon: ShieldCheck, color: 'var(--color-emerald)' },
          { label: 'Issued Today', value: stats.issuedToday, icon: ArrowUpRight, color: 'var(--color-indigo)' },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 rounded-[var(--radius-2xl)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] shadow-xl flex items-center justify-between group hover:border-[var(--color-slate-700)] transition-all">
            <div>
              <p className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-1">{stat.label}</p>
              <h3 className="text-[var(--text-2xl)] font-black text-[var(--color-slate-100)]">{stat.value}</h3>
            </div>
            <div className="p-3 rounded-xl transition-transform group-hover:scale-110" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)]" size={16} />
              <input 
                type="text"
                placeholder="Search by card code..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--text-sm)] text-[var(--color-slate-200)] focus:outline-none focus:border-[var(--color-amber)]/50 w-64"
              />
            </div>
            <div className="flex p-1 rounded-lg bg-[var(--color-slate-900)] border border-[var(--color-surface-glass-border)]">
              {(['all', 'active', 'empty'] as const).map(f => (
                <button 
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider transition-all ${filter === f ? 'bg-[var(--color-slate-800)] text-[var(--color-amber)]' : 'text-[var(--color-slate-500)] hover:text-[var(--color-slate-300)]'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-slate-900)] text-[var(--color-slate-400)] text-[var(--text-xs)] font-bold border border-[var(--color-surface-glass-border)] hover:text-white transition-all cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>

        <div className="rounded-[var(--radius-2xl)] border border-[var(--color-surface-glass-border)] bg-[var(--color-surface-overlay)] shadow-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[var(--color-slate-900)]/50">
              <tr className="border-b border-[var(--color-surface-glass-border)]">
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Card Code</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Current Balance</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Issued At</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Expiry</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Gift size={48} />
                      <span className="text-[var(--text-sm)] font-bold uppercase tracking-[3px]">No gift cards found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCards.map((gc) => (
                  <tr key={gc.id} className="border-b border-[var(--color-surface-glass-border)]/30 hover:bg-[var(--color-slate-900)]/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-[var(--text-sm)] text-[var(--color-amber)] font-black tracking-widest">{gc.code}</td>
                    <td className="px-6 py-4 text-[var(--text-lg)] font-black text-[var(--color-slate-100)]">£{gc.balance.toFixed(2)}</td>
                    <td className="px-6 py-4 text-[var(--text-xs)] font-medium text-[var(--color-slate-400)]">{new Date(gc.issuedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-[var(--text-xs)] font-medium text-[var(--color-slate-400)]">{new Date(gc.expiryDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${gc.active ? 'text-[var(--color-emerald)] bg-[var(--color-emerald-bg)]' : 'text-[var(--color-rose)] bg-[var(--color-rose-bg)]'}`}>
                        {gc.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg bg-[var(--color-slate-800)] text-[var(--color-slate-400)] hover:text-white transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                        <button className="p-2 rounded-lg bg-[var(--color-rose-bg)] text-[var(--color-rose)] hover:bg-[var(--color-rose)] hover:text-white transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
