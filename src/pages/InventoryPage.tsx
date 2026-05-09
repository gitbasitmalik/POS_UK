import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, Trash2, Plus, Minus, TrendingDown, Download, Search } from 'lucide-react';
import { usePosStore } from '../store';
import Modal from '../components/Modal';
import type { AdjustmentReason } from '../types';

export default function InventoryPage() {
  const { 
    products = [], 
    stockAdjustments = [], 
    wasteLog = [], 
    addStockAdjustment, 
    addWasteLog, 
    updateProduct, 
    deleteProduct, 
    addProduct,
    activeModal, 
    openModal, 
    closeModal, 
    addToast, 
    currentStaff 
  } = usePosStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [adjForm, setAdjForm] = useState<any>(null);
  const [wasteForm, setWasteForm] = useState<any>(null);

  const lowStock = products.filter((p) => p && p.active && p.stock <= (p.reorderPoint || 10));
  const filtered = products.filter((p) => 
    p && p.active && (searchQuery ? (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())) : true)
  );

  const handleAdj = () => {
    if (!adjForm || !currentStaff) return;
    addStockAdjustment({ 
      id: `sa-${Date.now()}`, 
      productId: adjForm.productId, 
      productName: adjForm.productName, 
      previousStock: adjForm.prev, 
      newStock: adjForm.prev + adjForm.change, 
      change: adjForm.change, 
      reason: adjForm.reason, 
      notes: adjForm.notes, 
      adjustedBy: currentStaff.name, 
      timestamp: new Date().toISOString() 
    });
    addToast(`Stock adjusted: ${adjForm.productName}`);
    closeModal(); 
    setAdjForm(null);
  };

  const handleWaste = () => {
    if (!wasteForm || !currentStaff) return;
    const p = products.find((x) => x.id === wasteForm.productId);
    addWasteLog({ 
      id: `w-${Date.now()}`, 
      productId: wasteForm.productId, 
      productName: wasteForm.productName, 
      quantity: wasteForm.quantity, 
      reason: wasteForm.reason, 
      cost: (p?.cost || 0) * wasteForm.quantity, 
      loggedBy: currentStaff.name, 
      timestamp: new Date().toISOString(), 
      notes: wasteForm.notes 
    });
    addToast(`Waste logged: ${wasteForm.quantity}x ${wasteForm.productName}`, 'info');
    closeModal(); 
    setWasteForm(null);
  };

  const openAdj = (p: any) => { 
    setAdjForm({ productId: p.id, productName: p.name, prev: p.stock, change: 0, reason: 'delivery' as AdjustmentReason, notes: '' }); 
    openModal('stock-adj'); 
  };
  
  const openWaste = (p: any) => { 
    setWasteForm({ productId: p.id, productName: p.name, quantity: 1, reason: 'damaged', notes: '' }); 
    openModal('waste-log'); 
  };

  const totalWasteCost = wasteLog.reduce((s, w) => s + (w.cost || 0), 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-slate-100)', margin: 0 }}>Inventory</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', marginTop: 4 }}>{lowStock.length} items below reorder point</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button 
            className="flex items-center gap-2 cursor-pointer" 
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)' }} 
            whileHover={{ borderColor: 'rgba(99,102,241,0.3)' }} 
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              const headers = ['Name', 'SKU', 'Current Stock', 'Reorder Point', 'Status'];
              const rows = products.filter(p => p.active).map(p => {
                const status = p.stock <= 5 ? 'Critical' : p.stock <= p.reorderPoint ? 'Low' : 'OK';
                return [p.name, p.sku, p.stock, p.reorderPoint, status].join(',');
              });
              const csv = [headers.join(','), ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `inventory-report-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              URL.revokeObjectURL(url);
              addToast(`Exported ${rows.length} products to inventory report`);
            }}
          >
            <Download size={14} /> Export CSV
          </motion.button>
          
          <input 
            type="file" 
            id="csv-import" 
            accept=".csv" 
            style={{ display: 'none' }} 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const text = ev.target?.result as string;
                const rows = text.split('\n').filter(r => r.trim());
                if (rows.length < 2) return;
                const [header, ...dataRows] = rows;
                let added = 0;
                let updated = 0;
                dataRows.forEach(row => {
                  const parts = row.split(',');
                  if (parts.length >= 2) {
                    const [sku, name, category, price, cost, stock, supplier] = parts;
                    const existing = products.find(p => p.sku === sku);
                    if (existing) {
                      updateProduct(existing.id, { 
                        name: name || existing.name, 
                        price: price ? +price : existing.price, 
                        stock: stock ? +stock : existing.stock 
                      });
                      updated++;
                    } else {
                      addProduct({
                        id: `prod-${Date.now()}-${Math.random().toString(36).slice(2,5)}`,
                        sku: sku || `SKU-${Date.now()}`,
                        name: name || 'New Product',
                        category: category || 'General',
                        price: price ? +price : 1.00,
                        cost: cost ? +cost : 0.50,
                        stock: stock ? +stock : 0,
                        supplier: supplier || 'General',
                        barcode: sku || '',
                        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=200',
                        active: true, vatRate: 'standard', ageRestricted: false, reorderPoint: 10, unit: 'each',
                        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
                      });
                      added++;
                    }
                  }
                });
                addToast(`Import complete: ${added} added, ${updated} updated`, 'success');
              };
              reader.readAsText(file);
            }} 
          />
          <motion.button 
            whileHover={{ scale: 1.02 }}
            onClick={() => document.getElementById('csv-import')?.click()}
            style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-indigo)', background: 'var(--color-indigo-subtle)', color: 'var(--color-indigo-light)', fontSize: 'var(--text-sm)', fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={14} style={{ display: 'inline', marginRight: 6 }} /> Import CSV
          </motion.button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          { label: 'Total Products', value: products.filter((p)=>p.active).length, icon: Package, color: 'var(--color-indigo)' },
          { label: 'Low Stock', value: lowStock.length, icon: AlertTriangle, color: 'var(--color-amber)' },
          { label: 'Critical Stock', value: products.filter((p)=>p.stock<=5&&p.active).length, icon: AlertTriangle, color: 'var(--color-rose)' },
          { label: 'Waste Cost', value: `£${totalWasteCost.toFixed(2)}`, icon: TrendingDown, color: 'var(--color-rose)' },
        ].map((k, i) => (
          <div key={i} className="flex items-center gap-3" style={{ padding: 16, borderRadius: 'var(--radius-xl)', background: 'var(--color-surface-raised)', border: '1px solid var(--color-surface-glass-border)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: `${k.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><k.icon size={18} style={{ color: k.color }} /></div>
            <div><div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-400)', fontWeight: 500 }}>{k.label}</div><div style={{ fontSize: 'var(--text-lg)', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--color-slate-100)' }}>{k.value}</div></div>
          </div>
        ))}
      </div>

      <div className="relative mb-4" style={{ maxWidth: 600 }}>
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-slate-500)' }} />
        <input type="text" placeholder="Search inventory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', height: 38, paddingLeft: 34, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none', fontFamily: 'var(--font-sans)' }} />
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-raised)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
            {['', 'Product', 'SKU', 'Current Stock', 'Reorder Pt', 'Status', 'Actions'].map((h) => (
              <th key={h} style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.6px', padding: '10px 12px', textAlign: 'left' }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((p) => {
              const status = p.stock <= 5 ? 'critical' : p.stock <= p.reorderPoint ? 'low' : 'ok';
              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
                  <td style={{ padding: '8px 12px' }}><img src={p.image} alt="" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} /></td>
                  <td style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)' }}>{p.name}</td>
                  <td style={{ padding: '8px 12px', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-400)' }}>{p.sku}</td>
                  <td style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: status === 'critical' ? 'var(--color-rose)' : status === 'low' ? 'var(--color-amber)' : 'var(--color-emerald)' }}>{p.stock}</td>
                  <td style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-400)' }}>{p.reorderPoint}</td>
                  <td style={{ padding: '8px 12px' }}>
                    <span style={{ padding: '2px 10px', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 700, background: status === 'critical' ? 'var(--color-rose-bg)' : status === 'low' ? 'var(--color-amber-bg)' : 'var(--color-emerald-bg)', color: status === 'critical' ? 'var(--color-rose)' : status === 'low' ? 'var(--color-amber)' : 'var(--color-emerald)', border: `1px solid ${status === 'critical' ? 'rgba(244,63,94,0.2)' : status === 'low' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)'}` }}>
                      {status === 'critical' ? 'Critical' : status === 'low' ? 'Low' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 12px' }}>
                    <div className="flex gap-1">
                      <motion.button className="cursor-pointer flex items-center justify-center" title="Adjust Stock" style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)' }}
                        whileHover={{ color: 'var(--color-indigo-light)', borderColor: 'rgba(99,102,241,0.3)' }} whileTap={{ scale: 0.9 }} onClick={() => openAdj(p)}><Plus size={14} /></motion.button>
                      <motion.button className="cursor-pointer flex items-center justify-center" title="Log Waste" style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)' }}
                        whileHover={{ color: 'var(--color-rose)', borderColor: 'rgba(244,63,94,0.3)' }} whileTap={{ scale: 0.9 }} onClick={() => openWaste(p)}><Trash2 size={14} /></motion.button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Stock Adjustment Modal */}
      {activeModal === 'stock-adj' && adjForm && (
        <Modal title={`Adjust Stock — ${adjForm.productName}`} width={420}>
          <div className="flex flex-col gap-4">
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-300)' }}>Current stock: <strong style={{ fontFamily: 'var(--font-mono)' }}>{adjForm.prev}</strong></div>
            <div className="flex flex-col gap-1"><label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Quantity Change</label>
              <input type="number" value={adjForm.change} onChange={(e) => setAdjForm({ ...adjForm, change: parseInt(e.target.value) || 0 })}
                style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Use negative for removal. New stock: {adjForm.prev + adjForm.change}</span>
            </div>
            <div className="flex flex-col gap-1"><label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Reason</label>
              <select value={adjForm.reason} onChange={(e) => setAdjForm({ ...adjForm, reason: e.target.value })}
                style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none' }}>
                <option value="delivery">Delivery</option><option value="count">Stock Count</option><option value="damage">Damage</option><option value="theft">Theft</option><option value="expired">Expired</option><option value="return">Return</option><option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1"><label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Notes</label>
              <input type="text" value={adjForm.notes} onChange={(e) => setAdjForm({ ...adjForm, notes: e.target.value })}
                style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none' }} />
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <motion.button className="cursor-pointer" style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600 }} onClick={closeModal}>Cancel</motion.button>
              <motion.button className="cursor-pointer" style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-indigo)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600 }} whileHover={{ scale: 1.02 }} onClick={handleAdj}>Apply</motion.button>
            </div>
          </div>
        </Modal>
      )}

      {/* Waste Log Modal */}
      {activeModal === 'waste-log' && wasteForm && (
        <Modal title={`Log Waste — ${wasteForm.productName}`} width={420}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1"><label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Quantity</label>
              <input type="number" min="1" value={wasteForm.quantity} onChange={(e) => setWasteForm({ ...wasteForm, quantity: parseInt(e.target.value) || 1 })}
                style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
            </div>
            <div className="flex flex-col gap-1"><label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Reason</label>
              <select value={wasteForm.reason} onChange={(e) => setWasteForm({ ...wasteForm, reason: e.target.value })}
                style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none' }}>
                <option value="damaged">Damaged</option><option value="expired">Expired</option><option value="spillage">Spillage</option><option value="recalled">Recalled</option><option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-1"><label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' }}>Notes</label>
              <input type="text" value={wasteForm.notes} onChange={(e) => setWasteForm({ ...wasteForm, notes: e.target.value })}
                style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', outline: 'none' }} />
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <motion.button className="cursor-pointer" style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600 }} onClick={closeModal}>Cancel</motion.button>
              <motion.button className="cursor-pointer" style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-rose)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600 }} whileHover={{ scale: 1.02 }} onClick={handleWaste}>Log Waste</motion.button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
