import { motion } from 'framer-motion';
import { Grid3X3, Coffee, Cookie, Milk, Croissant, Apple, Beef, Home } from 'lucide-react';
import { usePosStore } from '../store';
import type { CheckoutCategory } from '../types';

const categories: { id: CheckoutCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'All Items', icon: 'Grid3X3' },
  { id: 'beverages', label: 'Beverages', icon: 'Coffee' },
  { id: 'snacks', label: 'Snacks', icon: 'Cookie' },
  { id: 'dairy', label: 'Dairy', icon: 'Milk' },
  { id: 'bakery', label: 'Bakery', icon: 'Croissant' },
  { id: 'produce', label: 'Produce', icon: 'Apple' },
  { id: 'meat', label: 'Meat & Fish', icon: 'Beef' },
  { id: 'household', label: 'Household', icon: 'Home' },
];

const iconMap: Record<string, React.ElementType> = { Grid3X3, Coffee, Cookie, Milk, Croissant, Apple, Beef, Home };

export default function CategoryBar() {
  const { selectedCategory, setSelectedCategory } = usePosStore();
  return (
    <div className="flex items-center gap-1 px-2 overflow-x-auto" role="tablist" aria-label="Product categories"
      style={{ height: 48, minHeight: 48, padding: 4, borderRadius: 'var(--radius-lg)', background: 'var(--color-surface-overlay)', border: '1px solid var(--color-surface-glass-border)' }}>
      {categories.map((cat) => {
        const Icon = iconMap[cat.icon];
        const isActive = selectedCategory === cat.id;
        return (
          <motion.button key={cat.id} role="tab" aria-selected={isActive} aria-label={cat.label} id={`cat-${cat.id}`}
            className="relative flex items-center gap-2 cursor-pointer whitespace-nowrap"
            style={{ height: 38, padding: '0 14px', borderRadius: 'var(--radius-md)', border: 'none', background: 'transparent', fontSize: 'var(--text-sm)', fontWeight: isActive ? 600 : 500, fontFamily: 'var(--font-sans)', color: isActive ? 'white' : 'var(--color-slate-400)', transition: 'color 200ms ease', zIndex: 1 }}
            onClick={() => setSelectedCategory(cat.id)} whileHover={!isActive ? { color: 'var(--color-slate-200)' } : {}} whileTap={{ scale: 0.96 }}>
            {isActive && <motion.div layoutId="category-pill" className="absolute inset-0" style={{ borderRadius: 'var(--radius-md)', background: 'var(--color-indigo)', boxShadow: '0 2px 8px rgba(99,102,241,0.3)', zIndex: -1 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />}
            {Icon && <Icon size={15} strokeWidth={isActive ? 2.2 : 1.8} />}
            <span>{cat.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
