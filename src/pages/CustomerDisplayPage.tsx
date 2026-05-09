import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Tag, Sparkles, Gift, Percent, Clock } from 'lucide-react';
import { usePosStore } from '../store';

export default function CustomerDisplayPage() {
  const { cart, cartSubtotal, cartTax, cartTotal, cartItemCount, calculateDiscounts, promotions, mealDeals, selectedCustomer } = usePosStore();
  const sub = cartSubtotal();
  const tax = cartTax();
  const total = cartTotal();
  const count = cartItemCount();
  const discount = calculateDiscounts();

  const activePromos = promotions.filter(p => p.active).slice(0, 3);
  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

  const itemVariants = {
    initial: { opacity: 0, x: 60, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -40, scale: 0.95 },
  };

  return (
    <div className="flex-1 flex h-full overflow-hidden" style={{ background: 'linear-gradient(160deg, #06060a 0%, #0f0f18 40%, #0a0a12 100%)' }}>
      {/* Left Panel: Item Feed */}
      <div className="flex-1 flex flex-col min-w-0" style={{ borderRight: '1px solid rgba(255,255,255,0.04)' }}>
        {/* Header Banner */}
        <div className="px-10 py-6" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.04))' }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-white/30 text-sm font-bold uppercase tracking-[4px]">AuraFlow Market</p>
            <h1 className="text-3xl font-black text-white mt-1">{greeting}!</h1>
            {selectedCustomer && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-indigo-400 text-lg font-bold mt-1">
                Welcome back, {selectedCustomer.name} · <span className="text-amber-400">{selectedCustomer.loyaltyPoints} pts</span>
              </motion.p>
            )}
          </motion.div>
        </div>

        {/* Scanned Items */}
        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
          <AnimatePresence mode="popLayout">
            {cart.length === 0 ? (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full text-white/10"
              >
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}>
                  <ShoppingBag size={80} strokeWidth={1} />
                </motion.div>
                <p className="mt-6 text-2xl font-black text-white/15 uppercase tracking-widest">Scan to begin</p>
                <p className="mt-2 text-white/10 text-sm">Items will appear here as they are scanned</p>
              </motion.div>
            ) : (
              cart.map((item, idx) => (
                <motion.div
                  key={item.product.id}
                  variants={itemVariants}
                  initial="initial" animate="animate" exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  layout
                  className="flex items-center gap-5 mb-3 p-4 rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/30 flex-shrink-0 shadow-lg">
                    <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold text-white truncate">{item.product.name}</p>
                    <p className="text-sm text-white/30 font-medium">
                      £{item.product.price.toFixed(2)} × {item.quantity}
                      {item.discount > 0 && <span className="text-emerald-400 ml-2">-£{item.discount.toFixed(2)} saved</span>}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-black text-white font-mono">
                      £{(item.product.price * item.quantity - item.discount).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Promo Banner Carousel */}
        {cart.length === 0 && activePromos.length > 0 && (
          <div className="px-8 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
            <div className="flex gap-3 overflow-x-auto no-scrollbar">
              {activePromos.map((promo, idx) => (
                <motion.div
                  key={promo.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  className="flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl"
                  style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.1), rgba(239,68,68,0.05))', border: '1px solid rgba(245,158,11,0.15)' }}
                >
                  <Sparkles size={20} className="text-amber-400" />
                  <div>
                    <p className="text-sm font-bold text-amber-400">{promo.name}</p>
                    <p className="text-xs text-white/40">Buy {promo.requiredQty} {promo.promoPrice ? `for £${promo.promoPrice.toFixed(2)}` : 'get 1 free'}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Panel: Running Total */}
      <div className="flex flex-col justify-between" style={{ width: 340, background: 'rgba(255,255,255,0.01)' }}>
        {/* Top: Store branding */}
        <div className="px-8 py-6 text-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-3"
            style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', boxShadow: '0 8px 30px rgba(99,102,241,0.3)' }}>
            <Sparkles size={28} className="text-white" />
          </div>
          <h2 className="text-white font-black text-xl tracking-tight">AuraFlow</h2>
          <p className="text-white/20 text-[10px] font-bold uppercase tracking-[3px]">Market</p>
        </div>

        {/* Middle: Running totals */}
        <div className="flex-1 flex flex-col justify-center px-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-sm font-bold uppercase tracking-wider">Items</span>
              <span className="text-white/60 text-lg font-mono font-bold">{count}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-sm font-bold uppercase tracking-wider">Subtotal</span>
              <span className="text-white/60 text-lg font-mono font-bold">£{sub.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex justify-between items-center px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-emerald-400" />
                  <span className="text-emerald-400 text-sm font-bold uppercase">Savings</span>
                </div>
                <span className="text-emerald-400 text-lg font-mono font-black">-£{discount.toFixed(2)}</span>
              </motion.div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-white/30 text-sm font-bold uppercase tracking-wider">VAT</span>
              <span className="text-white/60 text-lg font-mono font-bold">£{tax.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-8 pt-6" style={{ borderTop: '2px solid rgba(255,255,255,0.06)' }}>
            <p className="text-white/20 text-xs font-black uppercase tracking-[3px] text-center mb-2">Total to Pay</p>
            <motion.p 
              key={total}
              initial={{ scale: 1.1 }} animate={{ scale: 1 }}
              className="text-center text-5xl font-black text-white font-mono"
              style={{ textShadow: '0 0 40px rgba(99,102,241,0.3)' }}
            >
              £{total.toFixed(2)}
            </motion.p>
          </div>
        </div>

        {/* Bottom: Loyalty & Time */}
        <div className="px-8 py-6 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          {selectedCustomer && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-indigo-400" />
                <span className="text-xs font-bold text-indigo-400 uppercase">Points Earned</span>
              </div>
              <span className="text-lg font-black text-indigo-300 font-mono">+{Math.floor(total)}</span>
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-white/15">
            <Clock size={14} />
            <span className="text-xs font-mono font-bold">
              {now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
