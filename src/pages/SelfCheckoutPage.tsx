import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Search, Minus, Plus, Trash2, CreditCard, Banknote, Smartphone, ArrowLeft, Volume2, HelpCircle, Scan, ChevronRight, CheckCircle2, Tag } from 'lucide-react';
import { usePosStore } from '../store';

export default function SelfCheckoutPage() {
  const { products, cart, addToCart, removeFromCart, updateQuantity, cartSubtotal, cartTax, cartTotal, cartItemCount, clearCart, addTransaction, currentStaff, addToast, openModal, setPage, markdowns } = usePosStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = ['all', 'beverages', 'snacks', 'dairy', 'bakery', 'produce', 'meat', 'household'];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat && p.active && !p.ageRestricted;
  });

  const sub = cartSubtotal();
  const tax = cartTax();
  const total = cartTotal();
  const count = cartItemCount();

  const handlePay = (method: 'card' | 'contactless' | 'cash') => {
    const receiptNumber = `SCO-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
    addTransaction({
      id: `TXN-SCO-${Date.now().toString(36).toUpperCase()}`,
      items: [...cart],
      subtotal: sub, tax,
      discount: 0, total,
      payments: [{ method, amount: total }],
      timestamp: new Date().toISOString(),
      cashier: currentStaff,
      status: 'completed',
      receiptNumber,
      notes: 'Self-Checkout',
    });
    clearCart();
    setPaymentSuccess(true);
    setTimeout(() => { setPaymentSuccess(false); setShowPayment(false); }, 3000);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0a0f 0%, #111118 50%, #0d0d14 100%)' }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-8 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setPage('checkout')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-white/50 text-sm font-bold border border-white/10 hover:text-white hover:border-white/20 transition-all"
        >
          <ArrowLeft size={16} /> Staff Mode
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-indigo-subtle)] text-[var(--color-indigo-light)]">
            <Scan size={18} />
            <span className="text-sm font-black uppercase tracking-wider">Self-Checkout</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <motion.button whileHover={{ scale: 1.1 }} className="p-3 rounded-xl bg-white/5 text-white/40 border border-white/10">
            <Volume2 size={20} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <HelpCircle size={20} />
          </motion.button>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left: Product Selection */}
        <div className="flex-1 flex flex-col p-6 gap-4 overflow-hidden">
          {/* Welcome Banner */}
          <div className="text-center py-3">
            <h1 className="text-3xl font-black text-white tracking-tight">Welcome! Scan or select your items</h1>
            <p className="text-white/40 text-sm font-medium mt-1">Place items on the bagging area after scanning</p>
          </div>

          {/* Search */}
          <div className="relative max-w-3xl mx-auto w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
            <input
              type="text" placeholder="Search for a product..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white text-lg focus:outline-none focus:border-indigo-500/50 placeholder:text-white/20"
            />
          </div>

          {/* Category Chips */}
          <div className="flex gap-2 justify-center flex-wrap">
            {categories.map(cat => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold capitalize transition-all ${selectedCategory === cat ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/5 text-white/50 border border-white/10 hover:text-white'}`}
              >
                {cat === 'all' ? '🛒 All' : cat}
              </motion.button>
            ))}
          </div>

          {/* Product Grid — Large Touch Targets */}
          <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-4 gap-3 content-start pb-4">
            {filteredProducts.map(product => {
              const markdown = markdowns.find(m => m.productId === product.id && m.active);
              return (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(product)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.03] border transition-all cursor-pointer group ${markdown ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/[0.06] hover:border-indigo-500/30 hover:bg-white/[0.06]'}`}
                >
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/20 group-hover:scale-105 transition-transform">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    {markdown && (
                      <div className="absolute inset-0 flex items-center justify-center bg-amber-500/20 backdrop-blur-[1px]">
                        <Tag size={24} className="text-amber-400 opacity-60" />
                      </div>
                    )}
                  </div>
                  <span className="text-white/80 text-sm font-semibold text-center leading-tight line-clamp-2">{product.name}</span>
                  <div className="flex flex-col items-center">
                    {markdown ? (
                      <>
                        <span className="text-[10px] text-white/30 line-through">£{product.price.toFixed(2)}</span>
                        <span className="text-xl font-black text-amber-400 font-mono">£{markdown.reducedPrice.toFixed(2)}</span>
                      </>
                    ) : (
                      <span className="text-xl font-black text-white font-mono">£{product.price.toFixed(2)}</span>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Right: Cart Summary */}
        <div className="flex flex-col" style={{ width: 380, background: 'rgba(255,255,255,0.02)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center gap-2">
              <ShoppingCart size={20} className="text-indigo-400" />
              <span className="text-white font-bold text-lg">Your Basket</span>
              {count > 0 && <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-xs font-bold">{count}</span>}
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs font-bold text-rose-400 uppercase tracking-wider hover:text-rose-300">Clear All</button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {cart.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full text-white/20">
                  <ShoppingCart size={56} strokeWidth={1} />
                  <p className="mt-4 text-lg font-bold">Basket is empty</p>
                  <p className="text-sm mt-1">Scan or tap items to begin</p>
                </motion.div>
              ) : (
                cart.map(item => (
                  <motion.div key={item.product.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 mb-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]"
                  >
                    <img src={item.product.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-semibold truncate">{item.product.name}</p>
                      <div className="flex items-center gap-2">
                        <p className="text-white/40 text-xs font-mono">£{item.product.price.toFixed(2)}</p>
                        {item.discount > 0 && (
                          <span className="text-[10px] font-black text-amber-400 uppercase">Reduced</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white">
                        {item.quantity === 1 ? <Trash2 size={14} className="text-rose-400" /> : <Minus size={14} />}
                      </button>
                      <span className="w-8 text-center text-white font-bold font-mono">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:text-white">
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="flex flex-col items-end min-w-[70px]">
                      <span className="text-white font-bold font-mono">£{(item.product.price * item.quantity - item.discount).toFixed(2)}</span>
                      {item.discount > 0 && (
                        <span className="text-[10px] text-amber-400 font-mono">-£{item.discount.toFixed(2)}</span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>

          {/* Totals */}
          <div className="px-6 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.2)' }}>
            <div className="flex justify-between text-white/40 text-sm font-semibold uppercase mb-1">
              <span>Subtotal</span><span className="font-mono text-white/60">£{sub.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white/40 text-sm font-semibold uppercase mb-3">
              <span>VAT</span><span className="font-mono text-white/60">£{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/60 text-lg font-black uppercase tracking-wider">Total</span>
              <span className="text-4xl font-black text-white font-mono">£{total.toFixed(2)}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => cart.length > 0 && setShowPayment(true)}
              disabled={cart.length === 0}
              className="w-full py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-xl font-black uppercase tracking-wider shadow-lg shadow-indigo-500/30 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3"
            >
              <CreditCard size={24} /> Pay Now <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Payment Overlay */}
      <AnimatePresence>
        {showPayment && !paymentSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="w-[520px] p-10 rounded-3xl bg-[#111118] border border-white/10 shadow-2xl">
              <h2 className="text-3xl font-black text-white text-center mb-2">Choose Payment</h2>
              <p className="text-white/40 text-center text-lg mb-8">Total: <span className="text-white font-black font-mono">£{total.toFixed(2)}</span></p>
              <div className="flex flex-col gap-4">
                {[
                  { icon: CreditCard, label: 'Insert or Tap Card', method: 'card' as const, color: 'from-blue-500 to-blue-600' },
                  { icon: Smartphone, label: 'Contactless / Apple Pay', method: 'contactless' as const, color: 'from-purple-500 to-purple-600' },
                  { icon: Banknote, label: 'Cash (Insert Notes)', method: 'cash' as const, color: 'from-emerald-500 to-emerald-600' },
                ].map(pm => (
                  <motion.button
                    key={pm.method}
                    whileHover={{ scale: 1.02, x: 4 }} whileTap={{ scale: 0.98 }}
                    onClick={() => handlePay(pm.method)}
                    className={`flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-r ${pm.color} text-white text-xl font-bold shadow-lg`}
                  >
                    <pm.icon size={28} /> {pm.label}
                  </motion.button>
                ))}
              </div>
              <button onClick={() => setShowPayment(false)} className="w-full mt-6 py-3 text-white/40 text-sm font-bold uppercase tracking-wider hover:text-white transition-colors">
                ← Back to Basket
              </button>
            </motion.div>
          </motion.div>
        )}

        {paymentSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }} className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <CheckCircle2 size={120} className="text-emerald-400 mx-auto mb-6" strokeWidth={1.5} />
              </motion.div>
              <h2 className="text-4xl font-black text-white mb-2">Payment Successful!</h2>
              <p className="text-white/40 text-xl">Please take your receipt. Thank you!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
