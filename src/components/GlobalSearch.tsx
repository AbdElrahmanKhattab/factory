import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Package, ShoppingBag, Archive, X, Command, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';

export default function GlobalSearch() {
  const { products, orders, rawMaterials, finishedGoods } = useDashboard();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  // Shortcut to open search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();

    const matchedProducts = products
      .filter(p => p.nameAr.toLowerCase().includes(q) || p.nameEn.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
      .map(p => ({ id: p.id, title: p.nameAr, subtitle: p.sku, type: 'product' as const, path: '/products' }));

    const matchedOrders = orders
      .filter(o => o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.customerPhone.includes(q))
      .map(o => ({ id: o.id, title: `طلب #${o.id.split('-').pop()}`, subtitle: o.customerName, type: 'order' as const, path: '/orders' }));

    const matchedRaw = rawMaterials.flatMap(c => 
      c.items.filter(i => i.name.toLowerCase().includes(q))
        .map(i => ({ id: i.id, title: i.name, subtitle: c.name, type: 'raw' as const, path: '/inventory/raw' }))
    );

    const matchedFinished = finishedGoods.flatMap(mc => 
        mc.subCategories.flatMap(sc => 
            sc.items.filter(i => i.name.toLowerCase().includes(q))
                .map(i => ({ id: i.id, title: i.name, subtitle: `${mc.name} > ${sc.name}`, type: 'finished' as const, path: '/inventory/finished' }))
        )
    );

    return [...matchedProducts, ...matchedOrders, ...matchedRaw, ...matchedFinished].slice(0, 10);
  }, [query, products, orders, rawMaterials, finishedGoods]);

  const handleSelect = (item: any) => {
    navigate(item.path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:border-blue-200 hover:bg-white transition-all cursor-pointer w-72 h-11"
      >
        <Search size={16} />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] italic flex-1">بحث شامل في النظام...</span>
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white border border-slate-200 rounded-md text-[8px] font-black shadow-sm">
            <Command size={10} />
            <span>K</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
              dir="rtl"
            >
              <div className="p-6 border-b border-slate-100 flex items-center gap-4">
                <Search size={22} className="text-blue-600" />
                <input 
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ابحث عن منتج، طلب، مادة خام، أو كود SKU..."
                  className="flex-1 bg-transparent border-none outline-none text-sm font-black text-slate-900 placeholder-slate-300 italic h-10"
                />
                <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-slate-50 rounded-xl transition-all"
                >
                    <X size={18} className="text-slate-400" />
                </button>
              </div>

              <div className="max-h-[35rem] overflow-y-auto custom-scrollbar p-3">
                {query.trim() === '' ? (
                    <div className="p-12 text-center">
                        <Command size={48} className="mx-auto text-slate-100 mb-6" />
                        <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic mb-2">ابدأ الكتابة للبحث الشامل</p>
                        <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest italic">يمكنك البحث بالاسم، رقم الهاتف، أو كود SKU</p>
                    </div>
                ) : results.length > 0 ? (
                  <div className="grid grid-cols-1 gap-1">
                    {results.map((item, idx) => (
                      <button
                        key={`${item.type}-${item.id}-${idx}`}
                        onClick={() => handleSelect(item)}
                        className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all text-right group"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-3 rounded-xl ${
                             item.type === 'product' ? 'bg-blue-50 text-blue-600' :
                             item.type === 'order' ? 'bg-emerald-50 text-emerald-600' :
                             item.type === 'raw' ? 'bg-rose-50 text-rose-600' :
                             'bg-indigo-50 text-indigo-600'
                          }`}>
                            {item.type === 'product' && <Package size={18} />}
                            {item.type === 'order' && <ShoppingBag size={18} />}
                            {item.type === 'raw' && <Archive size={18} />}
                            {item.type === 'finished' && <Package size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 italic tracking-tight">{item.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.subtitle}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity italic">انتقال سريع</span>
                            <div className="p-2 bg-white border border-slate-100 rounded-lg text-slate-300">
                                <ChevronRight size={14} className="rotate-180" />
                            </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <X size={48} className="mx-auto text-slate-100 mb-6" />
                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest italic">لم يتم العثور على نتائج لـ "{query}"</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[8px] font-black shadow-sm flex items-center gap-1">
                            <ChevronRight size={8} className="rotate-90" />
                            <ChevronRight size={8} className="-rotate-90" />
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase italic">للتنقل</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[8px] font-black shadow-sm">Enter</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase italic">للاختيار</span>
                    </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400 italic font-black text-[9px] uppercase tracking-widest">
                    <Command size={10} />
                    <span>محرك بحث المصنع</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
