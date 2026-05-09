import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Package } from 'lucide-react';
import { usePosStore } from '../store';

function ProductCard({ product, index }: { product: any; index: number }) {
  const addToCart = usePosStore((s) => s.addToCart);
  const lastPulseId = usePosStore((s) => s.lastPulseId);
  const markdowns = usePosStore((s) => s.markdowns);
  
  const isPulsing = lastPulseId === product.id;
  const markdown = markdowns.find(m => m.productId === product.id && m.active);

  return (
    <motion.button
      className={`relative flex flex-col cursor-pointer group ${isPulsing ? 'animate-cart-pulse' : ''}`}
      style={{
        padding: 0, borderRadius: 'var(--radius-xl)',
        border: markdown ? '1px solid rgba(245,158,11,0.4)' : '1px solid var(--color-surface-glass-border)',
        background: markdown ? 'linear-gradient(135deg, var(--color-surface-raised), rgba(245,158,11,0.05))' : 'var(--color-surface-raised)',
        boxShadow: markdown ? '0 4px 12px rgba(245,158,11,0.1)' : 'var(--shadow-neu-flat)', overflow: 'hidden',
        textAlign: 'left', fontFamily: 'var(--font-sans)',
        transition: 'box-shadow 200ms ease, border-color 200ms ease',
      }}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25, delay: index * 0.03 }}
      whileHover={{ 
        boxShadow: markdown ? '0 8px 24px rgba(245,158,11,0.2)' : 'var(--shadow-neu-raised)', 
        borderColor: markdown ? 'rgba(245,158,11,0.6)' : 'rgba(99,102,241,0.2)' 
      }}
      whileTap={{ scale: 0.97 }}
      onClick={() => addToCart(product)}
      aria-label={`Add ${product.name} to cart`}
      id={`product-${product.id}`}
    >
      <div className="relative w-full overflow-hidden" style={{ height: '120px', background: `linear-gradient(135deg, ${product.color || '#333'}22, ${product.color || '#333'}08)` }}>
        <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', transition: 'opacity 200ms ease' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: markdown ? '#F59E0B' : 'var(--color-indigo)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: markdown ? '0 0 15px rgba(245,158,11,0.4)' : 'var(--shadow-glow-indigo)' }}>
            <Plus size={20} strokeWidth={2.5} />
          </div>
        </div>
        
        {markdown && (
          <div className="absolute top-2 left-2" style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#F59E0B', color: '#78350F', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
            Yellow Label
          </div>
        )}

        {product.stock <= 10 && (
          <div className="absolute top-2 right-2" style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', background: product.stock <= 5 ? 'var(--color-rose-bg)' : 'var(--color-amber-bg)', color: product.stock <= 5 ? 'var(--color-rose)' : 'var(--color-amber)', fontSize: 10, fontWeight: 700, border: `1px solid ${product.stock <= 5 ? 'rgba(244,63,94,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
            {product.stock} left
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-3">
        <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-200)', lineHeight: 1.3 }}>{product.name}</span>
        <span style={{ fontSize: 10, color: 'var(--color-slate-500)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{product.sku}</span>
        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col">
            {markdown ? (
              <>
                <span style={{ fontSize: 10, color: 'var(--color-slate-500)', textDecoration: 'line-through', marginBottom: -2 }}>£{product.price.toFixed(2)}</span>
                <span style={{ fontSize: 'var(--text-md)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#F59E0B' }}>£{markdown.reducedPrice.toFixed(2)}</span>
              </>
            ) : (
              <span style={{ fontSize: 'var(--text-md)', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--color-slate-100)' }}>£{product.price.toFixed(2)}</span>
            )}
          </div>
          <div className="flex items-center gap-1" style={{ fontSize: 10, color: 'var(--color-slate-500)' }}>
            <Package size={10} />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{product.stock}</span>
          </div>
        </div>
      </div>
    </motion.button>
  );
}

export default function ProductGrid() {
  const { selectedCategory, searchQuery, products } = usePosStore();
  const filteredProducts = useMemo(() => {
    let f = products.filter((p) => p.active);
    if (selectedCategory !== 'all') f = f.filter((p) => p.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      f = f.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q));
    }
    return f;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4" style={{ scrollbarWidth: 'thin' }}>
      <div className="flex items-center justify-between mb-4" style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-500)' }}>
        <span>Showing <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-slate-300)' }}>{filteredProducts.length}</span> products</span>
      </div>
      <motion.div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(168px, 1fr))' }} layout>
        <AnimatePresence mode="popLayout">
          {filteredProducts.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}
        </AnimatePresence>
      </motion.div>
      {filteredProducts.length === 0 && (
        <motion.div className="flex flex-col items-center justify-center" style={{ height: 300, color: 'var(--color-slate-500)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Package size={48} strokeWidth={1} style={{ marginBottom: 12, opacity: 0.4 }} />
          <span style={{ fontSize: 'var(--text-md)', fontWeight: 500 }}>No products found</span>
          <span style={{ fontSize: 'var(--text-sm)', marginTop: 4 }}>Try a different search or category</span>
        </motion.div>
      )}
    </div>
  );
}
