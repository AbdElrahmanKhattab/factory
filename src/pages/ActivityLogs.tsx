import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  Search, 
  Filter, 
  Download, 
  User as UserIcon,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Database,
  Shield,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';
import * as XLSX from 'xlsx';

export default function ActivityLogs() {
  const { activityLogs, users } = useDashboard();
  const [search, setSearch] = useState('');
  const [userFilter, setUserFilter] = useState('All');
  const [moduleFilter, setModuleFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filteredLogs = activityLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) || 
                         log.target.toLowerCase().includes(search.toLowerCase()) ||
                         log.details.toLowerCase().includes(search.toLowerCase());
    const matchesUser = userFilter === 'All' || log.user === userFilter;
    const matchesModule = moduleFilter === 'All' || log.module === moduleFilter;
    return matchesSearch && matchesUser && matchesModule;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCSV = () => {
    const ws = XLSX.utils.json_to_sheet(filteredLogs);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Logs");
    XLSX.writeFile(wb, "activity-logs.csv");
  };

  const modules = ['Products', 'Inventory', 'Users', 'Analytics', 'Auth', 'Settings'];

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider italic">سجلات نشاط النظام</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1 italic">تتبع العمليات لضمان الأمان والامتثال</p>
        </div>
        <button 
          onClick={handleExportCSV}
          className="bg-white border border-slate-200 text-slate-900 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm flex items-center gap-2 group"
        >
          <Download size={14} className="group-hover:translate-y-0.5 transition-transform" />
          <span>تصدير سجل التدقيق</span>
        </button>
      </div>

      <div className="card-premium p-4 flex flex-wrap items-center gap-4 bg-white border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-xl flex-1 max-w-sm border border-slate-100 shadow-inner">
          <Search size={14} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="تصفية السجلات..." 
            className="bg-transparent border-none outline-none text-[10px] font-bold uppercase tracking-widest w-full text-slate-900 placeholder-slate-300"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select 
          className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer min-w-[140px]"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="All">كل الهويات</option>
          {users.map(u => <option key={u.id} value={u.name}>{u.name}</option>)}
        </select>

        <select 
          className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 outline-none focus:ring-2 focus:ring-blue-500/20 appearance-none cursor-pointer min-w-[140px]"
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
        >
          <option value="All">كل العمليات</option>
          {['المنتجات', 'المخزون', 'المستخدمين', 'التحليلات', 'النظام', 'الإعدادات'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="card-premium overflow-hidden bg-white border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48 italic">فهرس التدقيق</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الممثل</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">العملية</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">المجال</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">الهدف</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">البيانات الوصفية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[9px] font-black uppercase tracking-widest leading-none italic">{new Date(log.timestamp).toLocaleString('ar-EG')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors uppercase">{log.user[0]}</div>
                        <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest italic">{log.user}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[9px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest italic ${
                        log.action.includes('حذف') || log.action.includes('Deleted') ? 'text-red-500 bg-red-50 border border-red-100' : 
                        log.action.includes('إضافة') || log.action.includes('تعديل') || log.action.includes('Added') || log.action.includes('Edited') ? 'text-blue-500 bg-blue-50 border border-blue-100' :
                        log.action.includes('تسجيل') || log.action.includes('Login') ? 'text-amber-600 bg-amber-50 border border-amber-100' :
                        'text-slate-400 bg-slate-50 border border-slate-100'
                    }`}>
                        {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[9px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2 mt-1 italic">
                    {log.module === 'Products' && <FileText size={12} className="text-slate-300" />}
                    {log.module === 'Inventory' && <Database size={12} className="text-slate-300" />}
                    {log.module === 'Users' && <Shield size={12} className="text-slate-300" />}
                    {log.module === 'Auth' && <UserIcon size={12} className="text-slate-300" />}
                    {log.module === 'Analytics' && <ChevronRight size={12} className="text-slate-300" />}
                    {log.module}
                  </td>
                  <td className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase tracking-wider italic">{log.target}</td>
                  <td className="px-6 py-4">
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-widest line-clamp-1 group-hover:text-slate-600 transition-colors italic">{log.details}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginatedLogs.length === 0 && (
            <div className="p-20 text-center">
               <Database size={40} className="mx-auto mb-4 text-slate-100" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-200 italic">ذاكرة التدقيق فارغة</p>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50" dir="rtl">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
                عرض <span className="text-slate-900 font-black">{Math.min(filteredLogs.length, itemsPerPage)}</span> سجل من إجمالي <span className="text-slate-900 font-black">{filteredLogs.length}</span> سجل أمني
            </p>
            <div className="flex items-center gap-2" dir="ltr">
               <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-20 transition-all font-black"
               >
                 <ChevronLeft size={16} className="text-slate-900" />
               </button>
               <div className="flex items-center gap-1">
                 {[...Array(totalPages)].map((_, i) => (
                    <button 
                        key={i+1}
                        onClick={() => setCurrentPage(i+1)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === i+1 ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                        {i+1}
                    </button>
                 ))}
               </div>
               <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-20 transition-all font-black"
               >
                 <ChevronRight size={16} className="text-slate-900" />
               </button>
            </div>
        </div>
      </div>
    </div>
  );
}
