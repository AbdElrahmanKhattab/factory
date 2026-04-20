import React, { useState, useMemo } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  DollarSign, 
  Users, 
  Lightbulb, 
  Droplets, 
  Truck, 
  Wrench, 
  Settings, 
  Facebook, 
  Instagram, 
  Music, 
  Search as GoogleIcon, 
  Share2, 
  Plus, 
  Search, 
  Filter, 
  Package,
  Download, 
  Edit2, 
  Trash2, 
  X, 
  ChevronDown,
  Building2,
  Calendar,
  FileText,
  FileSpreadsheet,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EmployeeExpense, OperationalExpense, MarketingExpense } from '../types';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type TabType = 'employees' | 'operational' | 'marketing' | 'all';

export default function BrandAccounts() {
  const { 
    currentUser, 
    employeeExpenses, 
    operationalExpenses, 
    marketingExpenses,
    addEmployeeExpense,
    updateEmployeeExpense,
    deleteEmployeeExpense,
    addOperationalExpense,
    updateOperationalExpense,
    deleteOperationalExpense,
    addMarketingExpense,
    updateMarketingExpense,
    deleteMarketingExpense,
    addLog
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<TabType>('employees');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  // Filters
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');

  const canEdit = currentUser?.roles.includes('owner') || currentUser?.roles.includes('finance_editor');

  // Summary Totals for selected month
  const totals = useMemo(() => {
    const empTotal = employeeExpenses
      .filter(e => e.month === selectedMonth)
      .reduce((sum, e) => sum + e.monthlySalary, 0);
    
    const opTotal = operationalExpenses
      .filter(e => e.date.startsWith(selectedMonth))
      .reduce((sum, e) => sum + e.amount, 0);
    
    const markTotal = marketingExpenses
      .filter(e => e.startDate.startsWith(selectedMonth))
      .reduce((sum, e) => sum + e.amount, 0);
    
    return {
      employees: empTotal,
      operational: opTotal,
      marketing: markTotal,
      total: empTotal + opTotal + markTotal
    };
  }, [employeeExpenses, operationalExpenses, marketingExpenses, selectedMonth]);

  const handleOpenModal = (expense?: any) => {
    if (!canEdit) return;
    if (expense) {
      setEditingExpense(expense);
    } else {
      setEditingExpense(null);
    }
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, type: TabType) => {
    if (!canEdit) return;
    if (window.confirm('هل أنت متأكد من حذف هذا السجل؟')) {
      let target = '';
      if (type === 'employees') {
        const exp = employeeExpenses.find(e => e.id === id);
        target = `الموظفين — ${exp?.employeeName}`;
        deleteEmployeeExpense(id);
      } else if (type === 'operational') {
        const exp = operationalExpenses.find(e => e.id === id);
        target = `التشغيل — ${exp?.type}`;
        deleteOperationalExpense(id);
      } else if (type === 'marketing') {
        const exp = marketingExpenses.find(e => e.id === id);
        target = `التسويق — ${exp?.platform}`;
        deleteMarketingExpense(id);
      }
      addLog({ user: currentUser!.name, action: 'حذف مصروفات', module: 'حسابات البرند', target, details: `إزالة سجل من دفتر ${type}` });
    }
  };

  const exportToExcel = () => {
    const data = [
      ...employeeExpenses.map(e => ({ 
        'التاريخ': e.paymentDate, 
        'التصنيف': 'الموظفين', 
        'النوع الفرعي': e.role, 
        'البيان': `راتب: ${e.employeeName}`, 
        'المبلغ': e.monthlySalary, 
        'بواسطة': e.addedBy 
      })),
      ...operationalExpenses.map(e => ({ 
        'التاريخ': e.date, 
        'التصنيف': 'التشغيل', 
        'النوع الفرعي': e.type, 
        'البيان': e.description, 
        'المبلغ': e.amount, 
        'بواسطة': e.addedBy 
      })),
      ...marketingExpenses.map(e => ({ 
        'التاريخ': e.startDate, 
        'التصنيف': 'التسويق', 
        'النوع الفرعي': e.platform, 
        'البيان': e.description, 
        'المبلغ': e.amount, 
        'بواسطة': e.addedBy 
      }))
    ].sort((a, b) => new Date(b['التاريخ']).getTime() - new Date(a['التاريخ']).getTime());

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    XLSX.writeFile(wb, `Expenses_${selectedMonth}.xlsx`);
    addLog({ user: currentUser!.name, action: 'Exported Report', module: 'Brand Accounts', target: 'All Expenses Table', details: `Excel — ${selectedMonth}` });
  };

  const exportToPDF = async () => {
    const element = document.getElementById('all-expenses-table');
    if (!element) return;
    
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.setFontSize(18);
    pdf.text(`Expense Report - ${selectedMonth}`, 15, 15);
    pdf.addImage(imgData, 'PNG', 0, 25, pdfWidth, pdfHeight);
    pdf.save(`Expense_Report_${selectedMonth}.pdf`);
    addLog({ user: currentUser!.name, action: 'Exported Report', module: 'Brand Accounts', target: 'All Expenses Table', details: `PDF — ${selectedMonth}` });
  };

  return (
    <div className="space-y-8 max-w-[1400px]" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">حسابات البرند</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-2">دفتر المصروفات الموحد وتحليلات المالية</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm">
             <Calendar size={16} className="text-blue-600" />
             <input 
               type="month" 
               className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest text-slate-900"
               value={selectedMonth}
               onChange={(e) => setSelectedMonth(e.target.value)}
             />
          </div>
          {activeTab === 'all' && (
            <div className="flex gap-2">
                <button onClick={exportToExcel} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-emerald-500 transition-all shadow-sm">
                    <FileSpreadsheet size={18} />
                </button>
                <button onClick={exportToPDF} className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-red-500 transition-all shadow-sm">
                    <FileText size={18} />
                </button>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي المصروفات', value: totals.total, icon: DollarSign, color: 'blue' },
          { label: 'رواتب الموظفين', value: totals.employees, icon: Users, color: 'indigo' },
          { label: 'المصاريف التشغيلية', value: totals.operational, icon: Settings, color: 'purple' },
          { label: 'الإنفاق التسويقي', value: totals.marketing, icon: Share2, color: 'pink' }
        ].map((card, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card-premium p-6 group"
          >
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-2xl bg-slate-50 border border-slate-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500`}>
                    <card.icon size={20} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">الشهر المختار</span>
            </div>
            <p className="text-2xl font-black text-slate-900 italic tracking-tighter">{card.value.toLocaleString()} <span className="text-[10px] not-italic text-slate-500 ml-1">ج.م</span></p>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">{card.label}</h4>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white border border-slate-200 rounded-3xl w-fit">
        {[
          { id: 'employees', label: 'الموظفين', icon: Users },
          { id: 'operational', label: 'التشغيل', icon: Building2 },
          { id: 'marketing', label: 'التسويق', icon: Share2 },
          { id: 'all', label: 'كل المصروفات', icon: Search }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-lg border-transparent' 
                : 'text-slate-500 hover:text-blue-600 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="card-premium overflow-hidden bg-white border-slate-200 shadow-sm min-h-[600px] flex flex-col">
        {/* Tab Headers */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/30 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-sm">
                    <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="البحث في السجلات..." 
                      className="w-full bg-white border border-slate-200 rounded-2xl pr-11 pl-4 py-3 text-[10px] font-black tracking-widest text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-blue-500/20 outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'operational' && (
                    <select 
                        className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[10px] font-black tracking-widest text-slate-500 outline-none"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="All">كل أنواع التكاليف</option>
                        <option value="Electricity">الكهرباء</option>
                        <option value="Water">المياه</option>
                        <option value="Raw Materials Purchase">شراء مواد خام</option>
                        <option value="Production / Factory Cost">تكاليف إنتاج</option>
                        <option value="Shipping & Delivery">شحن وتوصيل</option>
                        <option value="Maintenance & Repairs">صيانة</option>
                        <option value="Other">أخرى</option>
                    </select>
                )}
                {activeTab === 'marketing' && (
                    <select 
                        className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-[10px] font-black tracking-widest text-slate-500 outline-none"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option value="All">كل المنصات</option>
                        <option value="Facebook Ads">Facebook Ads</option>
                        <option value="Instagram">Instagram</option>
                        <option value="TikTok Ads">TikTok Ads</option>
                        <option value="Google Ads">Google Ads</option>
                        <option value="Influencer">مؤثرين / بلوجرز</option>
                        <option value="Other">أخرى</option>
                    </select>
                )}
            </div>
            {canEdit && activeTab !== 'all' && (
                <button 
                  onClick={() => handleOpenModal()}
                  className="btn-amber px-8 py-3 flex items-center gap-3 shadow-md active:scale-95 transition-all"
                >
                  <Plus size={16} />
                  <span>إضافة سجل</span>
                </button>
            )}
        </div>

        {/* Tables */}
        <div className="flex-1 overflow-x-auto custom-scrollbar" id="all-expenses-table">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <th className="px-6 py-5 italic">الفهرس</th>
                        {activeTab === 'employees' && (
                            <>
                                <th className="px-6 py-5">الموظف</th>
                                <th className="px-6 py-5">المسمى الوظيفي</th>
                                <th className="px-6 py-5">الراتب</th>
                                <th className="px-6 py-5">الشهر المالي</th>
                                <th className="px-6 py-5">تاريخ الدفع</th>
                                <th className="px-6 py-5">الطريقة</th>
                            </>
                        )}
                        {activeTab === 'operational' && (
                            <>
                                <th className="px-6 py-5">التصنيف</th>
                                <th className="px-6 py-5">الوصف</th>
                                <th className="px-6 py-5">المبلغ (ج.م)</th>
                                <th className="px-6 py-5">التاريخ</th>
                                <th className="px-6 py-5">الطريقة</th>
                                <th className="px-6 py-5">المرجع</th>
                            </>
                        )}
                        {activeTab === 'marketing' && (
                            <>
                                <th className="px-6 py-5">المنصة</th>
                                <th className="px-6 py-5">تفاصيل الحملة</th>
                                <th className="px-6 py-5">التكلفة</th>
                                <th className="px-6 py-5">تاريخ البدء</th>
                                <th className="px-6 py-5">المدة</th>
                                <th className="px-6 py-5">النتائج</th>
                            </>
                        )}
                        {activeTab === 'all' && (
                            <>
                                <th className="px-6 py-5">التاريخ</th>
                                <th className="px-6 py-5">القطاع</th>
                                <th className="px-6 py-5">النوع الفرعي</th>
                                <th className="px-6 py-5">البيانات</th>
                                <th className="px-6 py-5">القيمة (ج.م)</th>
                                <th className="px-6 py-5">بواسطة</th>
                            </>
                        )}
                        {activeTab !== 'all' && <th className="px-6 py-5 text-left">التحكم</th>}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                    {activeTab === 'employees' && employeeExpenses
                        .filter(e => e.month === selectedMonth && (e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || e.role.toLowerCase().includes(searchTerm.toLowerCase())))
                        .map((exp, idx) => (
                            <tr key={exp.id} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-6 py-4 text-[10px] font-black text-slate-300 italic">#{(idx + 1).toString().padStart(3, '0')}</td>
                                <td className="px-6 py-4 font-black text-xs text-slate-900 uppercase tracking-wider">{exp.employeeName}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{exp.role}</td>
                                <td className="px-6 py-4 font-black text-xs text-blue-600 italic">{exp.monthlySalary.toLocaleString()}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.month}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.paymentDate}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-black uppercase text-slate-500 italic tracking-widest">{exp.paymentMethod}</span>
                                </td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex items-center justify-start gap-2">
                                        <button onClick={() => handleOpenModal(exp)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit2 size={14}/></button>
                                        <button onClick={() => handleDelete(exp.id, 'employees')} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                    {activeTab === 'operational' && operationalExpenses
                        .filter(e => e.date.startsWith(selectedMonth) && (selectedType === 'All' || e.type === selectedType) && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((exp, idx) => (
                            <tr key={exp.id} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-6 py-4 text-[10px] font-black text-slate-300 italic">#{(idx + 1).toString().padStart(3, '0')}</td>
                                <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-blue-600">
                                            {exp.type === 'Electricity' && <Lightbulb size={12}/>}
                                            {exp.type === 'Water' && <Droplets size={12}/>}
                                            {exp.type === 'Raw Materials Purchase' && <Package size={12}/>}
                                            {exp.type === 'Production / Factory Cost' && <Building2 size={12}/>}
                                            {exp.type === 'Shipping & Delivery' && <Truck size={12}/>}
                                            {exp.type === 'Maintenance & Repairs' && <Wrench size={12}/>}
                                            {exp.type === 'Other' && <AlertCircle size={12}/>}
                                         </div>
                                         <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{exp.type}</span>
                                     </div>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-500 italic uppercase max-w-xs truncate">{exp.description}</td>
                                <td className="px-6 py-4 font-black text-xs text-blue-600 italic">{exp.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.date}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{exp.paymentMethod}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">{exp.referenceNo || '---'}</td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex items-center justify-start gap-2">
                                        <button onClick={() => handleOpenModal(exp)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit2 size={14}/></button>
                                        <button onClick={() => handleDelete(exp.id, 'operational')} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                    {activeTab === 'marketing' && marketingExpenses
                        .filter(e => e.startDate.startsWith(selectedMonth) && (selectedType === 'All' || e.platform === selectedType) && e.description.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((exp, idx) => (
                            <tr key={exp.id} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-6 py-4 text-[10px] font-black text-slate-300 italic">#{(idx + 1).toString().padStart(3, '0')}</td>
                                <td className="px-6 py-4">
                                     <div className="flex items-center gap-3">
                                         <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl text-blue-600">
                                            {exp.platform === 'Facebook Ads' && <Facebook size={12}/>}
                                            {exp.platform === 'Instagram' && <Instagram size={12}/>}
                                            {exp.platform === 'TikTok Ads' && <Music size={12}/>}
                                            {exp.platform === 'Google Ads' && <GoogleIcon size={12}/>}
                                            {exp.platform === 'Influencer' && <Users size={12}/>}
                                            {exp.platform === 'Other' && <AlertCircle size={12}/>}
                                         </div>
                                         <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{exp.platform}</span>
                                     </div>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-500 italic uppercase max-w-xs truncate">{exp.description}</td>
                                <td className="px-6 py-4 font-black text-xs text-blue-600 italic">{exp.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.startDate}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">{exp.duration || 'N/A'}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-emerald-500 uppercase tracking-widest italic">{exp.results || '---'}</td>
                                <td className="px-6 py-4 text-left">
                                    <div className="flex items-center justify-start gap-2">
                                        <button onClick={() => handleOpenModal(exp)} className="p-2 text-slate-300 hover:text-blue-600 transition-colors"><Edit2 size={14}/></button>
                                        <button onClick={() => handleDelete(exp.id, 'marketing')} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                    {activeTab === 'all' && [
                        ...employeeExpenses.map(e => ({ ...e, sector: 'رواتب الموظفين', subVector: e.role, intelligence: `راتب: ${e.employeeName}`, val: e.monthlySalary, date: e.paymentDate })),
                        ...operationalExpenses.map(e => ({ ...e, sector: 'مصاريف التشغيل', subVector: e.type, intelligence: e.description, val: e.amount, date: e.date })),
                        ...marketingExpenses.map(e => ({ ...e, sector: 'الإنفاق التسويقي', subVector: e.platform, intelligence: e.description, val: e.amount, date: e.startDate }))
                      ]
                        .filter(e => e.date.startsWith(selectedMonth) && e.intelligence.toLowerCase().includes(searchTerm.toLowerCase()))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((exp, idx) => (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-6 py-4 text-[10px] font-black text-slate-300 italic">#{(idx + 1).toString().padStart(3, '0')}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{exp.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest italic border ${
                                        exp.sector === 'رواتب الموظفين' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        exp.sector === 'مصاريف التشغيل' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                        'bg-pink-50 text-pink-600 border-pink-100'
                                    }`}>{exp.sector}</span>
                                </td>
                                <td className="px-6 py-4 text-[10px] font-black text-slate-600 uppercase tracking-widest">{exp.subVector}</td>
                                <td className="px-6 py-4 text-[10px] font-bold text-slate-500 italic max-w-xs truncate uppercase">{exp.intelligence}</td>
                                <td className="px-6 py-4 font-black text-xs text-blue-600 italic">{exp.val.toLocaleString()}</td>
                                <td className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">{exp.addedBy}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>

        {/* Footer Summary for Table */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex gap-10">
                <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">إجمالي الدورة</p>
                    <p className="text-xl font-black text-slate-900 italic tracking-tighter">{totals.total.toLocaleString()} ج.م</p>
                </div>
                {activeTab === 'all' && (
                    <>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">الموظفين</p>
                            <p className="text-sm font-black text-slate-500 italic tracking-tighter">{totals.employees.toLocaleString()} ج.م</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest italic">التشغيل</p>
                            <p className="text-sm font-black text-slate-500 italic tracking-tighter">{totals.operational.toLocaleString()} ج.م</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest italic">التسويق</p>
                            <p className="text-sm font-black text-slate-500 italic tracking-tighter">{totals.marketing.toLocaleString()} ج.م</p>
                        </div>
                    </>
                )}
            </div>
            <div className="text-left">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em] italic leading-tight text-left">مزامنة البيانات<br/>عبر الشبكة الذكية</p>
            </div>
        </div>
      </div>

      {/* Modal logic */}
      <AnimatePresence>
          {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                      <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.currentTarget);
                          const data: any = Object.fromEntries(formData.entries());
                          
                          const numericAmount = parseFloat(data.amount || data.monthlySalary);
                          
                          let target = '';
                          if (activeTab === 'employees') {
                              const exp: EmployeeExpense = {
                                  id: editingExpense?.id || Math.random().toString(36).substr(2, 9),
                                  employeeName: data.employeeName,
                                  role: data.role,
                                  monthlySalary: numericAmount,
                                  month: data.month,
                                  paymentDate: data.paymentDate,
                                  paymentMethod: data.paymentMethod as any,
                                  notes: data.notes,
                                  addedBy: currentUser!.name,
                                  timestamp: new Date().toISOString()
                              };
                              if (editingExpense) updateEmployeeExpense(exp);
                              else addEmployeeExpense(exp);
                              target = `الموظفين — ${exp.employeeName}`;
                          } else if (activeTab === 'operational') {
                              const exp: OperationalExpense = {
                                  id: editingExpense?.id || Math.random().toString(36).substr(2, 9),
                                  type: data.type as any,
                                  description: data.description,
                                  amount: numericAmount,
                                  date: data.date,
                                  paymentMethod: data.paymentMethod as any,
                                  referenceNo: data.referenceNo,
                                  addedBy: currentUser!.name,
                                  timestamp: new Date().toISOString()
                              };
                              if (editingExpense) updateOperationalExpense(exp);
                              else addOperationalExpense(exp);
                              target = `التشغيل — ${exp.type}`;
                          } else if (activeTab === 'marketing') {
                              const exp: MarketingExpense = {
                                  id: editingExpense?.id || Math.random().toString(36).substr(2, 9),
                                  platform: data.platform as any,
                                  description: data.description,
                                  amount: numericAmount,
                                  startDate: data.startDate,
                                  duration: data.duration,
                                  results: data.results,
                                  addedBy: currentUser!.name,
                                  timestamp: new Date().toISOString()
                              };
                              if (editingExpense) updateMarketingExpense(exp);
                              else addMarketingExpense(exp);
                              target = `التسويق — ${exp.platform}`;
                          }

                          addLog({ 
                              user: currentUser!.name, 
                              action: editingExpense ? 'تعديل مصروفات' : 'إضافة مصروفات', 
                              module: 'حسابات البرند', 
                              target, 
                              details: `${numericAmount.toLocaleString()} ج.م — تحديث السجل` 
                          });
                          setIsModalOpen(false);
                      }}>
                          <div className="p-8 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                              <div>
                                  <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">{editingExpense ? 'تحديث السجل' : 'إضافة سجل جديد'}</h3>
                                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">المسؤول: {currentUser?.name}</p>
                              </div>
                              <button type="button" onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-white hover:bg-slate-50 rounded-xl transition-colors text-slate-400 border border-slate-200"><X size={20}/></button>
                          </div>

                          <div className="p-10 space-y-8 bg-white">
                              {activeTab === 'employees' && (
                                  <>
                                      <div className="grid grid-cols-2 gap-8">
                                          <div className="space-y-2">
                                              <label className="label-style">اسم الموظف</label>
                                              <input name="employeeName" defaultValue={editingExpense?.employeeName} required type="text" className="input-style" placeholder="أدخل الاسم بالكامل" />
                                          </div>
                                          <div className="space-y-2">
                                              <label className="label-style">المسمى الوظيفي</label>
                                              <input name="role" defaultValue={editingExpense?.role} required type="text" className="input-style" placeholder="مثال: خياط، مشرف" />
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-8">
                                          <div className="space-y-2">
                                              <label className="label-style">الراتب الشهري (ج.م)</label>
                                              <input name="monthlySalary" defaultValue={editingExpense?.monthlySalary} required type="number" step="0.01" className="input-style" placeholder="0.00" />
                                          </div>
                                          <div className="space-y-2">
                                              <label className="label-style">الشهر المالي</label>
                                              <input name="month" defaultValue={editingExpense?.month || selectedMonth} required type="month" className="input-style" />
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-8">
                                          <div className="space-y-2">
                                              <label className="label-style">تاريخ الصرف</label>
                                              <input name="paymentDate" defaultValue={editingExpense?.paymentDate || new Date().toISOString().substring(0, 10)} required type="date" className="input-style" />
                                          </div>
                                          <div className="space-y-2">
                                              <label className="label-style">طريقة الدفع</label>
                                              <select name="paymentMethod" defaultValue={editingExpense?.paymentMethod || 'Cash'} className="input-style appearance-none">
                                                  <option value="Cash">كاش</option>
                                                  <option value="Bank Transfer">تحويل بنكي</option>
                                              </select>
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <label className="label-style">ملاحظات إضافية</label>
                                          <textarea name="notes" defaultValue={editingExpense?.notes} className="input-style h-24 resize-none" placeholder="أي تفاصيل أخرى..."></textarea>
                                      </div>
                                  </>
                              )}

                              {activeTab === 'operational' && (
                                  <>
                                      <div className="grid grid-cols-2 gap-8">
                                          <div className="space-y-2">
                                              <label className="label-style">نوع المصروف</label>
                                              <select name="type" defaultValue={editingExpense?.type} className="input-style appearance-none">
                                                  <option value="Electricity">كهرباء</option>
                                                  <option value="Water">مياه</option>
                                                  <option value="Raw Materials Purchase">شراء مواد خام</option>
                                                  <option value="Production / Factory Cost">تكاليف إنتاج / مصنع</option>
                                                  <option value="Shipping & Delivery">شحن وتوصيل</option>
                                                  <option value="Maintenance & Repairs">صيانة وإصلاح</option>
                                                  <option value="Other">أخرى</option>
                                              </select>
                                          </div>
                                          <div className="space-y-2">
                                              <label className="label-style">المبلغ (ج.م)</label>
                                              <input name="amount" defaultValue={editingExpense?.amount} required type="number" step="0.01" className="input-style" placeholder="0.00" />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <label className="label-style">وصف المصروف</label>
                                          <input name="description" defaultValue={editingExpense?.description} required type="text" className="input-style" placeholder="أدخل بيانات المصروف..." />
                                      </div>
                                      <div className="grid grid-cols-3 gap-6">
                                          <div className="space-y-2">
                                              <label className="label-style">التاريخ</label>
                                              <input name="date" defaultValue={editingExpense?.date || new Date().toISOString().substring(0, 10)} required type="date" className="input-style" />
                                          </div>
                                          <div className="space-y-2">
                                              <label className="label-style">البروتوكول</label>
                                              <select name="paymentMethod" defaultValue={editingExpense?.paymentMethod || 'Cash'} className="input-style appearance-none">
                                                  <option value="Cash">كاش</option>
                                                  <option value="Bank Transfer">تحويل</option>
                                                  <option value="Supplier Credit">آجل</option>
                                              </select>
                                          </div>
                                          <div className="space-y-2">
                                              <label className="label-style">رقم المرجع</label>
                                              <input name="referenceNo" defaultValue={editingExpense?.referenceNo} type="text" className="input-style" placeholder="INV-XXX" />
                                          </div>
                                      </div>
                                  </>
                              )}

                              {activeTab === 'marketing' && (
                                  <>
                                      <div className="grid grid-cols-2 gap-8">
                                          <div className="space-y-2">
                                              <label className="label-style">شبكة الإعلانات</label>
                                              <select name="platform" defaultValue={editingExpense?.platform} className="input-style appearance-none">
                                                  <option value="Facebook Ads">Facebook Ads</option>
                                                  <option value="Instagram">Instagram</option>
                                                  <option value="TikTok Ads">TikTok Ads</option>
                                                  <option value="Google Ads">Google Ads</option>
                                                  <option value="Influencer">بلوجر / مؤثر</option>
                                                  <option value="Other">أخرى</option>
                                              </select>
                                          </div>
                                          <div className="space-y-2">
                                              <label className="label-style">الميزانية (ج.م)</label>
                                              <input name="amount" defaultValue={editingExpense?.amount} required type="number" step="0.01" className="input-style" placeholder="0.00" />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <label className="label-style">وصف الحملة</label>
                                          <input name="description" defaultValue={editingExpense?.description} required type="text" className="input-style" placeholder="مثال: حملة شتاء 2025" />
                                      </div>
                                      <div className="grid grid-cols-2 gap-8">
                                          <div className="space-y-2">
                                              <label className="label-style">تاريخ البدء</label>
                                              <input name="startDate" defaultValue={editingExpense?.startDate || new Date().toISOString().substring(0, 10)} required type="date" className="input-style" />
                                          </div>
                                          <div className="space-y-2">
                                              <label className="label-style">مدة الحملة</label>
                                              <input name="duration" defaultValue={editingExpense?.duration} type="text" className="input-style" placeholder="مثال: 7 أيام" />
                                          </div>
                                      </div>
                                      <div className="space-y-2">
                                          <label className="label-style">المقاييس المتوقعة</label>
                                          <input name="results" defaultValue={editingExpense?.results} type="text" className="input-style" placeholder="مثال: ~50 طلب" />
                                      </div>
                                  </>
                              )}

                              <div className="pt-8 border-t border-slate-100 flex gap-4">
                                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest rounded-2xl hover:bg-slate-100 transition-all">إلغاء</button>
                                  <button type="submit" className="flex-[2] btn-amber py-4 uppercase italic">تنفيذ السجل المالي</button>
                              </div>
                          </div>
                      </form>
                  </motion.div>
              </div>
          )}
      </AnimatePresence>
    </div>
  );
}
