import { useState } from 'react';
import { usePosStore } from '../store';
import { motion } from 'framer-motion';
import { Truck, Plus, Search, FileText, CheckCircle2, Clock, AlertTriangle, ChevronRight, Package, Mail, Eye, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import type { SupplierOrder } from '../types';

export default function SuppliersPage() {
  const { supplierOrders, products, openModal, activeModal, closeModal, addToast } = usePosStore();
  const [viewOrder, setViewOrder] = useState<SupplierOrder | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-[var(--color-emerald)] bg-[var(--color-emerald-bg)]';
      case 'confirmed': return 'text-[var(--color-indigo-light)] bg-[var(--color-indigo-subtle)]';
      case 'sent': return 'text-[var(--color-amber)] bg-[var(--color-amber-bg)]';
      case 'draft': return 'text-[var(--color-slate-400)] bg-[var(--color-slate-800)]';
      default: return 'text-[var(--color-slate-400)] bg-[var(--color-slate-800)]';
    }
  };

  const lowStockProducts = products.filter(p => p.stock < (p.reorderPoint || 10));
  const draftOrders = supplierOrders.filter(o => o.status === 'draft');
  const filteredOrders = supplierOrders.filter(o => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return o.id.toLowerCase().includes(q) || o.supplier.toLowerCase().includes(q);
    }
    return true;
  });

  const deleteOrder = (id: string) => {
    usePosStore.setState(s => ({ supplierOrders: s.supplierOrders.filter(o => o.id !== id) }));
    addToast('Order deleted', 'error');
  };

  const updateOrderStatus = (id: string, status: SupplierOrder['status']) => {
    usePosStore.setState(s => {
      const order = s.supplierOrders.find(o => o.id === id);
      const newOrders = s.supplierOrders.map(o => o.id === id ? { ...o, status } : o);
      let newProducts = s.products;

      if (status === 'delivered' && order && order.status !== 'delivered') {
        newProducts = s.products.map(p => {
          const item = order.items.find(i => i.productId === p.id);
          if (item) {
            return { ...p, stock: p.stock + item.qty };
          }
          return p;
        });
        addToast(`Stock replenished for ${order.items.length} items`, 'success');
      }

      return { 
        supplierOrders: newOrders,
        products: newProducts
      };
    });
    if (status !== 'delivered') {
      addToast(`Order status updated to ${status}`);
    }
  };

  const autoReorderLowStock = () => {
    if (lowStockProducts.length === 0) { addToast('No low stock items', 'info'); return; }
    const grouped: Record<string, typeof lowStockProducts> = {};
    lowStockProducts.forEach(p => {
      const sup = p.supplier || 'General';
      if (!grouped[sup]) grouped[sup] = [];
      grouped[sup].push(p);
    });

    Object.entries(grouped).forEach(([supplier, prods]) => {
      const order: SupplierOrder = {
        id: `PO-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        supplier,
        items: prods.map(p => ({
          productId: p.id,
          productName: p.name,
          qty: (p.reorderPoint * 2) - p.stock,
          cost: p.cost,
        })),
        status: 'draft',
        totalCost: prods.reduce((s, p) => s + p.cost * ((p.reorderPoint * 2) - p.stock), 0),
        createdAt: new Date().toISOString(),
      };
      usePosStore.setState(s => ({ supplierOrders: [...s.supplierOrders, order] }));
    });
    addToast(`${Object.keys(grouped).length} draft orders created for ${lowStockProducts.length} items`, 'success');
  };

  return (
    <div className="flex-1 p-8 h-full flex flex-col gap-8 overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-indigo-subtle)] text-[var(--color-indigo-light)] shadow-glow">
            <Truck size={24} />
          </div>
          <div>
            <h1 className="text-[var(--text-2xl)] font-black text-[var(--color-slate-100)] tracking-tight">Supplier Orders</h1>
            <p className="text-[var(--text-sm)] text-[var(--color-slate-500)] font-medium">Manage procurement and inventory intake</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            onClick={() => {
              const headers = ['Order Ref', 'Supplier', 'Items', 'Total Cost', 'Status', 'Date'];
              const rows = supplierOrders.map(o => [
                o.id, 
                o.supplier, 
                o.items.length, 
                o.totalCost.toFixed(2), 
                o.status, 
                new Date(o.createdAt).toISOString().slice(0,10)
              ].join(','));
              const csv = [headers.join(','), ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `purchase-orders-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              URL.revokeObjectURL(url);
              addToast(`Exported ${rows.length} purchase orders to CSV`);
            }}
            className="flex items-center gap-2 px-5 py-3 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--color-slate-300)] text-[var(--text-sm)] font-bold hover:border-[var(--color-indigo)]/50 transition-all cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <FileText size={18} /> Export CSV
          </motion.button>
          <button 
            onClick={() => openModal('supplier-order')}
            className="flex items-center gap-2 px-5 py-3 rounded-[var(--radius-lg)] bg-[var(--color-indigo)] text-white text-[var(--text-sm)] font-bold shadow-glow-indigo cursor-pointer"
          >
            <Plus size={18} /> Create Purchase Order
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Stats & Alerts */}
        <div className="col-span-4 space-y-6">
          <div className="p-6 rounded-[var(--radius-2xl)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle size={18} className="text-[var(--color-amber)]" />
              <h2 className="text-[var(--text-md)] font-bold text-[var(--color-slate-100)]">Replenishment Needed</h2>
            </div>
            <div className="space-y-3">
              {lowStockProducts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 size={32} className="mx-auto text-[var(--color-emerald)] opacity-20 mb-2" />
                  <p className="text-[var(--text-xs)] text-[var(--color-slate-500)] font-medium uppercase tracking-widest">All stock levels healthy</p>
                </div>
              ) : (
                lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-[var(--radius-lg)] bg-[var(--color-slate-900)]/50 border border-[var(--color-surface-glass-border)]/50">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt="" className="w-8 h-8 rounded-md object-cover" />
                      <div>
                        <p className="text-[var(--text-xs)] font-bold text-[var(--color-slate-200)] truncate w-32">{p.name}</p>
                        <p className="text-[10px] text-[var(--color-rose)] font-black uppercase tracking-tighter">STOCK: {p.stock} / MIN: {p.reorderPoint || 10}</p>
                      </div>
                    </div>
                    <button onClick={() => openModal('supplier-order')} className="p-1.5 rounded-md hover:bg-[var(--color-indigo-subtle)] text-[var(--color-slate-500)] hover:text-[var(--color-indigo-light)] transition-colors cursor-pointer">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 rounded-[var(--radius-2xl)] bg-gradient-to-br from-[var(--color-indigo-dark)] to-[var(--color-indigo)] text-white shadow-glow-indigo">
            <div className="flex items-center gap-2 mb-4">
              <Mail size={18} />
              <h2 className="text-[var(--text-md)] font-bold">Auto-Reorder</h2>
            </div>
            <p className="text-[var(--text-sm)] opacity-90 mb-4 leading-relaxed">
              {draftOrders.length > 0
                ? `${draftOrders.length} draft orders pending review.`
                : lowStockProducts.length > 0
                  ? `${lowStockProducts.length} items below reorder point.`
                  : 'All stock levels are healthy.'}
            </p>
            <button 
              onClick={() => draftOrders.length > 0 ? openModal('review-drafts') : autoReorderLowStock()}
              className="w-full py-2.5 rounded-[var(--radius-lg)] bg-white/10 hover:bg-white/20 text-white text-[var(--text-sm)] font-bold transition-all border border-white/10 cursor-pointer"
            >
              {draftOrders.length > 0 ? `Review ${draftOrders.length} Drafts` : 'Generate Draft Orders'}
            </button>
          </div>
        </div>

        {/* Right: Order Table */}
        <div className="col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-[var(--color-slate-500)]" />
              <h2 className="text-[var(--text-md)] font-bold text-[var(--color-slate-100)]">Recent Purchase Orders</h2>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)]" size={14} />
              <input 
                type="text" 
                placeholder="Search orders..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 rounded-xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--text-sm)] focus:outline-none focus:border-[var(--color-indigo)]/50 w-64 text-[var(--color-slate-200)]"
              />
            </div>
          </div>

          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-surface-glass-border)] bg-[var(--color-surface-overlay)] shadow-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[var(--color-surface-overlay)]">
                <tr className="border-b border-[var(--color-surface-glass-border)]">
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Order Ref</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Supplier</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Items</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Total</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3 opacity-20">
                        <Package size={48} />
                        <span className="text-[var(--text-sm)] font-bold uppercase tracking-[3px]">No orders yet</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-[var(--color-surface-glass-border)]/30 hover:bg-[var(--color-slate-900)]/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-[11px] text-[var(--color-slate-200)] font-bold">{order.id.slice(0, 12).toUpperCase()}</td>
                      <td className="px-6 py-4 text-[var(--text-sm)] font-bold text-[var(--color-slate-300)]">{order.supplier}</td>
                      <td className="px-6 py-4 text-[var(--text-sm)] font-medium text-[var(--color-slate-400)]">{order.items.length} items</td>
                      <td className="px-6 py-4 text-[var(--text-sm)] font-black text-[var(--color-slate-200)]">£{order.totalCost.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => { setViewOrder(order); openModal('view-order'); }}
                            className="flex items-center gap-1.5 text-[var(--color-indigo-light)] hover:text-[var(--color-indigo)] transition-colors text-[11px] font-bold uppercase tracking-wider cursor-pointer"
                          >
                            <Eye size={14} /> View
                          </button>
                          {order.status === 'draft' && (
                            <button onClick={() => deleteOrder(order.id)} className="p-1 rounded text-[var(--color-rose)]/60 hover:text-[var(--color-rose)] transition-colors cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          )}
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

      {/* View Order Modal */}
      {activeModal === 'view-order' && viewOrder && (
        <Modal title={`Purchase Order — ${viewOrder.id.slice(0,12).toUpperCase()}`} width={560}>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <div><span className="text-[10px] text-[var(--color-slate-500)] uppercase font-bold">Supplier</span><p className="text-sm font-bold text-[var(--color-slate-200)]">{viewOrder.supplier}</p></div>
              <div><span className="text-[10px] text-[var(--color-slate-500)] uppercase font-bold">Status</span><p className={`text-sm font-bold capitalize ${getStatusColor(viewOrder.status).split(' ')[0]}`}>{viewOrder.status}</p></div>
              <div><span className="text-[10px] text-[var(--color-slate-500)] uppercase font-bold">Created</span><p className="text-sm text-[var(--color-slate-300)]">{new Date(viewOrder.createdAt).toLocaleDateString('en-GB')}</p></div>
            </div>
            <div style={{ height: 1, background: 'var(--color-surface-glass-border)' }} />
            <div>
              <span className="text-[10px] text-[var(--color-slate-500)] uppercase font-bold tracking-wider">Line Items</span>
              <div className="mt-2 space-y-2">
                {viewOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-slate-200)]">{item.productName}</p>
                      <p className="text-[10px] text-[var(--color-slate-500)]">Qty: {item.qty} × £{item.cost.toFixed(2)}</p>
                    </div>
                    <span className="text-sm font-bold font-mono text-[var(--color-slate-200)]">£{(item.qty * item.cost).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ height: 1, background: 'var(--color-surface-glass-border)' }} />
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-[var(--color-slate-400)] uppercase">Total Cost</span>
              <span className="text-xl font-black font-mono text-white">£{viewOrder.totalCost.toFixed(2)}</span>
            </div>
            {viewOrder.status === 'draft' && (
              <div className="flex gap-3 mt-2">
                <button onClick={() => { updateOrderStatus(viewOrder.id, 'sent'); setViewOrder({...viewOrder, status: 'sent'}); }} className="flex-1 py-2.5 rounded-lg bg-[var(--color-indigo)] text-white text-sm font-bold cursor-pointer">Send to Supplier</button>
                <button onClick={() => { deleteOrder(viewOrder.id); closeModal(); }} className="px-4 py-2.5 rounded-lg bg-[var(--color-rose-bg)] text-[var(--color-rose)] text-sm font-bold cursor-pointer">Delete</button>
              </div>
            )}
            {viewOrder.status === 'sent' && (
              <button onClick={() => { updateOrderStatus(viewOrder.id, 'confirmed'); setViewOrder({...viewOrder, status: 'confirmed'}); }} className="w-full py-2.5 rounded-lg bg-[var(--color-emerald)] text-white text-sm font-bold cursor-pointer">Mark as Confirmed</button>
            )}
            {viewOrder.status === 'confirmed' && (
              <button onClick={() => { updateOrderStatus(viewOrder.id, 'delivered'); setViewOrder({...viewOrder, status: 'delivered'}); }} className="w-full py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-bold cursor-pointer">Mark as Delivered</button>
            )}
          </div>
        </Modal>
      )}

      {/* Review Drafts Modal */}
      {activeModal === 'review-drafts' && (
        <Modal title="Review Draft Orders" width={600}>
          <div className="flex flex-col gap-4">
            {draftOrders.map(order => (
              <div key={order.id} className="p-4 rounded-xl bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-bold text-[var(--color-slate-200)]">{order.supplier}</p>
                    <p className="text-[10px] text-[var(--color-slate-500)]">{order.items.length} items · £{order.totalCost.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { updateOrderStatus(order.id, 'sent'); addToast(`Order sent to ${order.supplier}`); }} className="px-3 py-1.5 rounded-lg bg-[var(--color-indigo)] text-white text-[10px] font-bold uppercase cursor-pointer">Send</button>
                    <button onClick={() => deleteOrder(order.id)} className="px-3 py-1.5 rounded-lg bg-[var(--color-rose-bg)] text-[var(--color-rose)] text-[10px] font-bold uppercase cursor-pointer">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            <button onClick={() => { draftOrders.forEach(o => updateOrderStatus(o.id, 'sent')); addToast(`All ${draftOrders.length} drafts sent to suppliers`, 'success'); closeModal(); }} className="w-full py-3 rounded-xl bg-[var(--color-indigo)] text-white text-sm font-bold cursor-pointer">
              Send All {draftOrders.length} Drafts
            </button>
          </div>
        </Modal>
      )}

      {/* Create Order Modal */}
      {activeModal === 'supplier-order' && (
        <Modal title="Create Purchase Order" width={500}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Supplier Name</label>
              <input type="text" id="sup-name" placeholder="Enter supplier name..." className="w-full h-11 px-4 rounded-xl bg-[var(--color-slate-900)] border border-[var(--color-surface-glass-border)] text-white outline-none focus:border-[var(--color-indigo)]" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Add Product</label>
              <div className="max-h-60 overflow-y-auto space-y-2 p-2 border border-[var(--color-surface-glass-border)] rounded-xl bg-[var(--color-slate-900)]">
                {products.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={p.image} className="w-8 h-8 rounded object-cover" />
                      <span className="text-xs font-medium text-[var(--color-slate-200)]">{p.name}</span>
                    </div>
                    <button 
                      onClick={() => {
                        const qty = parseInt(prompt(`Enter quantity for ${p.name}:`, '10') || '0');
                        if (qty > 0) {
                          const order: SupplierOrder = {
                            id: `PO-${Date.now()}`,
                            supplier: (document.getElementById('sup-name') as HTMLInputElement)?.value || 'General',
                            items: [{ productId: p.id, productName: p.name, qty, cost: p.cost }],
                            status: 'draft',
                            totalCost: p.cost * qty,
                            createdAt: new Date().toISOString()
                          };
                          usePosStore.setState(s => ({ supplierOrders: [...s.supplierOrders, order] }));
                          addToast(`Added ${p.name} to new order`, 'success');
                          closeModal();
                        }
                      }}
                      className="p-1.5 rounded-lg bg-[var(--color-indigo-subtle)] text-[var(--color-indigo-light)] cursor-pointer"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
