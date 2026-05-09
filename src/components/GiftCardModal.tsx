import { useState } from 'react';
import { usePosStore } from '../store';
import { Gift, Search, Plus, CheckCircle2, CreditCard } from 'lucide-react';
import Modal from './Modal';

export default function GiftCardModal() {
  const { closeModal, giftCards, issueGiftCard, addToast, currentStaff } = usePosStore();
  const [activeTab, setActiveTab] = useState<'lookup' | 'issue'>('lookup');
  const [searchCode, setSearchCode] = useState('');
  const [issueAmount, setIssueAmount] = useState('20');

  const foundCard = giftCards.find(g => g.code === searchCode);

  const handleIssue = () => {
    const amount = parseFloat(issueAmount);
    if (isNaN(amount) || amount <= 0) {
      addToast('Please enter a valid amount', 'error');
      return;
    }

    const newCard = {
      id: `GC-${Date.now()}`,
      code: `GC${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      balance: amount,
      initialValue: amount,
      active: true,
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      issuedAt: new Date().toISOString(),
      issuedBy: currentStaff.name
    };

    issueGiftCard(newCard);
    addToast(`Gift Card ${newCard.code} Issued!`, 'success');
    setSearchCode(newCard.code);
    setActiveTab('lookup');
  };

  return (
    <Modal title="Gift Card Management" width={480}>
      <div className="flex flex-col gap-6">
        <div className="flex p-1 rounded-xl bg-[var(--color-slate-900)] border border-[var(--color-surface-glass-border)]">
          {(['lookup', 'issue'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-[var(--color-amber)] text-white shadow-glow-amber' : 'text-[var(--color-slate-500)] hover:text-[var(--color-slate-300)]'}`}
            >
              {tab === 'lookup' ? 'Balance Check' : 'Issue New Card'}
            </button>
          ))}
        </div>

        {activeTab === 'lookup' ? (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)]" size={18} />
              <input
                autoFocus
                type="text"
                placeholder="Enter card code..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                className="w-full pl-10 pr-4 py-3 rounded-[var(--radius-xl)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--text-md)] font-mono text-[var(--color-amber)] focus:outline-none focus:border-[var(--color-amber)]/50"
              />
            </div>

            {foundCard ? (
              <div className="p-5 rounded-[var(--radius-xl)] bg-gradient-to-br from-[var(--color-slate-800)] to-[var(--color-slate-900)] border border-[var(--color-amber)]/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[9px] font-black text-[var(--color-amber)] uppercase tracking-widest mb-1">Available Balance</p>
                    <h3 className="text-[28px] font-black text-white font-mono">£{foundCard.balance.toFixed(2)}</h3>
                  </div>
                  <div className="p-2 rounded-lg bg-[var(--color-emerald-bg)] text-[var(--color-emerald)]">
                    <CheckCircle2 size={20} />
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-[var(--color-slate-500)] font-bold uppercase tracking-widest">
                  <span>Code: {foundCard.code}</span>
                  <span>Expires: {new Date(foundCard.expiryDate).toLocaleDateString()}</span>
                </div>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center opacity-20">
                <CreditCard size={48} strokeWidth={1} />
                <p className="mt-4 text-[var(--text-xs)] font-bold uppercase tracking-widest">Ready to Scan</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-2">
              {['10', '20', '50', '100'].map(val => (
                <button
                  key={val}
                  onClick={() => setIssueAmount(val)}
                  className={`py-3 rounded-xl font-mono font-black text-[var(--text-sm)] transition-all ${issueAmount === val ? 'bg-[var(--color-amber)] text-white' : 'bg-[var(--color-slate-900)] text-[var(--color-slate-500)] border border-[var(--color-surface-glass-border)]'}`}
                >
                  £{val}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)] font-black text-[var(--text-sm)]">£</span>
              <input
                type="number"
                value={issueAmount}
                onChange={(e) => setIssueAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-3 rounded-xl bg-[var(--color-slate-900)] border border-[var(--color-surface-glass-border)] text-white focus:outline-none"
                placeholder="Custom amount..."
              />
            </div>
            <button
              onClick={handleIssue}
              className="w-full py-4 rounded-[var(--radius-xl)] bg-[var(--color-amber)] text-white text-[var(--text-sm)] font-black uppercase tracking-widest shadow-glow-amber transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Issue Gift Card
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
