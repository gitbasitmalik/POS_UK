import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, AlertCircle, Download } from 'lucide-react';
import Modal from './Modal';
import { usePosStore } from '../store';
import type { Product } from '../types';

function parseCSV(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const rows = lines.slice(1).map((line) => {
    const vals: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { vals.push(current.trim()); current = ''; }
      else { current += char; }
    }
    vals.push(current.trim());
    return vals;
  });
  return { headers, rows };
}

const REQUIRED_FIELDS = ['name', 'sku', 'barcode', 'price', 'cost', 'category', 'stock'];
const SAMPLE_CSV = `name,sku,barcode,price,cost,category,stock,vatRate,ageRestricted,minAge
Organic Oat Milk,DRY-OAT-001,5060000000001,2.20,0.90,dairy,45,zero,false,0
Sparkling Water 500ml,BEV-SPW-001,5060000000002,1.10,0.30,beverages,120,standard,false,0
Red Wine 750ml,BEV-RDW-001,5060000000003,8.99,4.50,beverages,24,standard,true,18`;

export default function BulkImportModal() {
  const { closeModal, addProduct, addToast } = usePosStore();
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<{ headers: string[]; rows: string[][] } | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const result = parseCSV(text);
      const errs: string[] = [];
      const missingFields = REQUIRED_FIELDS.filter((rf) => !result.headers.map((h) => h.toLowerCase()).includes(rf));
      if (missingFields.length) errs.push(`Missing required columns: ${missingFields.join(', ')}`);
      if (result.rows.length === 0) errs.push('No data rows found');
      setErrors(errs);
      setParsed(result);
    };
    reader.readAsText(f);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.type === 'text/csv')) handleFile(f);
  };

  const handleImport = async () => {
    if (!parsed || errors.length > 0) return;
    setImporting(true);
    const headerMap: Record<string, number> = {};
    parsed.headers.forEach((h, i) => { headerMap[h.toLowerCase()] = i; });

    let count = 0;
    for (const row of parsed.rows) {
      const product: Product = {
        id: `p-imp-${Date.now()}-${count}`,
        name: row[headerMap['name']] || '',
        sku: row[headerMap['sku']] || '',
        barcode: row[headerMap['barcode']] || '',
        price: parseFloat(row[headerMap['price']]) || 0,
        cost: parseFloat(row[headerMap['cost']]) || 0,
        category: (row[headerMap['category']] || 'household') as any,
        stock: parseInt(row[headerMap['stock']]) || 0,
        reorderPoint: 10,
        vatRate: (row[headerMap['vatrate']] || 'standard') as any,
        ageRestricted: row[headerMap['agerestricted']]?.toLowerCase() === 'true',
        minAge: parseInt(row[headerMap['minage']]) || 0,
        image: `https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=200&h=200&fit=crop`,
        color: '#6366F1',
        active: true,
        supplier: row[headerMap['supplier']] || 'Imported',
        unit: (row[headerMap['unit']] as any) || 'each',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      if (product.name && product.price > 0) {
        addProduct(product);
        count++;
      }
      await new Promise((r) => setTimeout(r, 30)); // Simulate processing
    }
    setImported(count);
    setImporting(false);
    addToast(`${count} products imported successfully`);
    setTimeout(() => closeModal(), 1200);
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'auraflow_sample_import.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal title="Bulk Product Import" width={540}>
      <div className="flex flex-col gap-4">
        {!parsed ? (
          <>
            <div className="flex flex-col items-center gap-3 cursor-pointer" onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}
              onClick={() => { const input = document.createElement('input'); input.type = 'file'; input.accept = '.csv'; input.onchange = (e: any) => handleFile(e.target.files[0]); input.click(); }}
              style={{ padding: 40, borderRadius: 'var(--radius-xl)', border: '2px dashed var(--color-surface-glass-border)', background: 'var(--color-surface-overlay)', transition: 'border-color 200ms' }}>
              <Upload size={32} style={{ color: 'var(--color-slate-400)', opacity: 0.5 }} />
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-slate-300)' }}>Drop CSV file or click to browse</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)' }}>Required: name, sku, barcode, price, cost, category, stock</span>
            </div>
            <motion.button className="flex items-center justify-center gap-2 cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-400)', fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'var(--font-sans)' }}
              whileHover={{ color: 'var(--color-indigo-light)' }} onClick={downloadSample}>
              <Download size={12} /> Download Sample CSV
            </motion.button>
          </>
        ) : imported > 0 ? (
          <motion.div className="flex flex-col items-center gap-3 py-6" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--color-emerald-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={28} style={{ color: 'var(--color-emerald)' }} />
            </div>
            <span style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-slate-100)' }}>{imported} products imported</span>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center gap-2" style={{ padding: 10, borderRadius: 'var(--radius-md)', background: 'var(--color-surface-overlay)' }}>
              <FileText size={16} style={{ color: 'var(--color-indigo-light)' }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-slate-200)', fontWeight: 600 }}>{file?.name}</span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-slate-500)', marginLeft: 'auto' }}>{parsed.rows.length} rows</span>
            </div>
            {errors.length > 0 && (
              <div className="flex flex-col gap-1" style={{ padding: 10, borderRadius: 'var(--radius-md)', background: 'var(--color-rose-bg)', border: '1px solid rgba(244,63,94,0.2)' }}>
                {errors.map((e, i) => <div key={i} className="flex items-center gap-2" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-rose)' }}><AlertCircle size={12} /> {e}</div>)}
              </div>
            )}
            {errors.length === 0 && (
              <div style={{ maxHeight: 200, overflow: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-xs)' }}>
                  <thead><tr style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
                    {parsed.headers.slice(0, 5).map((h) => <th key={h} style={{ padding: '6px 8px', textAlign: 'left', color: 'var(--color-slate-400)', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {parsed.rows.slice(0, 5).map((row, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--color-surface-glass-border)' }}>
                        {row.slice(0, 5).map((val, j) => <td key={j} style={{ padding: '6px 8px', color: 'var(--color-slate-300)' }}>{val}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex justify-end gap-3">
              <motion.button className="cursor-pointer" style={{ padding: '8px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-surface-glass-border)', background: 'transparent', color: 'var(--color-slate-300)', fontSize: 'var(--text-sm)', fontWeight: 600 }}
                onClick={() => { setParsed(null); setFile(null); setErrors([]); }}>Change File</motion.button>
              <motion.button className="flex items-center gap-2 cursor-pointer" style={{ padding: '8px 20px', borderRadius: 'var(--radius-md)', border: 'none', background: errors.length === 0 ? 'var(--color-indigo)' : 'var(--color-surface-overlay)', color: errors.length === 0 ? 'white' : 'var(--color-slate-500)', fontSize: 'var(--text-sm)', fontWeight: 700, opacity: errors.length === 0 ? 1 : 0.5 }}
                whileHover={errors.length === 0 ? { scale: 1.02 } : {}} onClick={handleImport} disabled={errors.length > 0 || importing}>
                {importing ? 'Importing...' : `Import ${parsed.rows.length} Products`}
              </motion.button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
