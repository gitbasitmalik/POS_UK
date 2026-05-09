/* ========================================================================
   AuraFlow POS — Top Header Bar
   Features: Glassmorphic search, CMD+K shortcut, sparkline, status bar
   ======================================================================== */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  Wifi,
  WifiOff,
  Clock,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { usePosStore } from '../store';
import { generateSalesData } from '../data';
import type { SalesDataPoint } from '../types';

export default function Header() {
  const { searchQuery, setSearchQuery, isOffline } = usePosStore();
  const [time, setTime] = useState(new Date());
  const [salesData, setSalesData] = useState<SalesDataPoint[]>(generateSalesData());
  const searchRef = useRef<HTMLInputElement>(null);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Refresh sparkline every 30s
  useEffect(() => {
    const timer = setInterval(() => setSalesData(generateSalesData()), 30000);
    return () => clearInterval(timer);
  }, []);

  // CMD+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 'Escape') {
        searchRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const todayTotal = salesData.reduce((sum, d) => sum + d.sales, 0);

  return (
    <header
      className="flex items-center gap-4 px-6"
      style={{
        height: '64px',
        minHeight: '64px',
        borderBottom: '1px solid var(--color-surface-glass-border)',
        backgroundColor: 'var(--color-surface-raised)',
      }}
    >
      {/* Search Bar — Glassmorphic */}
      <div
        className="relative flex items-center flex-1"
        style={{ maxWidth: '800px' }}
      >
        <Search
          size={16}
          className="absolute left-3"
          style={{ color: 'var(--color-slate-500)' }}
        />
        <input
          ref={searchRef}
          id="search-products"
          type="text"
          placeholder="Search products, SKU, barcode..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
          style={{
            height: '40px',
            paddingLeft: '40px',
            paddingRight: '80px',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-surface-glass-border)',
            background: 'var(--color-surface-glass)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            color: 'var(--color-slate-200)',
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-sans)',
            outline: 'none',
            transition: 'border-color var(--duration-normal) var(--ease-smooth)',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-indigo)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'var(--color-surface-glass-border)';
          }}
          aria-label="Search products"
        />
        {/* Shortcut badge */}
        <div
          className="absolute right-3 flex items-center gap-1"
          style={{
            padding: '2px 8px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            fontSize: '11px',
            color: 'var(--color-slate-500)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            letterSpacing: '0.3px',
          }}
        >
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      {/* Sparkline — Hourly Sales */}
      <div
        className="flex items-center gap-3"
        style={{
          padding: '6px 14px',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--color-surface-glass-border)',
        }}
      >
        <div className="flex flex-col">
          <span
            style={{
              fontSize: '10px',
              color: 'var(--color-slate-500)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
            }}
          >
            Today
          </span>
          <span
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-emerald)',
              fontFamily: 'var(--font-mono)',
              fontWeight: 600,
            }}
          >
            £{todayTotal.toLocaleString()}
          </span>
        </div>
        <div style={{ width: '100px', height: '32px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#10B981"
                strokeWidth={1.5}
                fill="url(#sparkGrad)"
                dot={false}
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <TrendingUp size={14} style={{ color: 'var(--color-emerald)' }} />
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 ml-auto">
        {/* Notification bell */}
        <motion.button
          className="relative flex items-center justify-center cursor-pointer"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            border: 'none',
            background: 'transparent',
            color: 'var(--color-slate-400)',
          }}
          whileHover={{ color: 'var(--color-slate-200)' }}
          whileTap={{ scale: 0.92 }}
          aria-label="Notifications"
          id="header-notifications"
        >
          <Bell size={18} />
          <span
            className="absolute"
            style={{
              top: '8px',
              right: '10px',
              width: '7px',
              height: '7px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-indigo)',
            }}
          />
        </motion.button>

        {/* Offline indicator */}
        <AnimatePresence>
          {isOffline ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 animate-sync-pulse"
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-amber-bg)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-amber)',
              }}
            >
              <WifiOff size={12} />
              <span>Offline Sync</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center gap-2"
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-emerald-bg)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--color-emerald)',
              }}
            >
              <Wifi size={12} />
              <span>Online</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clock */}
        <div
          className="flex items-center gap-2"
          style={{
            fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-mono)',
            fontWeight: 500,
            color: 'var(--color-slate-400)',
          }}
        >
          <Clock size={14} />
          <span>
            {time.toLocaleTimeString('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </div>
    </header>
  );
}
