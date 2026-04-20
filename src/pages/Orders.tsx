import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Phone, 
  Mail, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet,
  Calendar,
  User,
  X,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';

export default function Orders() {
  const { orders } = useDashboard();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'Shipped': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'Delivered': return 'bg-green-100 text-green-600 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-600 border-red-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Pending': return 'قيد الانتظار';
      case 'Shipped': return 'تم الشحن';
      case 'Delivered': return 'تم التوصيل';
      case 'Cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <header className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-3">
            <ShoppingBag className="text-blue-600" />
            إدارة الطلبات
          </h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">تتبع ومعالجة طلبات العملاء</p>
        </div>
      </header>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-4 flex-1">
          <div className="relative max-w-sm w-full">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="البحث في الطلبات (الاسم أو الرقم)..."
              className="w-full bg-white border border-slate-200 rounded-2xl py-3 pr-10 pl-4 text-slate-900 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-slate-200 rounded-2xl py-3 px-6 text-slate-500 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all min-w-[180px] appearance-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">كل الحالات</option>
            <option value="Pending">قيد الانتظار</option>
            <option value="Shipped">تم الشحن</option>
            <option value="Delivered">تم التوصيل</option>
            <option value="Cancelled">تم الإلغاء</option>
          </select>
        </div>
      </div>

      <div className="card-premium overflow-hidden border-slate-200 bg-white">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-400 italic">رقم الطلب</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-400">العميل</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-400">التاريخ</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-400">الإجمالي</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-400">طريقة الدفع</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-400">الحالة</th>
                <th className="px-6 py-5 text-[10px] uppercase tracking-widest font-black text-slate-400 text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredOrders.map((order) => (
                <motion.tr 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={order.id} 
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4">
                    <span className="text-blue-600 font-bold text-xs">#{order.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-slate-900 font-black text-xs uppercase tracking-tight">{order.customerName}</span>
                      <span className="text-slate-400 text-[10px] font-bold">{order.customerEmail}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
                      <Calendar size={14} className="text-slate-300" />
                      {order.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-900 font-black text-xs italic tracking-tighter">{order.totalAmount} <span className="text-[10px] text-slate-400 not-italic">ج.م</span></span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest italic">
                      {order.paymentMethod === 'Credit Card' && <CreditCard size={14} className="text-blue-600" />}
                      {order.paymentMethod === 'InstaPay' && <Smartphone size={14} className="text-purple-600" />}
                      {order.paymentMethod === 'Bank Transfer' && <Building2 size={14} className="text-indigo-600" />}
                      {order.paymentMethod === 'Wallet Transfer' && <Wallet size={14} className="text-emerald-600" />}
                      {order.paymentMethod === 'Cash' && <Wallet size={14} className="text-amber-600" />}
                      {order.paymentMethod === 'InstaPay' ? 'إنستا باي' : 
                       order.paymentMethod === 'Cash' ? 'كاش' :
                       order.paymentMethod === 'Credit Card' ? 'بطاقة ائتمان' :
                       order.paymentMethod === 'Bank Transfer' ? 'تحويل بنكي' :
                       order.paymentMethod === 'Wallet Transfer' ? 'محفظة' : order.paymentMethod}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
                <ShoppingBag size={48} className="text-slate-100 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">لا توجد طلبات مطابقة للبحث</p>
            </div>
        )}
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-2xl text-right"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h2 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                  تفاصيل الطلب - <span className="text-blue-600">#{selectedOrder.id}</span>
                </h2>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-900 transition-all">
                  <X size={20} />
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                       {/* <User size={12} className="text-blue-600" /> */}
                       معلومات العميل
                    </h3>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="text-slate-300" size={16} />
                        <span className="text-slate-900 font-bold">{selectedOrder.customerName}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="text-slate-300" size={16} />
                        <span className="text-slate-500 text-sm font-bold">{selectedOrder.customerEmail}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="text-slate-300" size={16} />
                        <span className="text-slate-500 text-sm font-bold">{selectedOrder.customerPhone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                       {/* <FileText size={12} className="text-blue-600" /> */}
                       حالة الدفع
                    </h3>
                    <div className="bg-blue-600 p-8 rounded-3xl text-white flex flex-col justify-center shadow-xl shadow-blue-600/20">
                       <span className="text-3xl font-black tracking-tighter italic">{selectedOrder.totalAmount} ج.م</span>
                       <span className="text-white/70 text-[10px] font-black uppercase tracking-widest mt-2">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 italic">
                     {/* <ShoppingBag size={12} className="text-blue-600" /> */}
                     العناصر المطلوبة
                  </h3>
                  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
                    <table className="w-full text-right">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">المنتج</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">الكمية</th>
                          <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">السعر</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {selectedOrder.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-6 py-4 text-xs text-slate-900 font-black uppercase tracking-tight">{item.name}</td>
                            <td className="px-6 py-4 text-xs text-slate-500 font-bold text-center">x{item.quantity}</td>
                            <td className="px-6 py-4 text-xs text-slate-900 font-black text-left italic">{item.price} ج.م</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <button className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl flex items-center justify-center gap-3 transition-all uppercase tracking-widest text-xs shadow-xl shadow-slate-900/10 active:scale-[0.98]">
                  <Download size={18} />
                  تحميل الفاتورة (PDF)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-100 rounded-full; }
      `}</style>
    </div>
  );
}
