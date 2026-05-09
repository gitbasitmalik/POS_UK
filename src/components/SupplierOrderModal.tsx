import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Search, Plus, Minus, X, Truck, Check } from 'lucide-react';
import Modal from './Modal';
import { usePosStore } from '../store';
import type { Product, SupplierOrder } from '../types';

export default function SupplierOrderModal() {
  const { products, addSupplierOrder, closeModal, addToast } = usePosStore();
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderItems, setOrderItems] = useState<{ product: Product; qty: number }[]>([]);
  const [search, setSearch] = useState('');

  const suppliers = Array.from(new Set(products.map(p => p.supplier)));
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const addItem = (product: Product) => {
    const existing = orderItems.find(i => i.product.id === product.id);
    if (existing) {
      setOrderItems(orderItems.map(i => i.product.id === product.id ? { ...i, qty: i.qty + 10 } : i));
    } else {
      setOrderItems([...orderItems, { product, qty: 10 }]);
    }
  };

  const removeItem = (id: string) => setOrderItems(orderItems.filter(i => i.product.id !== id));
  
  const updateQty = (id: string, delta: number) => {
    setOrderItems(orderItems.map(i => i.product.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  };

  const totalCost = orderItems.reduce((sum, item) => sum + (item.product.cost * item.qty), 0);

  const handleSubmit = () => {
    if (!selectedSupplier || orderItems.length === 0) return;

    const order: SupplierOrder = {
      id: `PO-${Date.now()}`,
      supplier: selectedSupplier,
      items: orderItems.map(i => ({
        productId: i.product.id,
        productName: i.product.name,
        qty: i.qty,
        cost: i.product.cost
      })),
      status: 'sent',
      totalCost,
      createdAt: new Date().toISOString(),
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    };

    addSupplierOrder(order);
    addToast(`Purchase Order sent to ${selectedSupplier}`, 'success');
    closeModal();
  };

  return (
    <Modal title="Create Purchase Order" width={700}>
      <div className="flex gap-6 h-[500px]">
        {/* Left: Product Selection */}
        <div className="flex-1 flex flex-col gap-4 border-r border-[var(--color-surface-glass-border)] pr-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Select Supplier</label>
            <select 
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--text-sm)] text-[var(--color-slate-200)] focus:outline-none focus:border-[var(--color-indigo)]"
            >
              <option value="">Choose a supplier...</option>
              {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)]" size={16} />
            <input 
              type="text"
              placeholder="Search products to add..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-xl)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--text-sm)] text-[var(--color-slate-200)] focus:outline-none focus:border-[var(--color-indigo)]"
            />
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
            {filteredProducts.map(p => (
              <div 
                key={p.id}
                onClick={() => addItem(p)}
                className="flex items-center justify-between p-3 rounded-[var(--radius-lg)] bg-[var(--color-slate-900)]/30 border border-transparent hover:border-[var(--color-indigo)]/30 hover:bg-[var(--color-indigo-subtle)] transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <img src={p.image} className="w-8 h-8 rounded-md object-cover" />
                  <div>
                    <p className="text-[var(--text-xs)] font-bold text-[var(--color-slate-200)]">{p.name}</p>
                    <p className="text-[10px] text-[var(--color-slate-500)]">Cost: £{p.cost.toFixed(2)} | Stock: {p.stock}</p>
                  </div>
                </div>
                <Plus size={16} className="text-[var(--color-slate-500)] group-hover:text-[var(--color-indigo-light)]" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="w-[280px] flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingBag size={18} className="text-[var(--color-indigo-light)]" />
            <h3 className="text-[var(--text-sm)] font-bold text-[var(--color-slate-100)]">Order Items</h3>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {orderItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-20">
                <Truck size={40} />
                <p className="text-[10px] font-bold uppercase tracking-widest mt-2">Cart is empty</p>
              </div>
            ) : (
              orderItems.map(item => (
                <div key={item.product.id} className="p-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]/50">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[var(--text-xs)] font-bold text-[var(--color-slate-200)] truncate w-32">{item.product.name}</p>
                    <button onClick={() => removeItem(item.product.id)} className="text-[var(--color-slate-600)] hover:text-[var(--color-rose)] transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-[var(--color-slate-900)] rounded-md px-2 py-1">
                      <button onClick={() => updateQty(item.product.id, -10)} className="text-[var(--color-slate-500)] hover:text-white"><Minus size={12} /></button>
                      <span className="text-[var(--text-xs)] font-mono font-bold w-8 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.id, 10)} className="text-[var(--color-slate-500)] hover:text-white"><Plus size={12} /></button>
                    </div>
                    <p className="text-[var(--text-xs)] font-black text-[var(--color-slate-300)]">£{(item.product.cost * item.qty).toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--color-surface-glass-border)]">
            <div className="flex justify-between mb-4">
              <span className="text-[var(--text-sm)] font-bold text-[var(--color-slate-400)]">Estimated Total</span>
              <span className="text-[var(--text-lg)] font-black text-[var(--color-indigo-light)]">£{totalCost.toFixed(2)}</span>
            </div>
            <button 
              onClick={handleSubmit}
              disabled={!selectedSupplier || orderItems.length === 0}
              className="w-full py-3 rounded-[var(--radius-lg)] bg-[var(--color-indigo)] text-white text-[var(--text-sm)] font-bold shadow-glow-indigo disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Check size={18} /> Confirm Order
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
