import { useEffect } from 'react';
import { usePosStore } from './store';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/Toast';
import DashboardPage from './pages/DashboardPage';
import CheckoutPage from './pages/CheckoutPage';
import ProductsPage from './pages/ProductsPage';
import InventoryPage from './pages/InventoryPage';
import TransactionsPage from './pages/TransactionsPage';
import CustomersPage from './pages/CustomersPage';
import StaffPage from './pages/StaffPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import AuditTrailPage from './pages/AuditTrailPage';
import PromotionsPage from './pages/PromotionsPage';
import SuppliersPage from './pages/SuppliersPage';
import GiftCardsPage from './pages/GiftCardsPage';
import SelfCheckoutPage from './pages/SelfCheckoutPage';
import YellowLabelPage from './pages/YellowLabelPage';
import CustomerDisplayPage from './pages/CustomerDisplayPage';
import StockForecastPage from './pages/StockForecastPage';
import LivePulsePage from './pages/LivePulsePage';

import SplitPaymentModal from './components/SplitPaymentModal';
import HoldRecallModal from './components/HoldRecallModal';
import AgeVerifyModal from './components/AgeVerifyModal';
import DigitalReceiptModal from './components/DigitalReceiptModal';
import CashUpModal from './components/CashUpModal';
import SupplierOrderModal from './components/SupplierOrderModal';
import PromotionModal from './components/PromotionModal';
import MealDealModal from './components/MealDealModal';
import GiftCardModal from './components/GiftCardModal';

const pages = {
  dashboard: DashboardPage,
  checkout: CheckoutPage,
  products: ProductsPage,
  inventory: InventoryPage,
  transactions: TransactionsPage,
  customers: CustomersPage,
  staff: StaffPage,
  reports: ReportsPage,
  settings: SettingsPage,
  audit: AuditTrailPage,
  promotions: PromotionsPage,
  suppliers: SuppliersPage,
  'gift-cards': GiftCardsPage,
  'self-checkout': SelfCheckoutPage,
  'yellow-label': YellowLabelPage,
  'customer-display': CustomerDisplayPage,
  'stock-forecast': StockForecastPage,
  'live-pulse': LivePulsePage,
};

export default function App() {
  const { currentPage, activeModal, modalData, setOffline } = usePosStore();

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    setOffline(!navigator.onLine);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [setOffline]);

  const PageComponent = pages[currentPage];

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: 'var(--color-surface-base)', fontFamily: 'var(--font-sans)' }}>
      <Sidebar />
      <PageComponent />
      <ToastContainer />
      
      {/* Global Modals */}
      {activeModal === 'split-payment' && <SplitPaymentModal />}
      {activeModal === 'hold-recall' && <HoldRecallModal />}
      {activeModal === 'age-verify' && <AgeVerifyModal />}
      {activeModal === 'digital-receipt' && <DigitalReceiptModal />}
      {activeModal === 'cash-up' && <CashUpModal />}
      {activeModal === 'supplier-order' && <SupplierOrderModal />}
      {activeModal === 'promotion' && <PromotionModal />}
      {activeModal === 'meal-deal' && <MealDealModal />}
      {activeModal === 'gift-card' && <GiftCardModal />}
    </div>
  );
}

