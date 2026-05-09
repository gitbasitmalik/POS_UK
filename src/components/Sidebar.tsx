import { motion } from 'framer-motion';
import { 
  LayoutGrid, ShoppingCart, BarChart3, Package, Users, Settings, LogOut, 
  Zap, ClipboardList, UserCog, ReceiptText, Calculator, Shield, Truck, 
  Tag, History, Gift, Globe, AlertCircle, Monitor, Scan, TrendingUp, Activity 
} from 'lucide-react';
import { usePosStore } from '../store';
import type { NavPage } from '../types';
import LanguageSwitcher from './LanguageSwitcher';

const navItems: { icon: any; label: string; id: NavPage }[] = [
  { icon: LayoutGrid, label: 'Dashboard', id: 'dashboard' },
  { icon: ShoppingCart, label: 'Checkout', id: 'checkout' },
  { icon: Scan, label: 'Self-Checkout', id: 'self-checkout' },
  { icon: Package, label: 'Products', id: 'products' },
  { icon: Tag, label: 'Offers', id: 'promotions' },
  { icon: Truck, label: 'Suppliers', id: 'suppliers' },
  { icon: ClipboardList, label: 'Inventory', id: 'inventory' },
  { icon: TrendingUp, label: 'Forecast', id: 'stock-forecast' },
  { icon: ReceiptText, label: 'Transactions', id: 'transactions' },
  { icon: Users, label: 'Customers', id: 'customers' },
  { icon: History, label: 'Audit Trail', id: 'audit' },
  { icon: Shield, label: 'Staff', id: 'staff' },
  { icon: Gift, label: 'Gift Cards', id: 'gift-cards' },
  { icon: Tag, label: 'Yellow Label', id: 'yellow-label' },
  { icon: Monitor, label: 'CFD', id: 'customer-display' },
  { icon: Activity, label: 'Live Pulse', id: 'live-pulse' },
  { icon: Settings, label: 'Settings', id: 'settings' },
];

export default function Sidebar() {
  const { 
    currentPage, 
    setPage, 
    currentStaff, 
    openModal, 
    isTrainingMode, 
    toggleTrainingMode 
  } = usePosStore();

  return (
    <aside className="flex flex-col items-center py-6 h-full gap-4" style={{ width: 72, minWidth: 72, backgroundColor: 'var(--color-surface-raised)', borderRight: '1px solid var(--color-surface-glass-border)' }}>
      {/* Brand */}
      <motion.div 
        className="flex items-center justify-center mb-4 cursor-pointer" 
        style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(135deg, var(--color-indigo), var(--color-indigo-dark))', boxShadow: 'var(--shadow-glow-indigo)' }}
        whileHover={{ scale: 1.05 }} 
        whileTap={{ scale: 0.95 }} 
        onClick={() => setPage('dashboard')}
      >
        <Zap size={22} color="white" strokeWidth={2.5} fill="currentColor" />
      </motion.div>

      {/* Navigation */}
      <nav className="flex flex-col items-center gap-1 flex-1 overflow-y-auto no-scrollbar" role="navigation">
        {navItems.map((item) => {
          const active = currentPage === item.id;
          return (
            <motion.button 
              key={item.id} 
              className="relative flex items-center justify-center cursor-pointer group" 
              style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', border: 'none', background: active ? 'var(--color-indigo-subtle)' : 'transparent', color: active ? 'var(--color-indigo-light)' : 'var(--color-slate-500)', transition: 'all 200ms ease' }}
              whileHover={{ backgroundColor: active ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)', color: active ? 'var(--color-indigo-light)' : 'var(--color-slate-300)' }}
              whileTap={{ scale: 0.92 }} 
              onClick={() => setPage(item.id)}
              title={item.label}
            >
              <item.icon size={20} strokeWidth={active ? 2.2 : 1.8} />
              {active && <motion.div layoutId="nav-indicator" className="absolute" style={{ left: -4, top: '50%', transform: 'translateY(-50%)', width: 3, height: 20, borderRadius: 'var(--radius-full)', background: 'var(--color-indigo)' }} />}
              
              {/* Tooltip */}
              <div className="absolute left-full ml-4 px-2 py-1 rounded bg-[var(--color-slate-900)] text-[10px] font-bold text-white uppercase tracking-widest opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl border border-white/5">
                {item.label}
              </div>
            </motion.button>
          );
        })}
      </nav>

      {/* Utilities */}
      <div className="flex flex-col items-center gap-2 mt-auto pt-4 border-t border-[var(--color-surface-glass-border)] w-full">


        {/* Training Mode Toggle */}
        <motion.button 
          className="flex items-center justify-center cursor-pointer relative" 
          style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: isTrainingMode ? 'var(--color-amber-bg)' : 'transparent', color: isTrainingMode ? 'var(--color-amber)' : 'var(--color-slate-500)' }}
          whileHover={{ scale: 1.05 }} 
          whileTap={{ scale: 0.95 }}
          onClick={toggleTrainingMode}
          title={`Training Mode: ${isTrainingMode ? 'ON' : 'OFF'}`}
        >
          <AlertCircle size={20} strokeWidth={isTrainingMode ? 2.5 : 1.8} />
          {isTrainingMode && <span className="absolute top-2 right-2 w-2 h-2 bg-[var(--color-amber)] rounded-full animate-pulse shadow-[0_0_8px_var(--color-amber)]" />}
        </motion.button>

        {/* Cash-Up */}
        <motion.button 
          className="flex items-center justify-center cursor-pointer" 
          style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'transparent', color: 'var(--color-slate-500)' }}
          whileHover={{ color: 'var(--color-emerald)', backgroundColor: 'var(--color-emerald-bg)' }} 
          whileTap={{ scale: 0.92 }}
          onClick={() => { setPage('checkout'); openModal('cash-up'); }}
          title="Cash Up"
        >
          <Calculator size={20} />
        </motion.button>

        {/* Staff Profile */}
        <motion.div 
          onClick={() => openModal('staff-switch')}
          className="flex items-center justify-center mt-2 cursor-pointer border-2 border-transparent hover:border-[var(--color-indigo)]/50 transition-all" 
          style={{ width: 36, height: 36, borderRadius: 'var(--radius-full)', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', fontSize: 'var(--text-xs)', fontWeight: 700, color: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }} 
          title={currentStaff.name}
          whileHover={{ scale: 1.1 }}
        >
          {currentStaff.avatar}
        </motion.div>
      </div>
    </aside>
  );
}

