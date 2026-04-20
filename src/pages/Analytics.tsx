import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Cell, PieChart, Pie, Legend, ReferenceLine
} from 'recharts';
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  Filter,
  TrendingUp,
  PieChart as PieIcon,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export default function Analytics() {
  const { 
    employeeExpenses, 
    operationalExpenses, 
    marketingExpenses,
    orders,
    finishedGoods
  } = useDashboard();
  
  const [timeRange, setTimeRange] = useState('6 أشهر');

  // Helper to get year-month string from ISO date or "YYYY-MM"
  const getMonthKey = (dateStr: string) => dateStr.substring(0, 7);

  // Generate last N months labels
  const months = useMemo(() => {
     const result = [];
     const now = new Date();
     const count = timeRange === '3 أشهر' ? 3 : timeRange === '6 أشهر' ? 6 : 12;
     
     for (let i = count - 1; i >= 0; i--) {
         const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
         result.push(d.toISOString().substring(0, 7));
     }
     return result;
  }, [timeRange]);

  const arabicMonthNames: {[key: string]: string} = {
    '01': 'يناير', '02': 'فبراير', '03': 'مارس', '04': 'أبريل', '05': 'مايو', '06': 'يونيو',
    '07': 'يوليو', '08': 'أغسطس', '09': 'سبتمبر', '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر'
  };

  const formatMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    return `${arabicMonthNames[month]} ${year}`;
  };

  const chartData = useMemo(() => {
    return months.map(mKey => {
        const rev = orders
            .filter(o => o.date.startsWith(mKey))
            .reduce((sum, o) => sum + o.totalAmount, 0);
        
        const emp = employeeExpenses
            .filter(e => e.month === mKey)
            .reduce((sum, e) => sum + e.monthlySalary, 0);
        
        const op = operationalExpenses
            .filter(e => e.date.startsWith(mKey))
            .reduce((sum, e) => sum + e.amount, 0);
        
        const mark = marketingExpenses
            .filter(e => e.startDate.startsWith(mKey))
            .reduce((sum, e) => sum + e.amount, 0);
        
        const totalExp = emp + op + mark;
        const totalOrders = orders.filter(o => o.date.startsWith(mKey)).length;

        return {
            month: formatMonthLabel(mKey),
            monthKey: mKey,
            revenue: rev,
            expenses: totalExp,
            profit: rev - totalExp,
            orders: totalOrders
        };
    });
  }, [months, orders, employeeExpenses, operationalExpenses, marketingExpenses]);

  const currentMonthData = chartData[chartData.length - 1] || { revenue: 0, expenses: 0, profit: 0, orders: 0, monthKey: '' };
  const lastMonthData = chartData[chartData.length - 2] || currentMonthData;
  
  const kFormatter = (num: number): string => {
      const absNum = Math.abs(num);
      if (absNum >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (absNum >= 1000) return (num / 1000).toFixed(1) + 'k';
      return Math.round(num).toString();
  };

  const expenseBreakdown = useMemo(() => {
    const mKey = currentMonthData.monthKey;
    const emps = employeeExpenses.filter(e => e.month === mKey).reduce((sum, e) => sum + e.monthlySalary, 0);
    const op = operationalExpenses.filter(e => e.date.startsWith(mKey)).reduce((sum, e) => sum + e.amount, 0);
    const mark = marketingExpenses.filter(e => e.startDate.startsWith(mKey)).reduce((sum, e) => sum + e.amount, 0);

    return [
      { name: 'رواتب موظفين', value: emps, color: '#3b82f6' },
      { name: 'تكاليف تشغيلية', value: op, color: '#8b5cf6' },
      { name: 'إنفاق تسويقي', value: mark, color: '#f43f5e' }
    ].filter(v => v.value > 0);
  }, [currentMonthData, employeeExpenses, operationalExpenses, marketingExpenses]);

  const topSellingRaw = useMemo(() => {
    const productCounts: {[key: string]: number} = {};
    orders.forEach(o => {
        o.items.forEach(item => {
            productCounts[item.name] = (productCounts[item.name] || 0) + item.quantity;
        });
    });
    return Object.entries(productCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
  }, [orders]);

  const stats = [
    { label: 'إجمالي الإيرادات', value: currentMonthData.revenue, lastValue: lastMonthData.revenue, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'إجمالي المصروفات', value: currentMonthData.expenses, lastValue: lastMonthData.expenses, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'صافي الربح', value: currentMonthData.profit, lastValue: lastMonthData.profit, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'حجم الطلبات', value: currentMonthData.orders, lastValue: lastMonthData.orders, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const handleExportPDF = async () => {
    const dashboard = document.getElementById('analytics-content');
    if (!dashboard) return;
    const canvas = await html2canvas(dashboard, { scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('تحليلات-المصنع.pdf');
  };

  return (
    <div className="space-y-8 pb-12" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">تحليلات الأداء المالي</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">مراقبة النمو المالي ومؤشرات الأداء</p>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-white p-1 rounded-2xl border border-slate-200 flex items-center shadow-sm">
                {['3 أشهر', '6 أشهر', '12 شهر'].map(r => (
                    <button 
                        key={r}
                        onClick={() => setTimeRange(r)}
                        className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === r ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}
                    >
                        {r}
                    </button>
                ))}
            </div>
            <button onClick={handleExportPDF} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 transition-all shadow-sm">
                <Download size={18} />
            </button>
        </div>
      </div>

      <div id="analytics-content" className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
                const delta = stat.lastValue !== 0 ? ((stat.value - stat.lastValue) / stat.lastValue) * 100 : 0;
                return (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        key={idx} 
                        className="card-premium p-6 group overflow-hidden relative"
                    >
                        <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-125 transition-transform duration-700`}></div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">{stat.label}</p>
                        <div className="flex items-end justify-between relative z-10">
                            <h4 className="text-2xl font-black text-slate-900 tracking-tighter italic">{stat.value.toLocaleString()} <span className="text-[10px] text-slate-400 not-italic ml-1">ج.م</span></h4>
                            <div className={`flex items-center gap-1 text-[10px] font-black px-2 py-1 rounded-lg ${delta >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                                {delta >= 0 ? <TrendingUp size={12}/> : <Activity size={12}/>}
                                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}%
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="card-premium p-8 h-[450px] bg-white border-slate-200">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] italic">مقارنة الإيرادات بالمصروفات</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase italic">الإيراد</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-slate-200"></div>
                            <span className="text-[9px] font-black text-slate-400 uppercase italic">المصروف</span>
                        </div>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 900}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 900}} tickFormatter={kFormatter} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontSize: '10px' }}
                            itemStyle={{ fontWeight: 900, textTransform: 'uppercase' }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                        <Area type="monotone" dataKey="expenses" stroke="#e2e8f0" strokeWidth={2} fillOpacity={0} strokeDasharray="5 5" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="card-premium p-8 h-[450px] bg-white border-slate-200">
                <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] italic mb-8">اتجاه صافي الأرباح</h3>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 900}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 9, fill: '#94a3b8', fontWeight: 900}} tickFormatter={kFormatter} />
                        <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #f1f5f9', borderRadius: '16px', fontSize: '10px' }} />
                        <ReferenceLine y={0} stroke="#cbd5e1" />
                        <Bar dataKey="profit" fill="#2563eb" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="card-premium p-8 h-[450px] bg-white border-slate-200">
                <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] italic mb-8">المنتجات الأكثر مبيعاً</h3>
                <div className="space-y-6 overflow-y-auto h-[320px] custom-scrollbar px-2">
                    {topSellingRaw.map((product, idx) => {
                        const maxCount = Math.max(...topSellingRaw.map(p => p.count));
                        const percentage = (product.count / maxCount) * 100;
                        return (
                            <div key={idx} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[11px] font-black text-slate-400 italic group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300">
                                            0{idx + 1}
                                        </div>
                                        <span className="text-[12px] font-black text-slate-700 italic tracking-tight">{product.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[12px] font-black text-slate-900 italic tracking-tighter">{product.count.toLocaleString()} <span className="text-[9px] text-slate-400 not-italic">قطعة</span></span>
                                    </div>
                                </div>
                                <div className="relative h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ duration: 1, delay: idx * 0.1 }}
                                        className="absolute top-0 left-0 h-full bg-blue-600 rounded-full"
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8 pt-5 border-t border-slate-50 text-center">
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic">نظام تتبع مبيعات المخزون النشط</p>
                </div>
            </div>

            <div className="card-premium p-8 h-[450px] bg-white border-slate-200 flex flex-col">
                <h3 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] italic mb-8">توزيع المصروفات (الشهر الحالي)</h3>
                <div className="flex-1 flex flex-col lg:flex-row items-center gap-6 overflow-hidden">
                    <div className="relative w-full lg:w-1/2 h-[260px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {expenseBreakdown.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '16px', 
                                        border: 'none', 
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                                        fontSize: '10px',
                                        fontWeight: 'black'
                                    }} 
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">الإجمالي</span>
                            <span className="text-xl font-black text-slate-900 tracking-tighter italic">
                                {Math.round(expenseBreakdown.reduce((sum, item) => sum + item.value, 0)).toLocaleString()}
                            </span>
                        </div>
                    </div>
                    
                    <div className="w-full lg:w-1/2 space-y-3 px-2">
                        {expenseBreakdown.map((item, idx) => {
                            const total = expenseBreakdown.reduce((sum, i) => sum + i.value, 0);
                            const percent = ((item.value / total) * 100).toFixed(1);
                            return (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                        <span className="text-[10px] font-black text-slate-500 uppercase italic tracking-wider">{item.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[11px] font-black text-slate-900 italic tracking-tight">{Math.round(item.value).toLocaleString()}</div>
                                        <div className="text-[8px] font-black text-blue-600 bg-blue-50 px-1.5 rounded-md inline-block">{percent}%</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="card-premium p-10 bg-slate-900 text-white lg:col-span-2 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-4 max-w-md">
                        <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-tight">مؤشرات الأداء السنوية</h3>
                        <p className="text-slate-400 text-sm font-bold leading-relaxed">تحليل التقدم الاستراتيجي بناءً على مستهدفات العام المالي 2026.</p>
                        <div className="flex gap-4 pt-4">
                            <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-blue-400">نمو بنسبة 24%</div>
                            <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest italic text-emerald-400">استقرار التكاليف</div>
                        </div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-8 max-w-lg">
                        {[
                            { label: 'تحقيق مستهدف المبيعات', progress: 78, color: 'bg-blue-600' },
                            { label: 'كفاءة سلسلة الإمداد', progress: 92, color: 'bg-emerald-500' },
                            { label: 'العائد على الإنفاق الإعلاني', progress: 64, color: 'bg-amber-500' }
                        ].map((p, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>{p.label}</span>
                                    <span className="text-white italic">{p.progress}%</span>
                                </div>
                                <div className="h-3 w-full bg-white/5 border border-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${p.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, delay: i * 0.2 }}
                                        className={`h-full ${p.color} rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
