import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ChevronUp, ChevronDown, Filter, Download, Upload, Tag } from 'lucide-react';
import { usePosStore } from '../store';
import Modal from '../components/Modal';
import BulkImportModal from '../components/BulkImportModal';

type SortKey = 'name' | 'price' | 'stock' | 'category';

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct, activeModal, openModal, closeModal, modalData, addToast } = usePosStore();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortAsc, setSortAsc] = useState(true);
  const [filterCat, setFilterCat] = useState('all');

  const filtered = useMemo(() => {
    let f = products.filter((p) => p.active);
    if (filterCat !== 'all') f = f.filter((p) => p.category === filterCat);
    if (search) { const q = search.toLowerCase(); f = f.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q)); }
    f.sort((a, b) => { const m = sortAsc ? 1 : -1; if (sortKey === 'name') return a.name.localeCompare(b.name) * m; if (sortKey === 'price') return (a.price - b.price) * m; if (sortKey === 'stock') return (a.stock - b.stock) * m; return a.category.localeCompare(b.category) * m; });
    return f;
  }, [products, search, sortKey, sortAsc, filterCat]);

  const toggleSort = (key: SortKey) => { if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(true); } };
  const SortIcon = ({ k }: { k: SortKey }) => sortKey === k ? (sortAsc ? <ChevronUp size={12} /> : <ChevronDown size={12} />) : null;
  const cats = ['all', ...new Set(products.map((p) => p.category))];

  const [form, setForm] = useState<any>(null);

  const handleSave = () => {
    if (!form) return;
    if (form.id) {
      updateProduct(form.id, form);
      addToast(`${form.name} updated`);
    } else {
      const newId = `p-${Date.now()}`;
      addProduct({ ...form, id: newId, active: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
      addToast(`${form.name} added`);
    }
    closeModal();
    setForm(null);
  };

  const handleDelete = (p: any) => {
    deleteProduct(p.id);
    addToast(`${p.name} deleted`, 'error');
  };

  const openEdit = (p: any) => { setForm({ ...p }); openModal('product-form'); };
  const openAdd = () => {
    setForm({ name: '', price: 0, cost: 0, category: 'beverages', image: '', sku: '', stock: 0, barcode: '', vatRate: 'standard', ageRestricted: false, reorderPoint: 10, supplier: '', unit: 'each' });
    openModal('product-form');
  };

  const thStyle = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase' as const, letterSpacing: '0.6px', padding: '10px 12px', textAlign: 'left' as const, cursor: 'pointer', userSelect: 'none' as const };

  return (
    <div className="flex-1 flex flex-col overflow-hidden p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--color-slate-100)', margin: 0 }}>Products</h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-400)', marginTop: 4 }}>{products.length} total products</p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)' }} whileHover={{ borderColor: 'rgba(99,102,241,0.3)' }} whileTap={{ scale: 0.97 }}
            onClick={() => {
              const headers = ['Name','SKU','Barcode','Category','Price','Cost','Stock','VAT Rate','Supplier','Unit'];
              const rows = products.filter(p => p.active).map(p => [p.name,p.sku,p.barcode,p.category,p.price,p.cost,p.stock,p.vatRate,p.supplier,p.unit].join(','));
              const csv = [headers.join(','), ...rows].join('\n');
              const blob = new Blob([csv], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a'); a.href = url; a.download = `products-export-${new Date().toISOString().slice(0,10)}.csv`; a.click();
              URL.revokeObjectURL(url);
              addToast(`Exported ${rows.length} products to CSV`);
            }}
          >
            <Download size={14} /> Export
          </motion.button>
          <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)' }} whileHover={{ borderColor: 'rgba(16,185,129,0.3)' }} whileTap={{ scale: 0.97 }} onClick={() => openModal('bulk-import')}>
            <Upload size={14} /> CSV Import
          </motion.button>
          <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: 'none', background: 'linear-gradient(135deg, var(--color-indigo), var(--color-indigo-dark))', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)', boxShadow: 'var(--shadow-glow-indigo)' }}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={openAdd} id="add-product">
            <Plus size={14} /> Add Product
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1" style={{ maxWidth: 360 }}>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-slate-500)' }} />
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', height: 38, paddingLeft: 34, paddingRight: 12, borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
        </div>
        <div className="flex items-center gap-1" style={{ padding: 2, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
          {cats.map((c) => (
            <button key={c} className="cursor-pointer" onClick={() => setFilterCat(c)} style={{ padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: 'none', background: filterCat === c ? 'var(--color-indigo)' : 'transparent', color: filterCat === c ? 'white' : 'var(--color-slate-400)', fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'var(--font-sans)', textTransform: 'capitalize' }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto" style={{ borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-raised)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
              <th style={{ ...thStyle, width: 50 }}></th>
              <th style={thStyle} onClick={() => toggleSort('name')}>Product <SortIcon k="name" /></th>
              <th style={thStyle}>SKU</th>
              <th style={thStyle} onClick={() => toggleSort('category')}>Category <SortIcon k="category" /></th>
              <th style={thStyle} onClick={() => toggleSort('price')}>Price <SortIcon k="price" /></th>
              <th style={thStyle}>Cost</th>
              <th style={thStyle} onClick={() => toggleSort('stock')}>Stock <SortIcon k="stock" /></th>
              <th style={thStyle}>VAT</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <motion.tr key={p.id} style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                whileHover={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <td style={{ padding: '8px 12px' }}>
                  <img src={p.image} alt="" style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                </td>
                <td style={{ padding: '8px 12px' }}>
                  <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)' }}>{p.name}</div>
                  {p.ageRestricted && <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-rose)', background: 'var(--color-rose-bg)', padding: '1px 6px', borderRadius: 'var(--radius-full)', marginTop: 2, display: 'inline-block' }}>18+</span>}
                </td>
                <td style={{ padding: '8px 12px', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-400)' }}>{p.sku}</td>
                <td style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', color: 'var(--color-slate-300)', textTransform: 'capitalize' }}>{p.category}</td>
                <td style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--color-slate-100)' }}>£{p.price.toFixed(2)}</td>
                <td style={{ padding: '8px 12px', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-400)' }}>£{p.cost.toFixed(2)}</td>
                <td style={{ padding: '8px 12px' }}>
                  <span style={{ fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', fontWeight: 600, color: p.stock <= p.reorderPoint ? (p.stock <= 5 ? 'var(--color-rose)' : 'var(--color-amber)') : 'var(--color-emerald)' }}>{p.stock}</span>
                </td>
                <td style={{ padding: '8px 12px', fontSize: 'var(--text-xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-slate-400)' }}>{p.vatRate === 'standard' ? '20%' : p.vatRate === 'reduced' ? '5%' : '0%'}</td>
                <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                  <div className="flex items-center gap-1 justify-end">
                    <motion.button 
                      className="cursor-pointer flex items-center justify-center group/md" 
                      style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-amber)' }}
                      whileHover={{ backgroundColor: 'var(--color-amber-bg)', borderColor: 'rgba(245,158,11,0.3)' }} 
                      whileTap={{ scale: 0.9 }} 
                      onClick={() => {
                        const newPrice = p.price * 0.75;
                        updateProduct(p.id, { price: newPrice });
                        addToast(`${p.name} marked down to £${newPrice.toFixed(2)}`, 'success');
                      }} 
                      title="Yellow Sticker (-25%)"
                    >
                      <Tag size={14} className="group-hover/md:scale-110 transition-transform" />
                    </motion.button>
                    <motion.button className="cursor-pointer flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)' }}
                      whileHover={{ color: 'var(--color-indigo-light)', borderColor: 'rgba(99,102,241,0.3)' }} whileTap={{ scale: 0.9 }} onClick={() => openEdit(p)} aria-label="Edit"><Edit2 size={14} /></motion.button>
                    <motion.button className="cursor-pointer flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)' }}
                      whileHover={{ color: 'var(--color-rose)', borderColor: 'rgba(244,63,94,0.3)' }} whileTap={{ scale: 0.9 }} onClick={() => handleDelete(p)} aria-label="Delete"><Trash2 size={14} /></motion.button>
                  </div>
                </td>

              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Product Form Modal */}
      {activeModal === 'product-form' && form && (
        <Modal title={form.id ? 'Edit Product' : 'Add Product'} width={560}>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Product Name', key: 'name', type: 'text' },
              { label: 'SKU', key: 'sku', type: 'text' },
              { label: 'Barcode', key: 'barcode', type: 'text' },
              { label: 'Image URL', key: 'image', type: 'text' },
              { label: 'Supplier', key: 'supplier', type: 'text' },
            ].map((f) => (
              <div key={f.key} className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</label>
                <input type={f.type} value={form[f.key] || ''} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none' }} />
              </div>
            ))}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price (£)</label>
                <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                  style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cost (£)</label>
                <input type="number" step="0.01" value={form.cost} onChange={(e) => setForm({ ...form, cost: parseFloat(e.target.value) || 0 })}
                  style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock</label>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                  style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-mono)', outline: 'none' }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none' }}>
                  {['beverages','snacks','dairy','bakery','produce','meat','household'].map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>VAT Rate</label>
                <select value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: e.target.value })}
                  style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none' }}>
                  <option value="standard">Standard (20%)</option><option value="reduced">Reduced (5%)</option><option value="zero">Zero (0%)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-slate-400)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit</label>
                <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  style={{ height: 38, padding: '0 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', color: 'var(--color-slate-200)', fontSize: 'var(--text-sm)', fontFamily: 'var(--font-sans)', outline: 'none' }}>
                  <option value="each">Each</option><option value="kg">Per Kg</option><option value="litre">Per Litre</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-300)' }}>
                <input type="checkbox" checked={form.ageRestricted} onChange={(e) => setForm({ ...form, ageRestricted: e.target.checked })} />
                Age Restricted (18+)
              </label>
            </div>
            <div className="flex justify-end gap-3 mt-2">
              <motion.button className="cursor-pointer" style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
                whileTap={{ scale: 0.97 }} onClick={closeModal}>Cancel</motion.button>
              <motion.button className="cursor-pointer" style={{ padding: '8px 24px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--color-indigo)', color: 'white', fontSize: 'var(--text-sm)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={handleSave}>{form.id ? 'Save Changes' : 'Add Product'}</motion.button>
            </div>
          </div>
        </Modal>
      )}

      {/* Bulk Import Modal */}
      {activeModal === 'bulk-import' && <BulkImportModal />}
    </div>
  );
}
