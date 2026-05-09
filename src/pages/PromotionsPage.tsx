import { useState } from 'react';
import { usePosStore } from '../store';
import { motion } from 'framer-motion';
import { Tag, Plus, Trash2, Edit3, ShoppingCart, Percent, Zap, Utensils, Power, PowerOff, Check } from 'lucide-react';
import Modal from '../components/Modal';
import type { Promotion, MealDeal } from '../types';

export default function PromotionsPage() {
  const { promotions, mealDeals, openModal, closeModal, activeModal, addToast, updatePromotion, updateMealDeal, products } = usePosStore();
  const [editPromo, setEditPromo] = useState<Promotion | null>(null);
  const [editDeal, setEditDeal] = useState<MealDeal | null>(null);

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

  const saveEditPromo = () => {
    if (!editPromo) return;
    updatePromotion(editPromo.id, editPromo);
    addToast(`${editPromo.name} updated`);
    setEditPromo(null);
    closeModal();
  };

  const saveEditDeal = () => {
    if (!editDeal) return;
    updateMealDeal(editDeal.id, editDeal);
    addToast(`${editDeal.name} updated`);
    setEditDeal(null);
    closeModal();
  };

  const togglePromoProduct = (productId: string) => {
    if (!editPromo) return;
    const exists = editPromo.productIds.includes(productId);
    setEditPromo({
      ...editPromo,
      productIds: exists ? editPromo.productIds.filter(id => id !== productId) : [...editPromo.productIds, productId]
    });
  };

  const toggleDealProduct = (productId: string, type: 'mains' | 'sides' | 'drinks') => {
    if (!editDeal) return;
    const list = editDeal[type] || [];
    const exists = list.includes(productId);
    setEditDeal({
      ...editDeal,
      [type]: exists ? list.filter(id => id !== productId) : [...list, productId]
    });
  };

  const inputStyle: React.CSSProperties = { height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none', width: '100%' };
  const labelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' };

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
                    <button onClick={() => { setEditPromo({ ...promo }); openModal('edit-promotion'); }} className="p-2 rounded-lg bg-[var(--color-slate-800)] text-[var(--color-slate-400)] hover:text-[var(--color-indigo-light)] cursor-pointer transition-colors">
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
                    <button onClick={() => { setEditDeal({ ...deal }); openModal('edit-meal-deal'); }} className="p-2 rounded-lg bg-[var(--color-slate-800)] text-[var(--color-slate-400)] hover:text-[var(--color-emerald)] cursor-pointer transition-colors">
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

      {/* Edit Promotion Modal */}
      {activeModal === 'edit-promotion' && editPromo && (
        <Modal title="Edit Promotion" width={600}>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>Name</label>
                <input type="text" value={editPromo.name} onChange={(e) => setEditPromo({ ...editPromo, name: e.target.value })} style={inputStyle} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Type</label>
                  <select value={editPromo.type} onChange={(e) => setEditPromo({ ...editPromo, type: e.target.value as any })} style={inputStyle}>
                    <option value="multi-buy">Multi-Buy</option>
                    <option value="bogo">Buy One Get One</option>
                    <option value="percentage">Percentage Off</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Required Qty</label>
                  <input type="number" value={editPromo.requiredQty} onChange={(e) => setEditPromo({ ...editPromo, requiredQty: +e.target.value })} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>Price (£)</label>
                  <input type="number" step="0.01" value={editPromo.promoPrice || ''} onChange={(e) => setEditPromo({ ...editPromo, promoPrice: +e.target.value })} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
                </div>
                <div className="flex flex-col gap-1">
                  <label style={labelStyle}>End Date</label>
                  <input type="date" value={editPromo.endDate?.slice(0,10)} onChange={(e) => setEditPromo({ ...editPromo, endDate: new Date(e.target.value).toISOString() })} style={inputStyle} />
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label style={labelStyle}>Participating Products ({editPromo.productIds.length})</label>
              <div className="flex-1 overflow-y-auto border border-[var(--color-surface-glass-border)] rounded-lg p-2 bg-[var(--color-surface-overlay)] space-y-1" style={{ maxHeight: '200px' }}>
                {products.map(p => (
                  <button key={p.id} onClick={() => togglePromoProduct(p.id)} className={`w-full flex items-center justify-between p-2 rounded text-[11px] ${editPromo.productIds.includes(p.id) ? 'bg-[var(--color-indigo)] text-white' : 'text-[var(--color-slate-400)] hover:bg-white/5'}`}>
                    <span className="truncate">{p.name}</span>
                    {editPromo.productIds.includes(p.id) && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => { setEditPromo(null); closeModal(); }} style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} onClick={saveEditPromo} style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-indigo)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>Save Changes</motion.button>
          </div>
        </Modal>
      )}

      {/* Edit Meal Deal Modal */}
      {activeModal === 'edit-meal-deal' && editDeal && (
        <Modal title="Edit Meal Deal Bundle" width={600}>
          <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>Name</label>
                <input type="text" value={editDeal.name} onChange={(e) => setEditDeal({ ...editDeal, name: e.target.value })} style={inputStyle} />
              </div>
              <div className="flex flex-col gap-1">
                <label style={labelStyle}>Fixed Price (£)</label>
                <input type="number" step="0.01" value={editDeal.price} onChange={(e) => setEditDeal({ ...editDeal, price: +e.target.value })} style={{ ...inputStyle, fontFamily: 'var(--font-mono)' }} />
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-emerald-bg)]/10 border border-[var(--color-emerald)]/20 text-[11px]">
                <div className="flex justify-between mb-1 text-[var(--color-slate-400)]">Mains: <strong className="text-white">{(editDeal.mains || []).length}</strong></div>
                <div className="flex justify-between mb-1 text-[var(--color-slate-400)]">Sides: <strong className="text-white">{(editDeal.sides || []).length}</strong></div>
                <div className="flex justify-between text-[var(--color-slate-400)]">Drinks: <strong className="text-white">{(editDeal.drinks || []).length}</strong></div>
              </div>
            </div>
            <div className="flex flex-col h-[280px]">
              <div className="flex gap-1 mb-2 p-1 rounded-lg bg-[var(--color-slate-900)]">
                {(['mains', 'sides', 'drinks'] as const).map(t => (
                  <button key={t} onClick={() => (window as any)._activeEditTab = t} className="flex-1 py-1 rounded text-[9px] font-bold uppercase tracking-wider text-[var(--color-slate-500)] hover:text-white">
                    {t}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto border border-[var(--color-surface-glass-border)] rounded-lg p-2 bg-[var(--color-surface-overlay)] space-y-1">
                {products.map(p => {
                  const tab = (window as any)._activeEditTab || 'mains';
                  const isSel = (editDeal[tab] || []).includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggleDealProduct(p.id, tab)} className={`w-full flex items-center justify-between p-2 rounded text-[11px] ${isSel ? 'bg-[var(--color-emerald)] text-white' : 'text-[var(--color-slate-400)] hover:bg-white/5'}`}>
                      <span className="truncate">{p.name}</span>
                      {isSel && <Check size={12} />}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => { setEditDeal(null); closeModal(); }} style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <motion.button whileHover={{ scale: 1.02 }} onClick={saveEditDeal} style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-emerald)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>Save Changes</motion.button>
          </div>
        </Modal>
      )}
    </div>
  );
}
