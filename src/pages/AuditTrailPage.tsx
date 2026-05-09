import { useState } from 'react';
import { usePosStore } from '../store';
import { motion } from 'framer-motion';
import { History, Shield, User, Clock, Search, Filter, Download } from 'lucide-react';

export default function AuditTrailPage() {
  const { auditTrail, addToast } = usePosStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState('all');

  const filteredTrail = auditTrail.filter(entry => {
    const matchesSearch = !searchQuery || entry.description.toLowerCase().includes(searchQuery.toLowerCase()) || entry.staffName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterAction === 'all' || entry.action === filterAction;
    return matchesSearch && matchesFilter;
  });

  const actionTypes = ['all', ...new Set(auditTrail.map(e => e.action))];

  const getActionColor = (action: string) => {
    switch (action) {
      case 'sale': return 'text-[var(--color-emerald)] bg-[var(--color-emerald-bg)]';
      case 'refund': return 'text-[var(--color-rose)] bg-[var(--color-rose-bg)]';
      case 'void': return 'text-[var(--color-amber)] bg-[var(--color-amber-bg)]';
      case 'login': return 'text-[var(--color-indigo-light)] bg-[var(--color-indigo-subtle)]';
      case 'stock-adjust': return 'text-[var(--color-blue)] bg-[var(--color-blue-bg)]';
      default: return 'text-[var(--color-slate-400)] bg-[var(--color-slate-800)]';
    }
  };

  const exportCSV = () => {
    const headers = ['Timestamp', 'Action', 'Description', 'Staff', 'Metadata'];
    const rows = filteredTrail.map(e => [
      new Date(e.timestamp).toISOString(),
      e.action,
      `"${e.description.replace(/"/g, '""')}"`,
      e.staffName,
      e.metadata ? `"${JSON.stringify(e.metadata).replace(/"/g, '""')}"` : ''
    ].join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `audit-trail-${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${rows.length} audit entries to CSV`);
  };

  return (
    <div className="p-8 h-full flex flex-col gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-[var(--radius-xl)] bg-[var(--color-indigo-subtle)] text-[var(--color-indigo-light)] shadow-glow">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-[var(--text-2xl)] font-black text-[var(--color-slate-100)] tracking-tight">Audit Trail</h1>
            <p className="text-[var(--text-sm)] text-[var(--color-slate-500)] font-medium">Enterprise compliance & activity monitoring · {filteredTrail.length} entries</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate-500)] group-focus-within:text-[var(--color-indigo)] transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search audit logs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--color-slate-200)] text-[var(--text-sm)] focus:outline-none focus:border-[var(--color-indigo)]/50 transition-all w-64"
            />
          </div>
          <select 
            value={filterAction} onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-surface-overlay)] border border-[var(--color-surface-glass-border)] text-[var(--color-slate-300)] text-[var(--text-sm)] focus:outline-none capitalize cursor-pointer"
          >
            {actionTypes.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)] bg-[var(--color-indigo)] text-white text-[var(--text-sm)] font-bold shadow-glow-indigo hover:filter hover:brightness-110 transition-all cursor-pointer"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="flex-1 overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--color-surface-glass-border)] bg-[var(--color-surface-overlay)] shadow-2xl flex flex-col">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[var(--color-surface-overlay)] z-10">
              <tr className="border-b border-[var(--color-surface-glass-border)]">
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Action</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Description</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Operator</th>
                <th className="px-6 py-4 text-[10px] font-black text-[var(--color-slate-500)] uppercase tracking-[2px]">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrail.map((entry, idx) => (
                <motion.tr 
                  key={entry.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-[var(--color-surface-glass-border)]/30 hover:bg-[var(--color-slate-900)]/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-[var(--color-slate-300)] font-mono text-[11px]">
                      <Clock size={12} className="text-[var(--color-slate-500)]" />
                      {new Date(entry.timestamp).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getActionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[var(--text-sm)] font-medium text-[var(--color-slate-200)]">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-slate-800)] flex items-center justify-center text-[10px] font-bold text-[var(--color-slate-400)] border border-[var(--color-surface-glass-border)]">
                        {entry.staffName[0]}
                      </div>
                      <span className="text-[var(--text-sm)] font-bold text-[var(--color-slate-300)]">{entry.staffName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {entry.metadata ? (
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(entry.metadata).map(([key, val]) => (
                          <span key={key} className="px-1.5 py-0.5 rounded bg-[var(--color-slate-900)] border border-[var(--color-surface-glass-border)] text-[9px] font-mono text-[var(--color-slate-500)]">
                            {key}: {typeof val === 'object' ? '...' : String(val)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[var(--color-slate-600)] text-[10px] italic">No metadata</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
