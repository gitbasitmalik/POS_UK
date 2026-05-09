/* ========================================================================
   AuraFlow POS — Complete Type System
   ======================================================================== */

/* ── Products ─────────────────────────────────────────────── */
export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  image: string;
  sku: string;
  stock: number;
  barcode: string;
  color?: string;
  vatRate: 'standard' | 'reduced' | 'zero';
  ageRestricted: boolean;
  minAge?: number;
  reorderPoint: number;
  supplier: string;
  unit: 'each' | 'kg' | 'litre';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount: number;
}

/* ── Cart & Transactions ─────────────────────────────────── */
export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  markdownId?: string;
}

export type PaymentMethod = 'cash' | 'card' | 'contactless' | 'voucher';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
}

export interface Transaction {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payments: PaymentSplit[];
  cashier: Staff;
  customer?: Customer;
  timestamp: string;
  status: 'completed' | 'refunded' | 'partial-refund' | 'voided' | 'held';
  receiptNumber: string;
  notes: string;
}

export interface HeldTransaction {
  id: string;
  items: CartItem[];
  customer?: Customer;
  heldAt: string;
  heldBy: string;
  label: string;
}

/* ── Customers ────────────────────────────────────────────── */
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  totalSpend: number;
  visitCount: number;
  lastVisit: string;
  createdAt: string;
  notes: string;
}

/* ── Staff ────────────────────────────────────────────────── */
export type StaffRole = 'cashier' | 'supervisor' | 'manager' | 'admin';

export interface Staff {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  pin: string;
  avatar: string;
  hireDate: string;
  active: boolean;
  salesTotal: number;
  transactionCount: number;
}

export interface Shift {
  id: string;
  staffId: string;
  clockIn: string;
  clockOut: string | null;
  breakMinutes: number;
  salesTotal: number;
  transactionCount: number;
}

/* ── Inventory ────────────────────────────────────────────── */
export type AdjustmentReason = 'delivery' | 'damage' | 'theft' | 'expired' | 'count' | 'return' | 'other';

export interface StockAdjustment {
  id: string;
  productId: string;
  productName: string;
  previousStock: number;
  newStock: number;
  change: number;
  reason: AdjustmentReason;
  notes: string;
  adjustedBy: string;
  timestamp: string;
}

export interface WasteLog {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  reason: 'damaged' | 'expired' | 'spillage' | 'recalled' | 'other';
  cost: number;
  loggedBy: string;
  timestamp: string;
  notes: string;
}

/* ── Reports ──────────────────────────────────────────────── */
export interface SalesDataPoint {
  hour: string;
  sales: number;
  transactions: number;
}

export interface DailySummary {
  date: string;
  totalSales: number;
  totalTransactions: number;
  avgBasket: number;
  itemsSold: number;
  refunds: number;
  waste: number;
}

/* ── Alerts ───────────────────────────────────────────────── */
export interface Alert {
  id: string;
  type: 'low-stock' | 'expiry' | 'system' | 'refund' | 'shift';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

/* ── Settings ─────────────────────────────────────────────── */
export interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  vatNumber: string;
  vatRates: { standard: number; reduced: number; zero: number };
  currency: string;
  receiptHeader: string;
  receiptFooter: string;
  digitalReceipts: boolean;
  autoReorderEnabled: boolean;
}

/* ── Promotions & Multi-Buy ───────────────────────────────── */
export type PromoType = 'multi-buy' | 'bundle' | 'percentage' | 'fixed' | 'bogo';
export interface Promotion {
  id: string;
  name: string;
  type: PromoType;
  productIds: string[];
  requiredQty: number;       // e.g. "Buy 3..."
  promoPrice?: number;       // e.g. "...for £5"
  discountPercent?: number;  // e.g. "...get 20% off"
  freeQty?: number;          // e.g. "...get 1 free"
  active: boolean;
  startDate: string;
  endDate: string;
}

/* ── Meal Deals / Bundles ─────────────────────────────────── */
export interface MealDeal {
  id: string;
  name: string;
  price: number;
  mains?: string[];
  sides?: string[];
  drinks?: string[];
  categories?: { category: string; label: string; maxPicks: number }[];
  active: boolean;
  image?: string;
}

/* ── Markdown / Reduced-to-Clear ─────────────────────────── */
export interface Markdown {
  id: string;
  productId: string;
  productName: string;
  originalPrice: number;
  reducedPrice: number;
  reason: 'expiring-today' | 'expiring-tomorrow' | 'damaged-packaging' | 'overstock' | 'seasonal';
  expiresAt: string;
  createdBy: string;
  createdAt: string;
  active: boolean;
}

/* ── Gift Cards ──────────────────────────────────────────── */
export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  initialValue: number;
  issuedAt: string;
  issuedBy: string;
  expiryDate: string;
  lastUsed?: string;
  active: boolean;
}

/* ── Audit Trail ─────────────────────────────────────────── */
export type AuditAction = 'sale' | 'refund' | 'void' | 'price-override' | 'discount' | 'stock-adjust' | 'login' | 'logout' | 'cash-up' | 'settings-change' | 'product-add' | 'product-edit' | 'product-delete' | 'markdown' | 'gift-card-issue' | 'gift-card-redeem';
export interface AuditEntry {
  id: string;
  action: AuditAction;
  description: string;
  staffId: string;
  staffName: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/* ── Supplier Orders ─────────────────────────────────────── */
export interface SupplierOrder {
  id: string;
  items: { productId: string; productName: string; qty: number; cost: number }[];
  supplier: string;
  status: 'draft' | 'sent' | 'confirmed' | 'delivered';
  totalCost: number;
  createdAt: string;
  expectedDelivery?: string;
}

/* ── Multi-Language ──────────────────────────────────────── */
export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'pl' | 'ur' | 'ar' | 'ro' | 'pt';

/* ── UI Navigation ────────────────────────────────────────── */
export type NavPage = 'dashboard' | 'checkout' | 'products' | 'inventory' | 'transactions' | 'customers' | 'staff' | 'reports' | 'settings' | 'audit' | 'promotions' | 'suppliers' | 'gift-cards' | 'self-checkout' | 'yellow-label' | 'customer-display' | 'stock-forecast' | 'live-pulse';

/* ── Filter Category for checkout ─────────────────────────── */
export type CheckoutCategory = 'all' | 'beverages' | 'snacks' | 'dairy' | 'bakery' | 'produce' | 'meat' | 'household';
