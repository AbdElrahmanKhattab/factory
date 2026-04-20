import React from 'react';
import { useDashboard } from '../context/DashboardContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Clock, 
  ArrowRight,
  DollarSign,
  ShoppingCart,
  Box,
  BarChart3,
  Archive,
  ArrowLeft
} from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardHome() {
  const { products, rawMaterials, finishedGoods, activityLogs, employeeExpenses, operationalExpenses, marketingExpenses, orders } = useDashboard();
  const navigate = useNavigate();
  
  // Calculate dynamic stats for the current month
  const now = new Date();
  const currentMonthStr = now.toISOString().substring(0, 7);
  
  const currentMonthExpenses = 
    employeeExpenses.filter(e => e.month === currentMonthStr).reduce((sum, e) => sum + e.monthlySalary, 0) +
    operationalExpenses.filter(e => e.date.startsWith(currentMonthStr)).reduce((sum, e) => sum + e.amount, 0) +
    marketingExpenses.filter(e => e.startDate.startsWith(currentMonthStr)).reduce((sum, e) => sum + e.amount, 0);

  const currentMonthRevenue = orders.filter(o => o.date.startsWith(currentMonthStr)).reduce((sum, o) => sum + o.totalAmount, 0);
  const currentMonthOrdersCount = orders.filter(o => o.date.startsWith(currentMonthStr)).length;

  const totalRawItems = rawMaterials.reduce((acc, cat) => acc + cat.items.reduce((sum, item) => sum + item.quantity, 0), 0);
  const totalFinishedUnits = finishedGoods.reduce((acc, mc) => acc + mc.subCategories.reduce((sum, sc) => sum + sc.items.reduce((iSum, item) => iSum + item.totalQuantity, 0), 0), 0);

  const lowStockItems = [
    ...rawMaterials.flatMap(c => c.items.filter(i => i.quantity <= i.minThreshold).map(i => ({ ...i, type: 'Raw' }))),
    ...finishedGoods.flatMap(mc => mc.subCategories.flatMap(sc => sc.items.filter(i => i.totalQuantity <= i.minThreshold).map(i => ({ ...i, type: 'Finished' }))))
  ];

  const stats = [
    { label: 'المنتجات النشطة', value: products.length, icon: Box, color: 'blue' },
    { label: 'إجمالي المواد الخام', value: totalRawItems.toLocaleString(), icon: Archive, color: 'indigo' },
    { label: 'وحدات جاهزة بالكامل', value: totalFinishedUnits.toLocaleString(), icon: Package, color: 'purple' },
    { label: 'إيرادات الشهر الحالي', value: currentMonthRevenue.toLocaleString(), icon: DollarSign, color: 'emerald' },
    { label: 'المصروفات التشغيلية', value: currentMonthExpenses.toLocaleString(), icon: TrendingDown, color: 'rose' },
    { label: 'صافي الربح التقديري', value: (currentMonthRevenue - currentMonthExpenses).toLocaleString(), icon: TrendingUp, color: 'emerald' },
    { label: 'إجمالي الطلبات', value: currentMonthOrdersCount, icon: ShoppingCart, color: 'blue' },
  ];

  const handleLowStockClick = (item: any) => {
    navigate(item.type === 'Raw' ? '/inventory/raw' : '/inventory/finished');
  };

  return (
    <div className="space-y-8 max-w-[1400px]" dir="rtl">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">لوحة التحكم التنفيذية</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1 italic">مراقبة المصنع والعمليات المالية في الوقت الفعلي</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-4 py-2 rounded-xl uppercase italic">الحالة: متصل</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="card-premium group p-6 border-slate-200 bg-white"
          >
            <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{stat.label}</span>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500">
                    <stat.icon size={16} />
                </div>
            </div>
            <div className="flex items-end gap-2">
                <p className="text-2xl font-black text-slate-900 italic tracking-tighter">{stat.value}</p>
                {stat.label.includes('إيرادات') || stat.label.includes('مصروفات') || stat.label.includes('ربح') ? (
                    <span className="text-[10px] text-slate-400 mb-1.5 font-black uppercase italic">ج.م</span>
                ) : (
                    <span className="text-[10px] text-slate-400 mb-1.5 font-black uppercase italic">وحدة</span>
                )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
            <div className="card-premium h-full flex flex-col overflow-hidden bg-white border-slate-200 shadow-sm shadow-slate-100">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-3 italic text-right">
                        <Clock size={16} className="text-blue-600" />
                        سجل الأنشطة المباشر
                    </h3>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-[9px] font-black py-2 px-4 bg-slate-100 rounded-xl text-slate-500 hover:text-blue-600 transition-all uppercase tracking-widest italic"
                    >
                        مراجعة الكل
                    </motion.button>
                </div>
                <div className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto custom-scrollbar flex-1 bg-white">
                    {activityLogs.length > 0 ? activityLogs.slice(0, 10).map((log, idx) => (
                        <div key={idx} className="p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-blue-600 shadow-inner italic group-hover:bg-blue-50 group-hover:border-blue-100 transition-all">
                                    {log.user.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="text-right">
                                    <p className="text-[11px] font-bold text-slate-700 leading-relaxed">
                                        <span className={
                                            log.action.includes('إضافة') || log.action.includes('Added') ? 'text-emerald-500' :
                                            log.action.includes('حذف') || log.action.includes('Deleted') ? 'text-rose-500' : 'text-blue-600'
                                        }>{log.action}</span>: {log.target}
                                    </p>
                                    <p className="text-[9px] text-slate-400 mt-1 uppercase tracking-tighter italic font-black">
                                        {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })} · {new Date(log.timestamp).toLocaleDateString('ar-EG')}
                                    </p>
                                </div>
                            </div>
                            <ArrowLeft size={14} className="text-slate-200 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                        </div>
                    )) : (
                        <div className="p-20 text-center flex flex-col items-center">
                            <Clock size={40} className="text-slate-100 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">لا توجد أنشطة مسجلة</p>
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="card-premium border-slate-200 overflow-hidden h-full flex flex-col bg-white shadow-sm shadow-slate-100 group/panel">
                <div className="p-6 border-b border-rose-50 flex justify-between items-center bg-rose-50/30">
                    <h3 className="text-[10px] font-black text-rose-500 flex items-center gap-3 uppercase tracking-widest italic text-right">
                        <AlertTriangle size={16} />
                        نقص المخزون الحرج
                    </h3>
                    <span className="text-[9px] font-black px-3 py-1 bg-rose-100 text-rose-600 rounded-lg italic">{lowStockItems.length} تنبيه</span>
                </div>
                <div className="divide-y divide-rose-50 flex-1 overflow-y-auto custom-scrollbar bg-white">
                    {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
                        <motion.div 
                            key={idx} 
                            onClick={() => handleLowStockClick(item)}
                            className="p-6 flex justify-between items-center bg-transparent hover:bg-rose-50/30 transition-all group cursor-pointer"
                        >
                            <div className="text-right">
                                <p className="text-xs font-black text-slate-900 italic tracking-tight italic">{(item as any).nameAr || item.name}</p>
                                <p className="text-[9px] text-slate-400 uppercase tracking-widest mt-2 font-black">المخزون الحالي: <span className="text-rose-500 font-extrabold italic">{item.type === 'Raw' ? (item as any).quantity : (item as any).totalQuantity}</span> <span className="text-[8px]">/ {item.minThreshold}</span></p>
                            </div>
                            <div className="p-2 rounded-xl bg-rose-50 text-rose-400 group-hover:bg-rose-500 group-hover:text-white transition-all transform group-hover:scale-110 group-hover:-translate-x-1 shadow-sm">
                                <ArrowLeft size={14} />
                            </div>
                        </motion.div>
                    )) : (
                        <div className="p-20 text-center flex flex-col items-center">
                            <Package size={40} className="text-slate-100 mb-4" />
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 italic">سلسلة الإمداد مستقرة تماماً</p>
                        </div>
                    )}
                </div>
                {lowStockItems.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-100">
                        <button 
                            onClick={() => navigate('/inventory')}
                            className="w-full py-4 rounded-2xl bg-white border border-slate-200 text-[10px] font-black text-slate-400 hover:text-blue-600 hover:border-blue-100 hover:shadow-lg transition-all uppercase tracking-widest italic flex items-center justify-center gap-2"
                        >
                            عرض تقرير المخزون الكامل
                            <ArrowLeft size={12} />
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-slate-100 rounded-full; }
      `}</style>
    </div>
  );
}

// Page component end

