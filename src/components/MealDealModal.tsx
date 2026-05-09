import { useState } from 'react';
import { Utensils, Search, Plus, Check, X } from 'lucide-react';
import Modal from './Modal';
import { usePosStore } from '../store';
import type { MealDeal, Product } from '../types';

export default function MealDealModal() {
  const { products, addMealDeal, closeModal, addToast } = usePosStore();
  const [name, setName] = useState('');
  const [price, setPrice] = useState(3.50);
  
  const [mains, setMains] = useState<string[]>([]);
  const [sides, setSides] = useState<string[]>([]);
  const [drinks, setDrinks] = useState<string[]>([]);
  
  const [activeTab, setActiveTab] = useState<'mains' | 'sides' | 'drinks'>('mains');
  const [search, setSearch] = useState('');

  const filtered = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string, list: string[], set: (l: string[]) => void) => {
    set(list.includes(id) ? list.filter(i => i !== id) : [...list, id]);
  };

  const handleSubmit = () => {
    if (!name || !mains.length || !sides.length || !drinks.length) return;

    const deal: MealDeal = {
      id: `MD-${Date.now()}`,
      name,
      price,
      mains,
      sides,
      drinks,
      active: true
    };

    addMealDeal(deal);
    addToast(`Meal Deal "${name}" created`, 'success');
    closeModal();
  };

  return (
    <Modal title="Create Meal Deal Bundle" width={640}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Bundle Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard Lunch Deal" className="w-full px-3 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-white text-[var(--text-sm)] focus:outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Bundle Price (£)</label>
              <input type="number" step="0.10" value={price} onChange={(e) => setPrice(parseFloat(e.target.value))} className="w-full px-3 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-white text-[var(--text-sm)] focus:outline-none" />
            </div>

            <div className="p-4 rounded-[var(--radius-xl)] bg-[var(--color-emerald-bg)]/10 border border-[var(--color-emerald)]/20">
              <h4 className="text-[10px] font-black text-[var(--color-emerald)] uppercase tracking-widest mb-2">Selection Summary</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-[var(--color-slate-400)]">Mains:</span>
                  <span className={mains.length ? 'text-[var(--color-emerald)]' : 'text-[var(--color-rose)]'}>{mains.length} selected</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-[var(--color-slate-400)]">Sides:</span>
                  <span className={sides.length ? 'text-[var(--color-emerald)]' : 'text-[var(--color-rose)]'}>{sides.length} selected</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-[var(--color-slate-400)]">Drinks:</span>
                  <span className={drinks.length ? 'text-[var(--color-emerald)]' : 'text-[var(--color-rose)]'}>{drinks.length} selected</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-[350px]">
            <div className="flex gap-1 mb-4 p-1 rounded-xl bg-[var(--color-slate-900)]">
              {(['mains', 'sides', 'drinks'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[var(--color-emerald)] text-white' : 'text-[var(--color-slate-500)] hover:text-[var(--color-slate-300)]'}`}>
                  {tab}
                </button>
              ))}
            </div>

            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)]" size={14} />
              <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[11px] text-white focus:outline-none" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
              {filtered.map(p => {
                const isSel = (activeTab === 'mains' ? mains : activeTab === 'sides' ? sides : drinks).includes(p.id);
                return (
                  <button key={p.id} onClick={() => toggle(p.id, activeTab === 'mains' ? mains : activeTab === 'sides' ? sides : drinks, activeTab === 'mains' ? setMains : activeTab === 'sides' ? setSides : setDrinks)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-[11px] transition-all ${isSel ? 'bg-[var(--color-emerald-bg)] text-[var(--color-emerald)] border border-[var(--color-emerald)]/30' : 'bg-[var(--color-slate-900)]/30 text-[var(--color-slate-400)] border border-transparent'}`}>
                    <span className="truncate w-32 text-left">{p.name}</span>
                    {isSel ? <Check size={12} /> : <Plus size={12} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-surface-glass-border)]">
          <button onClick={closeModal} className="px-6 py-2.5 rounded-[var(--radius-lg)] text-[var(--text-sm)] font-bold text-[var(--color-slate-400)]">Cancel</button>
          <button onClick={handleSubmit} disabled={!name || !mains.length || !sides.length || !drinks.length} className="px-8 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-emerald)] text-white text-[var(--text-sm)] font-bold shadow-glow-emerald disabled:opacity-50">
            Activate Bundle
          </button>
        </div>
      </div>
    </Modal>
  );
}
