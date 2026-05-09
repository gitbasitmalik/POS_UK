import { usePosStore } from '../store';
import { motion, AnimatePresence } from 'framer-motion';
import { Languages, ChevronDown, Check } from 'lucide-react';
import { useState } from 'react';
import type { SupportedLanguage } from '../types';

const languages: { code: SupportedLanguage; name: string; flag: string }[] = [
  { code: 'en', name: 'English (UK)', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = usePosStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentLang = languages.find(l => l.code === language) || languages[0];

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--color-slate-300)] hover:text-white transition-all shadow-sm"
      >
        <Languages size={16} className="text-[var(--color-indigo-light)]" />
        <span className="text-[10px] font-black uppercase tracking-widest">{currentLang.name}</span>
        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              className="absolute right-0 top-full mt-2 w-48 z-50 overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface-raised)] border border-[var(--color-surface-glass-border)] shadow-2xl"
            >
              <div className="p-2 space-y-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[var(--radius-lg)] transition-all ${
                      language === lang.code 
                        ? 'bg-[var(--color-indigo)] text-white shadow-glow-indigo' 
                        : 'text-[var(--color-slate-400)] hover:bg-[var(--color-slate-800)] hover:text-[var(--color-slate-200)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{lang.flag}</span>
                      <span className="text-[var(--text-xs)] font-bold">{lang.name}</span>
                    </div>
                    {language === lang.code && <Check size={14} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
