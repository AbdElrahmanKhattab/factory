import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  AlertCircle,
  MoreVertical,
  ChevronRight,
  PlusCircle,
  FolderOpen,
  Folder,
  X,
  PlusSquare,
  Package,
  History,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { FinishedGoodItem, FinishedGoodMainCategory, FinishedGoodSubCategory, SizeVariants } from '../types';

export default function InventoryFinished() {
  const { 
    finishedGoods, 
    updateFinishedGood, 
    deleteFinishedGoodItem, 
    addLog, 
    currentUser,
    addFinishedGoodMainCategory,
    updateFinishedGoodMainCategory,
    deleteFinishedGoodMainCategory,
    addFinishedGoodSubCategory,
    updateFinishedGoodSubCategory,
    deleteFinishedGoodSubCategory
  } = useDashboard();
  
  const [selectedMainId, setSelectedMainId] = useState(finishedGoods[0]?.id || '');
  const [selectedSubId, setSelectedSubId] = useState(finishedGoods[0]?.subCategories[0]?.id || '');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMainCatModalOpen, setIsMainCatModalOpen] = useState(false);
  const [isSubCatModalOpen, setIsSubCatModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FinishedGoodItem | null>(null);
  const [editingItem, setEditingItem] = useState<FinishedGoodItem | null>(null);
  const [editingMainCat, setEditingMainCat] = useState<FinishedGoodMainCategory | null>(null);
  const [editingSubCat, setEditingSubCat] = useState<FinishedGoodSubCategory | null>(null);

  const selectedMain = finishedGoods.find(m => m.id === selectedMainId);
  const selectedSub = selectedMain?.subCategories.find(s => s.id === selectedSubId);
  const filteredItems = selectedSub?.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) || [];

  const [formData, setFormData] = useState<Partial<FinishedGoodItem>>({
    name: '',
    color: '',
    sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 },
    sellingPrice: 0,
    productionCost: 0,
    minThreshold: 0
  });

  const [mainCatFormData, setMainCatFormData] = useState({ name: '' });
  const [subCatFormData, setSubCatFormData] = useState({ name: '' });

  const handleOpenModal = (item?: FinishedGoodItem) => {
    if (item) {
        setEditingItem(item);
        setFormData(item);
    } else {
        setEditingItem(null);
        setFormData({ name: '', color: '', sizes: { S: 0, M: 0, L: 0, XL: 0, XXL: 0 }, sellingPrice: 0, productionCost: 0, minThreshold: 0 });
    }
    setIsModalOpen(true);
  };

  const handleOpenMainCatModal = (cat?: FinishedGoodMainCategory) => {
    if (cat) {
        setEditingMainCat(cat);
        setMainCatFormData({ name: cat.name });
    } else {
        setEditingMainCat(null);
        setMainCatFormData({ name: '' });
    }
    setIsMainCatModalOpen(true);
  };

  const handleOpenSubCatModal = (cat?: FinishedGoodSubCategory) => {
    if (cat) {
        setEditingSubCat(cat);
        setSubCatFormData({ name: cat.name });
    } else {
        setEditingSubCat(null);
        setSubCatFormData({ name: '' });
    }
    setIsSubCatModalOpen(true);
  };

  const handleSizeChange = (size: keyof SizeVariants, value: number) => {
      setFormData(prev => ({
          ...prev,
          sizes: {
              ...prev.sizes!,
              [size]: value
          }
      }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMainId || !selectedSubId) return;

    const totalQuantity = Object.values(formData.sizes || {}).reduce((a: number, b: number) => a + (b || 0), 0) as number;
    const finalItem = {
        ...formData,
        id: editingItem?.id || 'fgi' + Math.random().toString(36).substr(2, 9),
        totalQuantity,
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser?.name || 'النظام'
    } as FinishedGoodItem;

    updateFinishedGood(selectedMainId, selectedSubId, finalItem);
    addLog({ 
        user: currentUser?.name || 'غير معروف', 
        action: editingItem ? 'تعديل منتج جاهز' : 'إضافة منتج جاهز', 
        module: 'المخزون', 
        target: finalItem.name, 
        details: `${editingItem ? 'تحديث' : 'إضافة'} عنصر في ${selectedMain?.name} > ${selectedSub?.name}` 
    });
    setIsModalOpen(false);
  };

  const handleMainCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMainCat) updateFinishedGoodMainCategory(editingMainCat.id, mainCatFormData.name);
    else addFinishedGoodMainCategory(mainCatFormData.name);
    setIsMainCatModalOpen(false);
  };

  const handleSubCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMainId) return;
    if (editingSubCat) updateFinishedGoodSubCategory(selectedMainId, editingSubCat.id, subCatFormData.name);
    else addFinishedGoodSubCategory(selectedMainId, subCatFormData.name);
    setIsSubCatModalOpen(false);
  };

  const handleDeleteItem = (itemId: string, name: string) => {
      if (window.confirm(`حذف ${name}؟`)) {
          deleteFinishedGoodItem(selectedMainId, selectedSubId, itemId);
          addLog({ user: currentUser?.name || 'غير معروف', action: 'حذف منتج جاهز', module: 'المخزون', target: name, details: `حذف من ${selectedMain?.name} > ${selectedSub?.name}` });
      }
  };

  const handleDeleteMainCategory = (id: string, name: string) => {
      if (window.confirm(`حذف خط الإنتاج "${name}"؟ سيتم حذف جميع الموديلات بداخله!`)) {
          deleteFinishedGoodMainCategory(id);
          if (selectedMainId === id) setSelectedMainId(finishedGoods.find(m => m.id !== id)?.id || '');
      }
  };

  const handleDeleteSubCategory = (id: string, name: string) => {
      if (window.confirm(`حذف الموديل "${name}"؟`)) {
          deleteFinishedGoodSubCategory(selectedMainId, id);
          if (selectedSubId === id) setSelectedSubId(selectedMain?.subCategories.find(s => s.id !== id)?.id || '');
      }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 h-[calc(100vh-280px)] min-h-[600px]">
        {/* Main Categories Panel */}
        <div className="lg:col-span-1 card-premium p-4 flex flex-col bg-white border-slate-200">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 italic">خطوط الإنتاج</h3>
                <button onClick={() => handleOpenMainCatModal()} className="text-slate-300 hover:text-blue-600 transition-colors">
                    <PlusCircle size={16} />
                </button>
            </div>
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {finishedGoods.map(mc => (
                    <div key={mc.id} className="relative group">
                        <button 
                            onClick={() => {
                                setSelectedMainId(mc.id);
                                setSelectedSubId(mc.subCategories[0]?.id || '');
                            }}
                            className={`w-full text-right px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${
                                selectedMainId === mc.id 
                                    ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20' 
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <FolderOpen size={14} className={selectedMainId === mc.id ? 'opacity-100' : 'opacity-40'} />
                            <span className="text-[10px] uppercase tracking-widest truncate">{mc.name}</span>
                        </button>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenMainCatModal(mc)} className="p-1 hover:text-blue-600 text-slate-400 bg-white shadow-sm rounded border border-slate-100"><Edit2 size={10}/></button>
                            <button onClick={() => handleDeleteMainCategory(mc.id, mc.name)} className="p-1 hover:text-red-500 text-slate-400 bg-white shadow-sm rounded border border-slate-100"><Trash2 size={10}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Sub Categories Panel */}
        <div className="lg:col-span-1 card-premium bg-slate-50/50 p-4 border-slate-200 flex flex-col">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 italic">الموديلات</h3>
                <button onClick={() => handleOpenSubCatModal()} className="text-slate-300 hover:text-pink-600 transition-colors">
                    <PlusCircle size={16} />
                </button>
            </div>
            <div className="space-y-2 overflow-y-auto pr-1 flex-1 custom-scrollbar">
                {selectedMain?.subCategories.map(sc => (
                    <div key={sc.id} className="relative group">
                        <button 
                            onClick={() => setSelectedSubId(sc.id)}
                            className={`w-full text-right px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                                selectedSubId === sc.id 
                                    ? 'bg-white border border-slate-200 text-pink-600 font-bold shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-100'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <Folder size={12} className={selectedSubId === sc.id ? 'opacity-100' : 'opacity-40'} />
                                <span className="text-[10px] uppercase font-bold tracking-widest truncate">{sc.name}</span>
                            </div>
                            <ChevronRight size={12} className={`opacity-40 ${selectedSubId === sc.id ? 'visible' : 'invisible group-hover:visible'} rotate-180`} />
                        </button>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenSubCatModal(sc)} className="p-1 hover:text-pink-600 text-slate-400 bg-white shadow-sm rounded border border-slate-100"><Edit2 size={10}/></button>
                            <button onClick={() => handleDeleteSubCategory(sc.id, sc.name)} className="p-1 hover:text-red-500 text-slate-400 bg-white shadow-sm rounded border border-slate-100"><Trash2 size={10}/></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Items Panel */}
        <div className="lg:col-span-4 card-premium overflow-hidden flex flex-col bg-white border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl flex-1 max-w-sm border border-slate-200 shadow-sm">
                    <Search size={14} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="البحث في التصاميم..." 
                        className="bg-transparent border-none outline-none text-[10px] uppercase font-bold tracking-widest w-full text-slate-900 placeholder-slate-300"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="btn-amber px-6 py-2 text-[10px] font-black uppercase tracking-widest"
                >
                    <Plus size={14} className="ml-2" />
                    <span>إضافة موديل</span>
                </button>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar">
                <table className="w-full text-right">
                    <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10">
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">الموديل والمواصفات</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">توزيع المقاسات</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">إجمالي المخزون</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">سعر البيع</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">المسؤول</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredItems.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{item.name}</span>
                                            {item.totalQuantity <= item.minThreshold && (
                                                <AlertCircle size={12} className="text-amber-500 animate-pulse" />
                                            )}
                                        </div>
                                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{item.color}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-center gap-1.5">
                                        {(Object.entries(item.sizes) as [keyof SizeVariants, number][]).map(([size, qty]) => (
                                            <div key={size} className="flex flex-col items-center bg-white border border-slate-100 px-2 py-1.5 rounded min-w-[36px] shadow-sm">
                                                <span className="text-[7px] font-black text-slate-300 uppercase tracking-widest leading-none mb-0.5">{size}</span>
                                                <span className={`text-[10px] font-black leading-none ${qty === 0 ? 'text-slate-100' : 'text-blue-600'}`}>{qty}</span>
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-xs font-bold ${item.totalQuantity <= item.minThreshold ? 'text-amber-500' : 'text-slate-900'}`}>
                                            {item.totalQuantity}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-300 tracking-widest uppercase italic">الهدف: {item.minThreshold}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-xs font-black text-slate-900">
                                    {item.sellingPrice} <span className="text-[8px] text-slate-400">ج.م</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <p className="text-[10px] font-black text-slate-700 italic tracking-tight capitalize">{item.updatedBy}</p>
                                        <button 
                                            onClick={() => { setSelectedItem(item); setIsHistoryModalOpen(true); }}
                                            className="text-[8px] text-blue-500 font-bold uppercase tracking-widest mt-0.5 hover:underline text-right"
                                        >
                                            تاريخ السجل
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex items-center justify-start gap-1">
                                        <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => handleDeleteItem(item.id, item.name)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredItems.length === 0 && (
                    <div className="p-20 text-center">
                        <Package size={40} className="mx-auto mb-4 text-slate-100" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 italic">لا توجد محصولات في هذا القسم</p>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsHistoryModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden text-right">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">سجل المنتج</h3>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{selectedItem.name}</p>
                    </div>
                    <button type="button" onClick={() => setIsHistoryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-400"/></button>
                </div>
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        {selectedItem.history?.length > 0 ? selectedItem.history.map((entry, idx) => (
                            <div key={entry.id} className="relative pr-8 before:absolute before:right-[11px] before:top-2 before:bottom-0 before:w-0.5 before:bg-slate-100 last:before:hidden">
                                <div className={`absolute right-0 top-0 w-6 h-6 rounded-full flex items-center justify-center shadow-sm z-10 ${
                                    entry.action === 'Created' ? 'bg-blue-500 text-white' :
                                    entry.action === 'Stock In' ? 'bg-emerald-500 text-white' :
                                    entry.action === 'Stock Out' ? 'bg-rose-500 text-white' :
                                    'bg-slate-500 text-white'
                                }`}>
                                    {entry.action === 'Created' && <Package size={12} />}
                                    {entry.action === 'Stock In' && <ArrowUpRight size={12} />}
                                    {entry.action === 'Stock Out' && <ArrowDownRight size={12} />}
                                    {entry.action === 'Other' && <Clock size={12} />}
                                </div>
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 italic">{entry.action}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">{new Date(entry.timestamp).toLocaleString('ar-EG')}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] text-slate-500 font-bold italic">بواسطة: <span className="text-slate-900">{entry.user}</span></p>
                                        {entry.change && (
                                            <span className={`text-[10px] font-black ${Number(entry.change) > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                {Number(entry.change) > 0 ? '+' : ''}{entry.change}
                                            </span>
                                        )}
                                    </div>
                                    {entry.notes && (
                                        <p className="mt-2 text-[10px] text-slate-400 italic font-bold border-t border-slate-200/50 pt-2">{entry.notes}</p>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-12">
                                <History size={48} className="mx-auto text-slate-100 mb-4" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">لا يوجد سجل حركات لهذا العنصر</p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                    <button onClick={() => setIsHistoryModalOpen(false)} className="w-full btn-secondary text-[10px] uppercase tracking-widest font-black">إإغلاق</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }} 
                className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-right"
            >
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{editingItem ? 'تعديل بيانات الموديل' : 'إضافة موديل جديد'}</h3>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><X size={18}/></button>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                        <div className="space-y-4">
                            <div>
                                <label className="label-style">اسم الموديل</label>
                                <input required type="text" className="input-style" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: تيشرت أوفر سايز" />
                            </div>
                            <div>
                                <label className="label-style">اللون / التصميم</label>
                                <input required type="text" className="input-style" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="مثال: أسود كلاسيك" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-style">سعر البيع (ج.م)</label>
                                    <input required type="number" className="input-style" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: Number(e.target.value)})} />
                                </div>
                                <div>
                                    <label className="label-style">تكلفة الإنتاج</label>
                                    <input required type="number" className="input-style" value={formData.productionCost} onChange={e => setFormData({...formData, productionCost: Number(e.target.value)})} />
                                </div>
                            </div>
                            <div>
                                <label className="label-style">حد الأمان للمخزون</label>
                                <input required type="number" className="input-style" value={formData.minThreshold} onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})} />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h4 className="text-[10px] uppercase font-black text-slate-300 tracking-[0.3em] border-b border-slate-100 pb-3 italic">توزيع المقاسات</h4>
                            <div className="grid grid-cols-5 gap-3">
                                {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                                    <div key={size}>
                                        <label className="block text-[8px] font-black text-center mb-1 text-slate-400 uppercase tracking-widest">{size}</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-3 text-center text-xs font-black focus:ring-2 focus:ring-blue-600/20 transition-all text-slate-900 outline-none"
                                            value={formData.sizes ? (formData.sizes as any)[size] : 0}
                                            onChange={e => handleSizeChange(size as any, Number(e.target.value))}
                                        />
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-dashed border-slate-200 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 italic">إجمالي القطع في المانيفست</p>
                                <p className="text-3xl font-black text-blue-600 tracking-tighter">{Object.values(formData.sizes || {}).reduce((a: number, b: number) => a + (b || 0), 0)}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary text-[10px] uppercase tracking-widest font-black">إلغاء</button>
                        <button type="submit" className="flex-1 btn-amber text-[10px] uppercase tracking-widest font-black shadow-lg shadow-amber-500/10 transition-all">{editingItem ? 'تحديث السجل' : 'حفظ الموديل'}</button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Category Modal */}
      <AnimatePresence>
        {isMainCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-right">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMainCatModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-8">
                <form onSubmit={handleMainCatSubmit}>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic mb-6">{editingMainCat ? 'تعديل خط إنتاج' : 'إضافة خط إنتاج جديد'}</h3>
                    <label className="label-style">اسم خط الإنتاج</label>
                    <input required type="text" className="input-style mb-6" value={mainCatFormData.name} onChange={e => setMainCatFormData({name: e.target.value})} placeholder="مثال: ملابس رجالي" />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setIsMainCatModalOpen(false)} className="flex-1 btn-secondary text-[10px] uppercase tracking-widest font-black">إلغاء</button>
                        <button type="submit" className="flex-1 btn-amber text-[10px] uppercase tracking-widest font-black">تأكيد</button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sub Category Modal */}
      <AnimatePresence>
        {isSubCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-right">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsSubCatModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-8">
                <form onSubmit={handleSubCatSubmit}>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic mb-2">{editingSubCat ? 'تعديل موديل' : 'إضافة موديل جديد'}</h3>
                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black italic mb-6">يتبع خط: {selectedMain?.name}</p>
                    <label className="label-style">اسم الموديل</label>
                    <input required type="text" className="input-style mb-6" value={subCatFormData.name} onChange={e => setSubCatFormData({name: e.target.value})} placeholder="مثال: كولكشن شتوي 2024" />
                    <div className="flex gap-3">
                        <button type="button" onClick={() => setIsSubCatModalOpen(false)} className="flex-1 btn-secondary text-[10px] uppercase tracking-widest font-black">إلغاء</button>
                        <button type="submit" className="flex-1 btn-amber text-[10px] uppercase tracking-widest font-black">تأكيد</button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .label-style { @apply block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 italic; }
        .input-style { @apply w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 outline-none transition-all text-slate-900 font-bold; }
        .btn-amber { @apply px-4 py-3 bg-amber-400 text-amber-950 rounded-xl font-black hover:bg-amber-300 transition-all shadow-md shadow-amber-400/20 active:scale-95; }
        .btn-secondary { @apply px-4 py-3 rounded-xl border border-slate-200 text-slate-400 font-bold hover:bg-slate-50 transition-all; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-100 rounded-full; }
      `}</style>
    </div>
  );
}
