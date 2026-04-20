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
  Layers,
  X,
  Package,
  Settings2,
  History,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RawMaterialItem, RawMaterialCategory } from '../types';

export default function InventoryRaw() {
  const { rawMaterials, updateRawMaterial, deleteRawMaterialItem, addLog, currentUser, addRawMaterialCategory, updateRawMaterialCategory, deleteRawMaterialCategory } = useDashboard();
  const [selectedCatId, setSelectedCatId] = useState(rawMaterials[0]?.id || '');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<RawMaterialItem | null>(null);
  const [editingItem, setEditingItem] = useState<RawMaterialItem | null>(null);
  const [editingCategory, setEditingCategory] = useState<RawMaterialCategory | null>(null);

  const selectedCategory = rawMaterials.find(c => c.id === selectedCatId);
  const filteredItems = selectedCategory?.items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())) || [];

  const [formData, setFormData] = useState<Partial<RawMaterialItem>>({
    name: '',
    unit: 'متر',
    quantity: 0,
    minThreshold: 0,
    costPerUnit: 0,
    supplier: ''
  });

  const [catFormData, setCatFormData] = useState({
    name: ''
  });

  const handleOpenModal = (item?: RawMaterialItem) => {
    if (item) {
        setEditingItem(item);
        setFormData(item);
    } else {
        setEditingItem(null);
        setFormData({ name: '', unit: 'متر', quantity: 0, minThreshold: 0, costPerUnit: 0, supplier: '' });
    }
    setIsModalOpen(true);
  };

  const handleOpenCatModal = (cat?: RawMaterialCategory) => {
    if (cat) {
        setEditingCategory(cat);
        setCatFormData({ name: cat.name });
    } else {
        setEditingCategory(null);
        setCatFormData({ name: '' });
    }
    setIsCatModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCatId) return;

    const finalItem = {
        ...formData,
        id: editingItem?.id || 'rmi' + Math.random().toString(36).substr(2, 9),
        lastUpdated: new Date().toISOString(),
        updatedBy: currentUser?.name || 'النظام'
    } as RawMaterialItem;

    updateRawMaterial(selectedCatId, finalItem);
    addLog({ 
        user: currentUser?.name || 'غير معروف', 
        action: editingItem ? 'تعديل مادة خام' : 'إضافة مادة خام', 
        module: 'المخزون', 
        target: finalItem.name, 
        details: `${editingItem ? 'تحديث' : 'إضافة'} عنصر في قسم ${selectedCategory?.name}` 
    });
    setIsModalOpen(false);
  };

  const handleCatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
        updateRawMaterialCategory(editingCategory.id, catFormData.name);
    } else {
        addRawMaterialCategory(catFormData.name);
    }
    setIsCatModalOpen(false);
  };

  const handleDeleteItem = (itemId: string, name: string) => {
      if (window.confirm(`هل أنت متأكد من حذف ${name}؟`)) {
          deleteRawMaterialItem(selectedCatId, itemId);
          addLog({ user: currentUser?.name || 'غير معروف', action: 'حذف مادة خام', module: 'المخزون', target: name, details: `حذف من قسم ${selectedCategory?.name}` });
      }
  };

  const handleDeleteCategory = (id: string, name: string) => {
      if (window.confirm(`هل أنت متأكد من حذف قسم "${name}"؟ سيتم حذف جميع المواد بداخلها!`)) {
          deleteRawMaterialCategory(id);
          if (selectedCatId === id) setSelectedCatId(rawMaterials.find(c => c.id !== id)?.id || '');
      }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 h-[calc(100vh-280px)] min-h-[600px]">
        {/* Categories Panel */}
        <div className="card-premium p-4 flex flex-col bg-white border-slate-200">
            <div className="flex items-center justify-between mb-6 px-2">
                <h3 className="font-bold text-[10px] uppercase tracking-widest text-slate-400 italic">الأقسام</h3>
                <button 
                  onClick={() => handleOpenCatModal()}
                  className="text-slate-300 hover:text-blue-600 transition-colors"
                >
                    <PlusCircle size={16} />
                </button>
            </div>
            <div className="space-y-2 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {rawMaterials.map(cat => (
                    <div key={cat.id} className="relative group">
                        <button 
                            onClick={() => setSelectedCatId(cat.id)}
                            className={`w-full text-right px-4 py-3 rounded-xl flex items-center justify-between transition-all ${
                                selectedCatId === cat.id 
                                    ? 'bg-blue-600 text-white font-black shadow-lg shadow-blue-500/20' 
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <Layers size={14} className={selectedCatId === cat.id ? 'opacity-100' : 'opacity-40'} />
                                <span className="text-[10px] uppercase tracking-widest leading-none">{cat.name}</span>
                            </div>
                            <span className={`text-[9px] font-black ${selectedCatId === cat.id ? 'bg-white/20' : 'bg-slate-100'} px-2 py-0.5 rounded`}>
                                {cat.items.length}
                            </span>
                        </button>
                        <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleOpenCatModal(cat)} className="p-1 hover:text-blue-600 text-slate-400 bg-white shadow-sm rounded border border-slate-100">
                                <Edit2 size={10} />
                            </button>
                            <button onClick={() => handleDeleteCategory(cat.id, cat.name)} className="p-1 hover:text-red-500 text-slate-400 bg-white shadow-sm rounded border border-slate-100">
                                <Trash2 size={10} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* Items Panel */}
        <div className="lg:col-span-3 card-premium overflow-hidden flex flex-col bg-white border-slate-200">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl flex-1 max-w-sm border border-slate-200 shadow-sm">
                    <Search size={14} className="text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="البحث في المخزون..." 
                        className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-full text-slate-900 placeholder-slate-300"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="btn-amber px-6 py-2 text-[10px] font-black uppercase tracking-widest"
                >
                    <Plus size={14} className="ml-2" />
                    <span>إضافة عنصر</span>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-right">
                    <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10">
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">معلومات المادة</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">الوحدة</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">الكمية</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">التكلفة</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">المورد</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">المسؤول</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">إجراءات</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {filteredItems.map(item => (
                            <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                            {item.name}
                                            {item.quantity <= item.minThreshold && (
                                                <AlertCircle size={12} className="text-amber-500 animate-pulse" />
                                            )}
                                        </p>
                                        <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-1 font-bold italic">تعديل بواسطة {item.updatedBy}</p>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.unit}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex flex-col items-center">
                                        <span className={`text-xs font-black tracking-tight ${item.quantity <= item.minThreshold ? 'text-amber-500' : 'text-slate-900'}`}>
                                            {item.quantity}
                                        </span>
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">الحد الأدنى: {item.minThreshold}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center text-xs font-black text-slate-900">{item.costPerUnit} <span className="text-[8px] text-slate-400">ج.م</span></td>
                                <td className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.supplier || '-'}</td>
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
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-300 italic">لا توجد مواد خام</p>
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
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">سجل المادة</h3>
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
                    <button onClick={() => setIsHistoryModalOpen(false)} className="w-full btn-secondary text-[10px] uppercase tracking-widest font-black">إغلاق</button>
                </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-lg bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-right">
                <form onSubmit={handleSubmit}>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{editingItem ? 'تعديل البيانات' : 'إضافة مادة جديدة'}</h3>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-400"/></button>
                    </div>
                    <div className="p-8 space-y-5">
                        <div>
                            <label className="label-style">اسم المادة</label>
                            <input required type="text" className="input-style" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: قماش قطن ليكرا" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-style">وحدة القياس</label>
                                <input required type="text" className="input-style" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="متر / كجم" />
                            </div>
                            <div>
                                <label className="label-style">تكلفة الوحدة (ج.م)</label>
                                <input required type="number" className="input-style" value={formData.costPerUnit} onChange={e => setFormData({...formData, costPerUnit: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-style">الكمية الحالية</label>
                                <input required type="number" className="input-style" value={formData.quantity} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})} />
                            </div>
                            <div>
                                <label className="label-style">حد الأمان (تنبيه)</label>
                                <input required type="number" className="input-style" value={formData.minThreshold} onChange={e => setFormData({...formData, minThreshold: Number(e.target.value)})} />
                            </div>
                        </div>
                        <div>
                            <label className="label-style">المورد</label>
                            <input type="text" className="input-style" value={formData.supplier} onChange={e => setFormData({...formData, supplier: e.target.value})} placeholder="اسم شركة التوريد" />
                        </div>
                    </div>
                    <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary text-[10px] uppercase tracking-widest font-black">إلغاء</button>
                        <button type="submit" className="flex-1 btn-amber text-[10px] uppercase tracking-widest font-black shadow-lg shadow-amber-500/10 transition-all">{editingItem ? 'تحديث السجل' : 'تأكيد الإضافة'}</button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Modal */}
      <AnimatePresence>
        {isCatModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsCatModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden text-right">
                <form onSubmit={handleCatSubmit}>
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{editingCategory ? 'تعديل قسم' : 'إضافة قسم جديد'}</h3>
                        <button type="button" onClick={() => setIsCatModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors"><X size={18} className="text-slate-400"/></button>
                    </div>
                    <div className="p-8">
                        <label className="label-style">اسم القسم</label>
                        <input required type="text" className="input-style" value={catFormData.name} onChange={e => setCatFormData({name: e.target.value})} placeholder="مثال: أقمشة صيفية" />
                    </div>
                    <div className="p-6 border-t border-slate-100 flex gap-3 bg-slate-50/50">
                        <button type="button" onClick={() => setIsCatModalOpen(false)} className="flex-1 btn-secondary text-[10px] uppercase tracking-widest font-black">إلغاء</button>
                        <button type="submit" className="flex-1 btn-amber text-[10px] uppercase tracking-widest font-black transition-all">{editingCategory ? 'حفظ التعديلات' : 'إضافة القسم'}</button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .label-style { @apply block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2 px-1 italic; }
        .input-style { @apply w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all text-slate-900 placeholder-slate-200 outline-none shadow-sm font-bold; }
        .btn-amber { @apply px-4 py-3 bg-amber-400 text-amber-950 rounded-xl font-black hover:bg-amber-300 active:scale-95 transition-all shadow-md shadow-amber-400/20; }
        .btn-secondary { @apply px-4 py-3 rounded-xl border border-slate-200 text-slate-400 font-bold hover:bg-slate-50 transition-all; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-100 rounded-full; }
      `}</style>
    </div>
  );
}
