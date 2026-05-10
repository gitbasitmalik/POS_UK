import { usePosStore } from '../store';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2, Edit3, Percent, Zap, Utensils, Power, PowerOff } from 'lucide-react';
import type { Promotion, MealDeal } from '../types';

export default function PromotionsPage() {
  const { promotions, mealDeals, openModal, addToast, updatePromotion, updateMealDeal } = usePosStore();

  const deletePromo = (id: string) => {
    usePosStore.setState(s => ({ promotions: s.promotions.filter(p => p.id !== id) }));
    addToast('Promotion deleted', 'error');
  };

  const deleteMealDeal = (id: string) => {
    usePosStore.setState(s => ({ mealDeals: s.mealDeals.filter(m => m.id !== id) }));
    addToast('Meal deal deleted', 'error');
  };

  const togglePromoActive = (promo: Promotion) => {
    updatePromotion(promo.id, { active: !promo.active });
    addToast(`${promo.name} ${promo.active ? 'deactivated' : 'activated'}`);
  };

  const toggleDealActive = (deal: MealDeal) => {
    usePosStore.setState(s => ({
      mealDeals: s.mealDeals.map(m => m.id === deal.id ? { ...m, active: !m.active } : m)
    }));
    addToast(`${deal.name} ${deal.active ? 'deactivated' : 'activated'}`);
  };

  return (
    <div className="flex-1 p-8 h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar">
      {/* ... header and stats ... */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[var(--text-2xl)] font-black text-[var(--color-slate-100)] tracking-tight">Promotions & Bundles</h1>
          <p className="text-[var(--text-sm)] text-[var(--color-slate-500)] font-medium">Configure multi-buy, BOGO, and meal deal offers</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => openModal('promotion')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-indigo)] text-white text-[var(--text-sm)] font-bold shadow-glow-indigo cursor-pointer"
          >
            <Plus size={18} /> New Promotion
          </button>
          <button 
            onClick={() => openModal('meal-deal')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-emerald)] text-white text-[var(--text-sm)] font-bold shadow-glow-emerald cursor-pointer"
          >
            <Utensils size={18} /> New Meal Deal
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { label: 'Active Promotions', value: promotions.filter(p => p.active).length, icon: Tag, color: 'var(--color-indigo)' },
          { label: 'Active Meal Deals', value: mealDeals.filter(m => m.active).length, icon: Utensils, color: 'var(--color-emerald)' },
          { label: 'Total Offers', value: promotions.length + mealDeals.length, icon: Zap, color: 'var(--color-amber)' },
        ].map((stat, idx) => (
          <div key={idx} className="p-6 rounded-[var(--radius-2xl)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] shadow-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px] mb-1">{stat.label}</p>
              <h3 className="text-[var(--text-2xl)] font-black text-[var(--color-slate-100)]">{stat.value}</h3>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-8">
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Tag size={20} className="text-[var(--color-indigo-light)]" />
            <h2 className="text-[var(--text-lg)] font-bold text-[var(--color-slate-100)]">Active Multi-buy Offers</h2>
          </div>
          <div className="space-y-4">
            {promotions.length === 0 ? (
              <div className="p-12 rounded-[var(--radius-2xl)] border-2 border-dashed border-[var(--color-surface-glass-border)] flex flex-col items-center justify-center text-[var(--color-slate-600)]">
                <Percent size={40} className="mb-3 opacity-20" />
                <p className="text-[var(--text-sm)] font-medium">No active promotions</p>
              </div>
            ) : (
              promotions.map((promo) => (
                <div key={promo.id} className={`p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] flex items-center justify-between group hover:border-[var(--color-indigo)]/50 transition-all ${!promo.active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-[var(--color-indigo-subtle)] text-[var(--color-indigo-light)]">
                      <Tag size={20} />
                    </div>
                    <div>
                      <h4 className="text-[var(--text-sm)] font-bold text-[var(--color-slate-100)]">{promo.name}</h4>
                      <p className="text-[11px] text-[var(--color-slate-500)]">
                        {promo.type === 'multi-buy' ? `${promo.requiredQty} for £${promo.promoPrice?.toFixed(2)}` :
                         promo.type === 'bogo' ? 'Buy one get one free' :
                         promo.type === 'percentage' ? `${promo.discountPercent}% off` :
                         `${promo.requiredQty} required`}
                        {' · '}{promo.active ? '🟢 Active' : '⚪ Inactive'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => togglePromoActive(promo)} className={`p-2 rounded-lg ${promo.active ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'} transition-colors cursor-pointer`} title={promo.active ? 'Deactivate' : 'Activate'}>
                      {promo.active ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
                    <button onClick={() => openModal('promotion', promo)} className="p-2 rounded-lg bg-[var(--color-slate-800)] text-[var(--color-slate-400)] hover:text-[var(--color-indigo-light)] cursor-pointer transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => deletePromo(promo.id)} className="p-2 rounded-lg bg-[var(--color-rose-bg)] text-[var(--color-rose)] hover:bg-[var(--color-rose)] hover:text-white transition-colors cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-2 mb-4">
            <Utensils size={20} className="text-[var(--color-emerald)]" />
            <h2 className="text-[var(--text-lg)] font-bold text-[var(--color-slate-100)]">Meal Deal Bundles</h2>
          </div>
          <div className="space-y-4">
            {mealDeals.length === 0 ? (
              <div className="p-12 rounded-[var(--radius-2xl)] border-2 border-dashed border-[var(--color-surface-glass-border)] flex flex-col items-center justify-center text-[var(--color-slate-600)]">
                <Utensils size={40} className="mb-3 opacity-20" />
                <p className="text-[var(--text-sm)] font-medium">No active meal deals</p>
              </div>
            ) : (
              mealDeals.map((deal) => (
                <div key={deal.id} className={`p-4 rounded-[var(--radius-xl)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] flex items-center justify-between group hover:border-[var(--color-emerald)]/50 transition-all ${!deal.active ? 'opacity-50' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-[var(--color-emerald-bg)] text-[var(--color-emerald)]">
                      <Utensils size={20} />
                    </div>
                    <div>
                      <h4 className="text-[var(--text-sm)] font-bold text-[var(--color-slate-100)]">{deal.name}</h4>
                      <p className="text-[11px] text-[var(--color-slate-500)]">
                        Fixed Price: £{deal.price.toFixed(2)} · { (deal.mains?.length || 0) + (deal.sides?.length || 0) + (deal.drinks?.length || 0) } items included
                        {' · '}{deal.active ? '🟢 Active' : '⚪ Inactive'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => toggleDealActive(deal)} className={`p-2 rounded-lg ${deal.active ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white'} transition-colors cursor-pointer`} title={deal.active ? 'Deactivate' : 'Activate'}>
                      {deal.active ? <PowerOff size={16} /> : <Power size={16} />}
                    </button>
                    <button onClick={() => openModal('meal-deal', deal)} className="p-2 rounded-lg bg-[var(--color-slate-800)] text-[var(--color-slate-400)] hover:text-[var(--color-emerald)] cursor-pointer transition-colors">
                      <Edit3 size={16} />
                    </button>
                    <button onClick={() => deleteMealDeal(deal.id)} className="p-2 rounded-lg bg-[var(--color-rose-bg)] text-[var(--color-rose)] hover:bg-[var(--color-rose)] hover:text-white transition-colors cursor-pointer"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
