import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tag, Search, Plus, X, Check } from 'lucide-react';
import Modal from './Modal';
import { usePosStore } from '../store';
import type { Product, Promotion, PromoType } from '../types';

export default function PromotionModal() {
  const { products, addPromotion, updatePromotion, closeModal, addToast, modalData } = usePosStore();
  
  const isEdit = !!modalData;
  const [name, setName] = useState(modalData?.name || '');
  const [type, setType] = useState<PromoType>(modalData?.type || 'multi-buy');
  const [requiredQty, setRequiredQty] = useState(modalData?.requiredQty || 3);
  const [promoPrice, setPromoPrice] = useState(modalData?.promoPrice || 5.00);
  const [selectedIds, setSelectedIds] = useState<string[]>(modalData?.productIds || []);
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const toggleProduct = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSubmit = () => {
    if (!name || selectedIds.length === 0) return;

    if (isEdit) {
      updatePromotion(modalData.id, {
        name,
        type,
        productIds: selectedIds,
        requiredQty,
        promoPrice: type === 'multi-buy' ? promoPrice : undefined,
      });
      addToast(`Promotion "${name}" updated`);
    } else {
      const promo: Promotion = {
        id: `PRM-${Date.now()}`,
        name,
        type,
        productIds: selectedIds,
        requiredQty,
        promoPrice: type === 'multi-buy' ? promoPrice : undefined,
        freeQty: type === 'bogo' ? 1 : undefined,
        active: true,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      };
      addPromotion(promo);
      addToast(`Promotion "${name}" activated`, 'success');
    }
    closeModal();
  };

  return (
    <Modal title={isEdit ? "Edit Promotion" : "Configure New Promotion"} width={600}>
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Promotion Name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Any 3 for £5"
                className="w-full px-3 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--text-sm)] text-white focus:outline-none focus:border-[var(--color-indigo)]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Promo Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(['multi-buy', 'bogo'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setType(t)}
                    className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all ${
                      type === t 
                        ? 'bg-[var(--color-indigo)] border-[var(--color-indigo)] text-white' 
                        : 'bg-[var(--color-slate-900)] border-[var(--color-surface-glass-border)] text-[var(--color-slate-500)]'
                    }`}
                  >
                    {t.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Required Qty</label>
                <input 
                  type="number"
                  value={requiredQty}
                  onChange={(e) => setRequiredQty(parseInt(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--text-sm)] text-white"
                />
              </div>
              {type === 'multi-buy' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Promo Price (£)</label>
                  <input 
                    type="number"
                    step="0.10"
                    value={promoPrice}
                    onChange={(e) => setPromoPrice(parseFloat(e.target.value))}
                    className="w-full px-3 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--text-sm)] text-white"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 flex flex-col h-[300px]">
            <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Select Products ({selectedIds.length})</label>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)]" size={14} />
              <input 
                type="text"
                placeholder="Filter products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[11px] text-white focus:outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 pr-1">
              {filteredProducts.map(p => (
                <button
                  key={p.id}
                  onClick={() => toggleProduct(p.id)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-[var(--text-xs)] transition-all ${
                    selectedIds.includes(p.id)
                      ? 'bg-[var(--color-indigo-subtle)] text-[var(--color-indigo-light)] border border-[var(--color-indigo)]/30'
                      : 'bg-[var(--color-slate-900)]/30 text-[var(--color-slate-400)] border border-transparent hover:border-[var(--color-surface-glass-border)]'
                  }`}
                >
                  <span className="truncate w-32 text-left">{p.name}</span>
                  {selectedIds.includes(p.id) ? <Check size={12} /> : <Plus size={12} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-surface-glass-border)]">
          <button onClick={closeModal} className="px-6 py-2.5 rounded-[var(--radius-lg)] text-[var(--text-sm)] font-bold text-[var(--color-slate-400)] hover:text-white transition-colors">Cancel</button>
          <button 
            onClick={handleSubmit}
            disabled={!name || selectedIds.length === 0}
            className="px-8 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-indigo)] text-white text-[var(--text-sm)] font-bold shadow-glow-indigo disabled:opacity-50"
          >
            {isEdit ? "Update Promotion" : "Create Promotion"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
