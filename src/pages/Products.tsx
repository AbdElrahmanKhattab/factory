import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  X, 
  Image as ImageIcon,
  Check,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

export default function Products() {
  const { products, addProduct, updateProduct, deleteProduct, addProductCategory, deleteProductCategory, productCategories, addLog, currentUser } = useDashboard();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    nameEn: '',
    nameAr: '',
    category: '',
    price: 0,
    sku: '',
    description: '',
    status: 'Active',
    image: ''
  });

  const filteredProducts = products.filter(p => {
    const term = search.toLowerCase();
    const matchesSearch = (p.nameEn?.toLowerCase().includes(term) || p.nameAr?.toLowerCase().includes(term) || p.sku?.toLowerCase().includes(term));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData(product);
    } else {
      setEditingProduct(null);
      setFormData({
        nameEn: '',
        nameAr: '',
        category: productCategories[0] || '',
        price: 0,
        sku: '',
        description: '',
        status: 'Active',
        image: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addProductCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct(formData as Product);
      addLog({ user: currentUser?.name || 'مستخدم', action: 'تعديل منتج', module: 'Products', target: formData.nameAr || formData.nameEn!, details: `تم تحديث تفاصيل المنتج: ${formData.sku}` });
    } else {
      const newProduct = {
        ...formData,
        id: 'p' + Math.random().toString(36).substr(2, 9)
      } as Product;
      addProduct(newProduct);
      addLog({ user: currentUser?.name || 'مستخدم', action: 'إضافة منتج', module: 'Products', target: newProduct.nameAr || newProduct.nameEn, details: `تم إنشاء منتج جديد بكود: ${newProduct.sku}` });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
      if (window.confirm(`هل أنت متأكد من حذف ${name}؟`)) {
          deleteProduct(id);
          addLog({ user: currentUser?.name || 'مستخدم', action: 'حذف منتج', module: 'Products', target: name, details: `تم إزالة المنتج من قاعدة البيانات` });
      }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">كتالوج المنتجات</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-2 italic">إدارة خطوط التجزئة النشطة</p>
        </div>
        <div className="flex gap-3">
            <button 
              onClick={() => setIsCategoryModalOpen(true)}
              className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-blue-300 hover:text-blue-600 transition-all flex items-center gap-2 shadow-sm"
            >
              <Filter size={14} />
              <span>إدارة الفئات</span>
            </button>
            <button 
              onClick={() => handleOpenModal()}
              className="btn-amber"
            >
              <Plus size={16} className="ml-2" />
              <span>إضافة منتج جديد</span>
            </button>
        </div>
      </div>

      <div className="card-premium p-4 flex flex-wrap items-center justify-between gap-4 bg-white">
        <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl flex-1 border border-slate-100 shadow-inner group">
          <Search size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="البحث عن منتج بالكود أو الاسم..."
            className="bg-transparent border-none outline-none text-[10px] uppercase font-black tracking-widest w-full text-slate-900 placeholder-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <button className="flex items-center gap-3 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-blue-200 transition-all shadow-sm">
              <Filter size={14} className="text-blue-600" />
              <span>{categoryFilter === 'All' ? 'كل الفئات' : categoryFilter}</span>
              <ChevronDown size={14} />
            </button>
            <div className="absolute left-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button onClick={() => setCategoryFilter('All')} className="w-full px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-50 hover:text-blue-600 border-b border-slate-50 transition-colors">كل الفئات</button>
                {productCategories.map(cat => (
                    <button key={cat} onClick={() => setCategoryFilter(cat)} className="w-full px-5 py-3.5 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-blue-50 hover:text-blue-600 border-b border-slate-50 transition-colors">{cat}</button>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">المنتج</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">الفئة</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">السعر</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">الحالة</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">كود SKU</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">المسؤول</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition-all group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-300 overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                        {product.image ? (
                            <img src={product.image} alt={product.nameAr || product.nameEn} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                            <ImageIcon size={22} />
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-black text-slate-900 tracking-tight italic">{product.nameAr || product.nameEn}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{product.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="px-4 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-sm">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900 tracking-tighter italic">{product.price.toLocaleString()} ج.م</p>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${product.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${product.status === 'Active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`}></div>
                      {product.status === 'Active' ? 'نشط' : 'مخفي'}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-[11px] font-black font-mono text-slate-400 tracking-widest italic">
                    {product.sku}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                        <p className="text-[11px] font-black text-slate-700 italic tracking-tight">{product.addedBy}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{new Date(product.createdAt).toLocaleDateString('ar-EG')}</p>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-left">
                    <div className="flex items-center justify-start gap-2">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.nameAr || product.nameEn)}
                        className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-inner">
                <Search size={32} />
              </div>
              <h4 className="text-lg font-black text-slate-900 italic tracking-tighter">لم يتم العثور على منتجات</h4>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-2 italic">حاول تعديل معايير البحث أو الفلتر.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <form onSubmit={handleSubmit}>
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors">
                    <X size={24} className="text-slate-400" />
                  </button>
                </div>
                
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-6">
                        <div>
                            <label className="label-style">اسم المنتج (عربي)</label>
                            <input 
                                required
                                type="text"
                                className="input-style"
                                placeholder="تيشيرت قطن فاخر"
                                value={formData.nameAr}
                                onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="label-style">الفئة</label>
                                <div className="relative">
                                    <select 
                                        className="input-style appearance-none cursor-pointer pr-10"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {productCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <ChevronDown size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="label-style">الحالة</label>
                                <div className="relative">
                                    <select 
                                        className="input-style appearance-none cursor-pointer pr-10"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                    >
                                        <option value="Active">نشط</option>
                                        <option value="Hidden">مخفي</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="label-style">صورة المنتج</label>
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner">
                                     {formData.image ? (
                                         <img src={formData.image} alt="Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                     ) : (
                                         <ImageIcon size={24} className="text-slate-300" />
                                     )}
                                </div>
                                <label className="cursor-pointer bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-200 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-all shadow-sm">
                                    رفع صورة
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="label-style">السعر (ج.م)</label>
                                <input 
                                    required
                                    type="number"
                                    className="input-style font-mono"
                                    placeholder="0"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="label-style">كود SKU</label>
                                <input 
                                    required
                                    type="text"
                                    className="input-style"
                                    placeholder="TS-001"
                                    value={formData.sku}
                                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="label-style">الوصف</label>
                            <textarea 
                                className="input-style h-48 resize-none py-5"
                                placeholder="اكتب وصف المنتج هنا..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-8 py-4 rounded-2xl border border-slate-200 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-white hover:text-slate-600 transition-all italic active:scale-95"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 btn-amber py-4"
                  >
                    {editingProduct ? 'حفظ التغييرات' : 'إنشاء منتج'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Management Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCategoryModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white border border-slate-200 rounded-[2rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">إدارة الفئات</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-colors text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="اسم الفئة الجديدة..."
                    className="input-style flex-1 px-5"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <button onClick={handleAddCategory} className="bg-blue-600 text-white p-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar px-1">
                  {productCategories.map(cat => (
                    <div key={cat} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group shadow-sm hover:border-blue-200 transition-all">
                      <span className="text-slate-700 text-[11px] font-black uppercase tracking-widest italic">{cat}</span>
                      <button 
                        onClick={() => deleteProductCategory(cat)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
