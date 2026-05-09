import { usePosStore } from '../store';
import { Heart, Trophy, UserPlus, Gift, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CheckoutAddons() {
  const { 
    selectedCustomer, 
    cartTotal, 
    donationAmount, 
    setDonationAmount, 
    openModal,
    isTrainingMode,
    giftCards,
    redeemGiftCard,
    addToast,
    appliedGiftCard,
    setAppliedGiftCard
  } = usePosStore();

  const [cardCode, setCardCode] = useState('');

  const handleApplyCard = () => {
    const card = giftCards.find(g => g.code === cardCode.toUpperCase() && g.active);
    if (!card) {
      addToast('Invalid or inactive gift card', 'error');
      return;
    }
    if (card.balance <= 0) {
      addToast('This card has no remaining balance', 'error');
      return;
    }
    
    setAppliedGiftCard(card);
    addToast(`Gift Card Applied: £${card.balance.toFixed(2)}`, 'success');
  };

  const total = cartTotal();
  const roundUp = Math.ceil(total) - total;
  const isRoundUpActive = donationAmount > 0;

  return (
    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-[var(--color-surface-glass-border)]">
      {/* Loyalty / Customer Section */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={16} className={selectedCustomer ? "text-[var(--color-indigo)]" : "text-[var(--color-slate-500)]"} />
          <span className="text-[var(--text-xs)] font-semibold text-[var(--color-slate-300)] uppercase tracking-wider">
            Loyalty & Rewards
          </span>
        </div>
        {selectedCustomer ? (
          <div className="flex flex-col items-end">
            <span className="text-[var(--text-xs)] font-bold text-[var(--color-slate-100)]">{selectedCustomer.name}</span>
            <span className="text-[10px] text-[var(--color-emerald)] font-mono">{selectedCustomer.loyaltyPoints} PTS</span>
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal('customer-lookup')}
            className="flex items-center gap-1.5 px-2 py-1 rounded-[var(--radius-sm)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--color-slate-400)] text-[10px] font-bold uppercase"
          >
            <UserPlus size={12} /> Add Customer
          </motion.button>
        )}
      </div>

      {/* Gift Card Redemption Section */}
      <div className="flex flex-col gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
        <div className="flex items-center gap-2 mb-1">
          <Gift size={14} className="text-[var(--color-amber)]" />
          <span className="text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-wider">Gift Card / Voucher</span>
        </div>
        
        {appliedGiftCard ? (
          <div className="flex items-center justify-between bg-[var(--color-amber-bg)]/10 p-2 rounded-lg border border-[var(--color-amber)]/20">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-[var(--color-emerald)]" />
              <span className="text-[var(--text-xs)] font-mono font-bold text-[var(--color-amber)]">{appliedGiftCard.code}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-xs)] font-black text-white">£{appliedGiftCard.balance.toFixed(2)}</span>
              <button 
                onClick={() => { setAppliedGiftCard(null); setCardCode(''); }}
                className="text-[10px] font-bold text-[var(--color-rose)] uppercase hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Code (e.g. GC123456)"
              value={cardCode}
              onChange={(e) => setCardCode(e.target.value.toUpperCase())}
              className="flex-1 bg-[var(--color-slate-900)] border border-[var(--color-surface-glass-border)] rounded-lg px-3 py-2 text-[var(--text-xs)] font-mono text-[var(--color-amber)] focus:outline-none focus:border-[var(--color-amber)]/50 placeholder:text-[var(--color-slate-700)] uppercase"
            />
            <button 
              onClick={handleApplyCard}
              disabled={!cardCode}
              className="p-2 rounded-lg bg-[var(--color-amber)] text-white hover:bg-[var(--color-amber-dark)] disabled:opacity-30 disabled:grayscale transition-all"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Donation / Round Up */}
      <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)]">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-[var(--radius-sm)] ${isRoundUpActive ? 'bg-[var(--color-rose-bg)] text-[var(--color-rose)]' : 'bg-[var(--color-slate-800)] text-[var(--color-slate-500)]'}`}>
            <Heart size={16} fill={isRoundUpActive ? "currentColor" : "none"} />
          </div>
          <div>
            <div className="text-[var(--text-xs)] font-bold text-[var(--color-slate-100)]">Charity Round Up</div>
            <div className="text-[10px] text-[var(--color-slate-400)]">Support local hospitals</div>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setDonationAmount(isRoundUpActive ? 0 : roundUp)}
          className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-[10px] font-bold uppercase tracking-tight transition-colors ${
            isRoundUpActive 
              ? 'bg-[var(--color-rose)] text-white shadow-[var(--shadow-glow-rose)]' 
              : 'bg-[var(--color-slate-700)] text-[var(--color-slate-300)]'
          }`}
        >
          {isRoundUpActive ? `£${donationAmount.toFixed(2)} Added` : `Round up £${roundUp.toFixed(2)}`}
        </motion.button>
      </div>

      {/* Training Mode Warning */}
      {isTrainingMode && (
        <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--color-amber-bg)] border border-[var(--color-amber)]/20 text-center">
          <span className="text-[10px] font-bold text-[var(--color-amber)] uppercase tracking-widest">
            ⚠️ Training Mode Active — No Sales Recorded
          </span>
        </div>
      )}
    </div>
  );
}
