import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { 
  Product, CartItem, Customer, Transaction, Staff, Alert, StockAdjustment, 
  WasteLog, HeldTransaction, NavPage, CheckoutCategory, PaymentMethod, 
  PaymentSplit, Promotion, MealDeal, Markdown, GiftCard, AuditEntry, 
  SupplierOrder, SupportedLanguage, AuditAction
} from './types';
import { 
  products as initialProducts, transactions as initialTxns, 
  customers as initialCustomers, staffMembers, alerts as initialAlerts, 
  stockAdjustments as initialAdj, wasteLog as initialWaste, VAT_RATES 
} from './data';

interface PosStore {
  /* Navigation */
  currentPage: NavPage;
  setPage: (page: NavPage) => void;

  /* Products CRUD */
  products: Product[];
  addProduct: (p: Product) => void;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  /* Cart */
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  setItemDiscount: (productId: string, discount: number) => void;
  clearCart: () => void;
  lastPulseId: string | null;

  /* Promotions & Meal Deals */
  promotions: Promotion[];
  addPromotion: (p: Promotion) => void;
  updatePromotion: (id: string, data: Partial<Promotion>) => void;
  mealDeals: MealDeal[];
  addMealDeal: (m: MealDeal) => void;
  updateMealDeal: (id: string, data: Partial<MealDeal>) => void;
  
  /* Markdowns */
  markdowns: Markdown[];
  addMarkdown: (m: Markdown) => void;
  deleteMarkdown: (id: string) => void;

  /* Held transactions */
  heldTransactions: HeldTransaction[];
  holdTransaction: (label: string) => void;
  recallTransaction: (id: string) => void;
  deleteHeldTransaction: (id: string) => void;

  /* Transactions */
  transactions: Transaction[];
  addTransaction: (t: Transaction) => void;
  refundTransaction: (id: string, items?: string[]) => void;
  voidTransaction: (id: string) => void;

  /* Customers CRUD */
  customers: Customer[];
  addCustomer: (c: Customer) => void;
  updateCustomer: (id: string, data: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (c: Customer | null) => void;
  appliedGiftCard: GiftCard | null;
  setAppliedGiftCard: (gc: GiftCard | null) => void;

  /* Staff */
  staff: Staff[];
  currentStaff: Staff;
  switchStaff: (pin: string) => Staff | null;
  addStaff: (s: Staff) => void;
  updateStaff: (id: string, data: Partial<Staff>) => void;
  deleteStaff: (id: string) => void;

  /* Inventory */
  stockAdjustments: StockAdjustment[];
  addStockAdjustment: (adj: StockAdjustment) => void;
  wasteLog: WasteLog[];
  addWasteLog: (w: WasteLog) => void;
  supplierOrders: SupplierOrder[];
  addSupplierOrder: (o: SupplierOrder) => void;

  /* Audit Trail */
  auditTrail: AuditEntry[];
  addAuditEntry: (action: AuditAction, description: string, metadata?: any) => void;

  /* Gift Cards */
  giftCards: GiftCard[];
  issueGiftCard: (gc: GiftCard) => void;
  redeemGiftCard: (code: string, amount: number) => boolean;

  /* Training Mode */
  isTrainingMode: boolean;
  toggleTrainingMode: () => void;

  /* Donations */
  donationAmount: number;
  setDonationAmount: (amount: number) => void;

  /* Language */
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;

  /* Alerts */
  alerts: Alert[];
  markAlertRead: (id: string) => void;
  addAlert: (a: Alert) => void;

  /* Checkout UI */
  selectedCategory: CheckoutCategory;
  setSelectedCategory: (c: CheckoutCategory) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isOffline: boolean;
  setOffline: (v: boolean) => void;

  /* Barcode scanner */
  barcodeBuffer: string;
  setBarcodeBuffer: (v: string) => void;
  scanBarcode: (barcode: string) => Product | null;

  /* Modals */
  activeModal: string | null;
  modalData: any;
  openModal: (name: string, data?: any) => void;
  closeModal: () => void;

  /* Toast */
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  /* Computed */
  cartSubtotal: () => number;
  cartTax: () => number;
  cartTotal: () => number;
  cartItemCount: () => number;
  calculateDiscounts: () => number;
  completeSale: (payments: PaymentSplit[]) => void;
}

export const usePosStore = create<PosStore>()(
  persist(
    (set, get) => ({
      /* Navigation */
      currentPage: 'dashboard',
      setPage: (page) => set({ currentPage: page }),

      /* Products */
      products: initialProducts,
      addProduct: (p) => {
        set((s) => ({ products: [...s.products, p] }));
        get().addAuditEntry('product-add', `Added product ${p.name}`, { productId: p.id });
      },
      updateProduct: (id, data) => set((s) => ({ products: s.products.map((p) => p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p) })),
      deleteProduct: (id) => set((s) => ({ products: s.products.filter((p) => p.id !== id) })),

      /* Cart */
      cart: [],
      lastPulseId: null,
      addToCart: (product) => {
        const { cart, markdowns } = get();
        const existing = cart.find((i) => i.product.id === product.id);
        
        // Check for active markdown
        const markdown = markdowns.find(m => m.productId === product.id && m.active);
        const unitDiscount = markdown ? (markdown.originalPrice - markdown.reducedPrice) : 0;

        if (existing) {
          const newQty = existing.quantity + 1;
          set({ 
            cart: cart.map((i) => i.product.id === product.id ? { 
              ...i, 
              quantity: newQty, 
              discount: unitDiscount * newQty,
              markdownId: markdown?.id
            } : i), 
            lastPulseId: product.id 
          });
        } else {
          set({ 
            cart: [...cart, { 
              product, 
              quantity: 1, 
              discount: unitDiscount,
              markdownId: markdown?.id 
            }], 
            lastPulseId: product.id 
          });
        }
        setTimeout(() => set({ lastPulseId: null }), 300);
      },
      removeFromCart: (id) => set((s) => ({ cart: s.cart.filter((i) => i.product.id !== id) })),
      updateQuantity: (id, qty) => set((s) => {
        if (qty <= 0) return { cart: s.cart.filter((i) => i.product.id !== id) };
        
        return {
          cart: s.cart.map((i) => {
            if (i.product.id === id) {
              let newDiscount = i.discount;
              if (i.markdownId) {
                const markdown = s.markdowns.find(m => m.id === i.markdownId);
                if (markdown) {
                  newDiscount = (markdown.originalPrice - markdown.reducedPrice) * qty;
                }
              }
              return { ...i, quantity: qty, discount: newDiscount };
            }
            return i;
          })
        };
      }),
      setItemDiscount: (id, discount) => set((s) => ({ 
        cart: s.cart.map((i) => i.product.id === id ? { ...i, discount, markdownId: undefined } : i) 
      })),
      clearCart: () => set({ cart: [], selectedCustomer: null, donationAmount: 0 }),

      /* Promotions & Meal Deals */
      promotions: [],
      addPromotion: (p) => set((s) => ({ promotions: [...s.promotions, p] })),
      updatePromotion: (id, data) => set((s) => ({ promotions: s.promotions.map((p) => p.id === id ? { ...p, ...data } : p) })),
      mealDeals: [],
      addMealDeal: (m) => set((s) => ({ mealDeals: [...s.mealDeals, m] })),
      updateMealDeal: (id, data) => set((s) => ({ 
        mealDeals: s.mealDeals.map((m) => m.id === id ? { ...m, ...data } : m) 
      })),

      /* Markdowns */
      markdowns: [],
      addMarkdown: (m) => {
        set((s) => ({ markdowns: [...s.markdowns, m] }));
        get().addAuditEntry('markdown', `Markdown applied to ${m.productName}`, { productId: m.productId, reducedPrice: m.reducedPrice });
      },
      deleteMarkdown: (id) => set((s) => ({ markdowns: s.markdowns.filter((m) => m.id !== id) })),

      /* Held */
      heldTransactions: [],
      holdTransaction: (label) => {
        const { cart, selectedCustomer, currentStaff } = get();
        if (cart.length === 0) return;
        const held: HeldTransaction = { id: `HOLD-${Date.now()}`, items: [...cart], customer: selectedCustomer || undefined, heldAt: new Date().toISOString(), heldBy: currentStaff.name, label };
        set((s) => ({ heldTransactions: [...s.heldTransactions, held], cart: [], selectedCustomer: null }));
        get().addAuditEntry('void', `Held transaction: ${label}`);
      },
      recallTransaction: (id) => {
        const held = get().heldTransactions.find((h) => h.id === id);
        if (!held) return;
        set((s) => ({ cart: held.items, selectedCustomer: held.customer || null, heldTransactions: s.heldTransactions.filter((h) => h.id !== id) }));
      },
      deleteHeldTransaction: (id) => set((s) => ({ heldTransactions: s.heldTransactions.filter((h) => h.id !== id) })),

      /* Transactions */
      transactions: initialTxns,
      addTransaction: (t) => {
        if (!get().isTrainingMode) {
          set((s) => ({ transactions: [t, ...s.transactions] }));
          get().addAuditEntry('sale', `Sale completed: ${t.receiptNumber}`, { total: t.total });
          
          // Update customer loyalty if selected
          if (t.customer) {
            const pointsEarned = Math.floor(t.total);
            get().updateCustomer(t.customer.id, {
              loyaltyPoints: t.customer.loyaltyPoints + pointsEarned,
              totalSpend: t.customer.totalSpend + t.total,
              visitCount: t.customer.visitCount + 1,
              lastVisit: new Date().toISOString(),
            });
          }
        } else {
          get().addToast('Transaction ignored in Training Mode', 'info');
        }
      },
      refundTransaction: (id) => {
        set((s) => ({ transactions: s.transactions.map((t) => t.id === id ? { ...t, status: 'refunded' as const } : t) }));
        get().addAuditEntry('refund', `Refunded transaction ${id}`);
      },
      voidTransaction: (id) => {
        set((s) => ({ transactions: s.transactions.map((t) => t.id === id ? { ...t, status: 'voided' as const } : t) }));
        get().addAuditEntry('void', `Voided transaction ${id}`);
      },

      /* Customers */
      customers: initialCustomers,
      addCustomer: (c) => set((s) => ({ customers: [...s.customers, c] })),
      updateCustomer: (id, data) => set((s) => ({ customers: s.customers.map((c) => c.id === id ? { ...c, ...data } : c) })),
      deleteCustomer: (id) => set((s) => ({ customers: s.customers.filter((c) => c.id !== id) })),
      selectedCustomer: null,
      setSelectedCustomer: (c) => set({ selectedCustomer: c }),
      
      /* Applied Gift Card */
      appliedGiftCard: null,
      setAppliedGiftCard: (gc) => set({ appliedGiftCard: gc }),

      /* Staff */
      staff: staffMembers,
      currentStaff: staffMembers[0],
      switchStaff: (pin) => {
        const found = get().staff.find((s) => s.pin === pin && s.active);
        if (found) { 
          set({ currentStaff: found }); 
          get().addAuditEntry('login', `Staff logged in: ${found.name}`);
          return found; 
        }
        return null;
      },
      addStaff: (s) => set((st) => ({ staff: [...st.staff, s] })),
      updateStaff: (id, data) => set((s) => ({ staff: s.staff.map((st) => st.id === id ? { ...st, ...data } : st) })),
      deleteStaff: (id) => set((s) => ({ staff: s.staff.filter((st) => st.id !== id) })),

      /* Inventory */
      stockAdjustments: initialAdj,
      addStockAdjustment: (adj) => {
        set((s) => ({
          stockAdjustments: [adj, ...s.stockAdjustments],
          products: s.products.map((p) => p.id === adj.productId ? { ...p, stock: adj.newStock } : p),
        }));
        get().addAuditEntry('stock-adjust', `Stock adjusted for ${adj.productName}`, adj);
      },
      wasteLog: initialWaste,
      addWasteLog: (w) => {
        set((s) => ({
          wasteLog: [w, ...s.wasteLog],
          products: s.products.map((p) => p.id === w.productId ? { ...p, stock: Math.max(0, p.stock - w.quantity) } : p),
        }));
        get().addAuditEntry('stock-adjust', `Waste logged for ${w.productName}`, w);
      },
      supplierOrders: [],
      addSupplierOrder: (o) => set((s) => ({ supplierOrders: [o, ...s.supplierOrders] })),

      /* Audit Trail */
      auditTrail: [],
      addAuditEntry: (action, description, metadata) => {
        const { currentStaff } = get();
        const entry: AuditEntry = {
          id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          action,
          description,
          staffId: currentStaff.id,
          staffName: currentStaff.name,
          timestamp: new Date().toISOString(),
          metadata,
        };
        set((s) => ({ auditTrail: [entry, ...s.auditTrail].slice(0, 1000) })); // Keep last 1000
      },

      /* Gift Cards */
      giftCards: [],
      issueGiftCard: (gc) => {
        set((s) => ({ giftCards: [...s.giftCards, gc] }));
        get().addAuditEntry('gift-card-issue', `Issued gift card ${gc.code}`, { value: gc.initialValue });
      },
      redeemGiftCard: (code, amount) => {
        const { giftCards } = get();
        const gc = giftCards.find((g) => g.code === code && g.active);
        if (!gc || gc.balance < amount) return false;
        set((s) => ({
          giftCards: s.giftCards.map((g) => g.code === code ? { ...g, balance: g.balance - amount, lastUsed: new Date().toISOString() } : g)
        }));
        get().addAuditEntry('gift-card-redeem', `Redeemed ${amount} from gift card ${code}`);
        return true;
      },

      /* Training Mode */
      isTrainingMode: false,
      toggleTrainingMode: () => {
        const next = !get().isTrainingMode;
        set({ isTrainingMode: next });
        get().addToast(`Training Mode ${next ? 'ON' : 'OFF'}`, next ? 'info' : 'success');
      },

      /* Donations */
      donationAmount: 0,
      setDonationAmount: (amount) => set({ donationAmount: amount }),

      /* Language */
      language: 'en',
      setLanguage: (language) => set({ language }),

      /* Alerts */
      alerts: initialAlerts,
      markAlertRead: (id) => set((s) => ({ alerts: s.alerts.map((a) => a.id === id ? { ...a, read: true } : a) })),
      addAlert: (a) => set((s) => ({ alerts: [a, ...s.alerts] })),

      /* Checkout UI */
      selectedCategory: 'all',
      setSelectedCategory: (c) => set({ selectedCategory: c }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),
      isOffline: false,
      setOffline: (v) => set({ isOffline: v }),

      /* Barcode scanner */
      barcodeBuffer: '',
      setBarcodeBuffer: (v) => set({ barcodeBuffer: v }),
      scanBarcode: (barcode) => {
        const product = get().products.find((p) => p.barcode === barcode);
        if (product) {
          get().addToCart(product);
          return product;
        }
        return null;
      },

      /* Modals */
      activeModal: null,
      modalData: null,
      openModal: (name, data) => set({ activeModal: name, modalData: data || null }),
      closeModal: () => set({ activeModal: null, modalData: null }),

      /* Toasts */
      toasts: [],
      addToast: (message, type = 'success') => {
        const id = `t-${Date.now()}`;
        set((s) => ({ toasts: [...s.toasts, { id, message, type }] }));
        setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
      },
      removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      /* Computed */
      calculateDiscounts: () => {
        const { cart, promotions, mealDeals } = get();
        let totalDiscount = 0;

        // Create a working copy of the cart items to track "consumed" quantities.
        // We sort by price descending to ensure customers get the best discount 
        // (most expensive items are bundled first).
        let workingItems = cart.flatMap(item => {
          const unitPrice = item.product.price - (item.discount / item.quantity);
          return Array(item.quantity).fill(null).map(() => ({
            id: item.product.id,
            price: unitPrice,
            consumed: false
          }));
        }).sort((a, b) => b.price - a.price);

        // 1. Process Meal Deals First (Highest Complexity/Value)
        mealDeals.filter(d => d.active).forEach(deal => {
          const mains = deal.mains || [];
          const sides = deal.sides || [];
          const drinks = deal.drinks || [];

          while (true) {
            const main = workingItems.find(i => !i.consumed && mains.includes(i.id));
            const side = workingItems.find(i => !i.consumed && sides.includes(i.id));
            const drink = workingItems.find(i => !i.consumed && drinks.includes(i.id));

            if (main && side && drink) {
              const originalTotal = main.price + side.price + drink.price;
              const saving = Math.max(0, originalTotal - deal.price);
              totalDiscount += saving;

              main.consumed = true;
              side.consumed = true;
              drink.consumed = true;
            } else {
              break;
            }
          }
        });

        // 2. Process Multi-buy / BOGO Promotions on remaining items
        promotions.filter(p => p.active).forEach(promo => {
          const eligible = workingItems.filter(i => !i.consumed && promo.productIds.includes(i.id));
          
          if (eligible.length >= promo.requiredQty) {
            const occurrences = Math.floor(eligible.length / promo.requiredQty);
            
            if (promo.type === 'multi-buy' && promo.promoPrice) {
              // Calculate saving for each occurrence
              for (let i = 0; i < occurrences; i++) {
                const bundle = eligible.slice(i * promo.requiredQty, (i + 1) * promo.requiredQty);
                const originalTotal = bundle.reduce((sum, item) => sum + item.price, 0);
                totalDiscount += Math.max(0, originalTotal - promo.promoPrice);
                
                // Mark as consumed
                bundle.forEach(item => item.consumed = true);
              }
            } else if (promo.type === 'bogo') {
              // Buy one get one free (effectively 2 for price of 1)
              for (let i = 0; i < occurrences; i++) {
                const bundle = eligible.slice(i * 2, (i + 1) * 2);
                // Discount the cheapest item in the pair (bundle is sorted desc, so it's the second)
                totalDiscount += bundle[1].price;
                bundle.forEach(item => item.consumed = true);
              }
            } else if (promo.type === 'percentage' && promo.discountPercent) {
              eligible.forEach(item => {
                totalDiscount += item.price * (promo.discountPercent! / 100);
                item.consumed = true;
              });
            }
          }
        });

        return totalDiscount;
      },
      cartSubtotal: () => {
        const baseSubtotal = get().cart.reduce((s, i) => s + (i.product.price * i.quantity - i.discount), 0);
        return baseSubtotal - get().calculateDiscounts();
      },
      cartTax: () => {
        const sub = get().cartSubtotal();
        // Simplified tax calculation for demo
        return sub * 0.2;
      },
      cartTotal: () => {
        const sub = get().cartSubtotal() + get().cartTax() + get().donationAmount;
        const gc = get().appliedGiftCard?.balance || 0;
        return Math.max(0, sub - gc);
      },
      cartItemCount: () => get().cart.reduce((c, i) => c + i.quantity, 0),
      completeSale: (payments) => {
        const { cart, cartSubtotal, cartTax, cartTotal, calculateDiscounts, currentStaff, selectedCustomer, appliedGiftCard, donationAmount, addTransaction, redeemGiftCard, setAppliedGiftCard, clearCart, addToast, openModal } = get();
        
        const sub = cartSubtotal();
        const tax = cartTax();
        const total = cartTotal();
        const discount = calculateDiscounts();
        const receiptNumber = `R-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
        
        const finalPayments = [...payments];
        if (appliedGiftCard) {
          const redemptionAmount = Math.min(appliedGiftCard.balance, sub + tax + donationAmount);
          finalPayments.push({ method: 'voucher', amount: redemptionAmount });
          redeemGiftCard(appliedGiftCard.code, redemptionAmount);
          setAppliedGiftCard(null);
        }

        addTransaction({
          id: `TXN-${Date.now().toString(36).toUpperCase()}`,
          items: [...cart],
          subtotal: sub,
          tax,
          discount: cart.reduce((s, i) => s + i.discount, 0) + discount,
          total,
          payments: finalPayments,
          timestamp: new Date().toISOString(),
          cashier: currentStaff,
          customer: selectedCustomer || undefined,
          status: 'completed',
          receiptNumber,
          notes: '',
        });

        clearCart();
        addToast(`Sale complete — ${receiptNumber}`);
        set({ activeModal: 'digital-receipt', modalData: { total, receiptNumber } });
      },
    }),
    {
      name: 'auraflow-pos-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        products: state.products,
        transactions: state.transactions,
        customers: state.customers,
        staff: state.staff,
        heldTransactions: state.heldTransactions,
        stockAdjustments: state.stockAdjustments,
        wasteLog: state.wasteLog,
        alerts: state.alerts,
        cart: state.cart,
        currentStaff: state.currentStaff,
        promotions: state.promotions,
        mealDeals: state.mealDeals,
        markdowns: state.markdowns,
        auditTrail: state.auditTrail,
        giftCards: state.giftCards,
        language: state.language,
      }),
    }
  )
);

