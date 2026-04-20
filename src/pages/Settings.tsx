import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  User, 
  Lock, 
  Sun, 
  Moon, 
  Bell, 
  Save, 
  Camera,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const { currentUser, darkMode, setDarkMode, addLog } = useDashboard();
  const [displayName, setDisplayName] = useState(currentUser?.name || '');
  const [showSuccess, setShowSuccess] = useState(false);
  const [passData, setPassData] = useState({ old: '', new: '', confirm: '' });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addLog({ user: currentUser?.name || 'Unknown', action: 'Updated Settings', module: 'Settings', target: 'Profile', details: `Changed display name to ${displayName}` });
    triggerSuccess();
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) {
        alert("Passwords do not match");
        return;
    }
    addLog({ user: currentUser?.name || 'Unknown', action: 'Updated Settings', module: 'Settings', target: 'Security', details: 'Changed account password' });
    triggerSuccess();
    setPassData({ old: '', new: '', confirm: '' });
  };

  const triggerSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" dir="rtl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider italic">إعدادات النظم والتحكم</h2>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mt-1 italic">إدارة الملف الشخصي وبروتوكولات الأمان</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
            <div className="card-premium p-8 text-center flex flex-col items-center relative overflow-hidden bg-white border-slate-200 shadow-sm">
                <div className="absolute top-0 inset-x-0 h-24 bg-slate-50/50"></div>
                
                <div className="relative mt-8">
                    <div className="w-24 h-24 bg-slate-50 rounded-3xl border-4 border-white shadow-xl flex items-center justify-center text-3xl font-black text-slate-300 italic group relative overflow-hidden">
                        {displayName[0]}
                        <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-all cursor-pointer" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2.5 bg-blue-600 text-white rounded-xl shadow-xl border-4 border-white hover:scale-110 transition-transform active:scale-95">
                        <Camera size={14} />
                    </button>
                </div>

                <div className="mt-6 text-right w-full text-center">
                    <h3 className="font-black text-lg text-slate-900 uppercase tracking-tighter italic">{displayName}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1 italic">{currentUser?.email}</p>
                    <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic">
                        {currentUser?.roles[0].replace('_', ' ')}
                    </div>
                </div>
            </div>

            <div className="card-premium p-6 space-y-5 bg-white border-slate-200 shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-4 italic">تفضيلات الواجهة</h4>
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 group-hover:text-blue-600 transition-colors">
                            <Sun size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors italic">الوضع المضيء</span>
                    </div>
                    <div className="w-12 h-6 rounded-full bg-blue-600 border border-blue-600 relative">
                        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm"></div>
                    </div>
                </div>
                <div className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 group-hover:text-blue-600 transition-colors">
                            <Bell size={16} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 transition-colors italic">مصفوفة التنبيهات</span>
                    </div>
                    <button className="w-12 h-6 rounded-full bg-blue-600 relative transition-all">
                        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-white shadow-sm"></div>
                    </button>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
            <div className="card-premium overflow-hidden bg-white border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                    <User size={16} className="text-blue-600" />
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">بيانات ملف الموظف</h3>
                </div>
                <form onSubmit={handleSaveProfile} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="label-style">الاسم المعروض</label>
                            <input 
                                required
                                type="text"
                                className="input-style font-black text-slate-900 placeholder-slate-200"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="label-style">المعرف الموحد</label>
                            <input 
                                disabled
                                type="email"
                                className="input-style opacity-30 cursor-not-allowed italic font-bold"
                                value={currentUser?.email}
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-end">
                        <button type="submit" className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3.5 text-[10px] uppercase font-black tracking-[0.2em] shadow-xl shadow-slate-900/10 active:scale-95 transition-all italic">
                            <Save size={16} />
                            <span>حفظ التعديلات</span>
                        </button>
                    </div>
                </form>
            </div>

            <div className="card-premium overflow-hidden bg-white border-slate-200 shadow-sm">
                <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                    <Lock size={16} className="text-blue-600" />
                    <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] italic">بروتوكولات الأمان</h3>
                </div>
                <form onSubmit={handlePasswordChange} className="p-8 space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="label-style">المفتاح الحالي</label>
                            <input 
                                required
                                type="password"
                                className="input-style font-black tracking-[0.3em] text-left"
                                value={passData.old}
                                onChange={(e) => setPassData({...passData, old: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="label-style">المفتاح الجديد</label>
                            <input 
                                required
                                type="password"
                                className="input-style font-black tracking-[0.3em] text-left"
                                value={passData.new}
                                onChange={(e) => setPassData({...passData, new: e.target.value})}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="label-style">تأكيد المفتاح</label>
                            <input 
                                required
                                type="password"
                                className="input-style font-black tracking-[0.3em] text-left"
                                value={passData.confirm}
                                onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 flex justify-end">
                        <button type="submit" className="flex items-center gap-3 bg-blue-600 text-white px-8 py-3.5 text-[10px] uppercase font-black tracking-[0.2em] shadow-xl shadow-blue-500/10 active:scale-95 transition-all italic">
                            <Lock size={16} />
                            <span>تغيير مفتاح الوصول</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {showSuccess && (
            <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="fixed bottom-10 right-10 z-50 bg-white border border-slate-200 text-slate-900 px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-4 font-black uppercase tracking-[0.2em] text-[10px]"
            >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Check size={20} strokeWidth={3} />
                </div>
                <span className="italic">تم تفعيل التغييرات بنجاح. بروتوكولات الأمان محدثة.</span>
            </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .label-style { @apply block text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 px-1 italic; }
        .input-style { @apply w-full bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 text-xs focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 placeholder-slate-200 shadow-inner outline-none; }
      `}</style>
    </div>
  );
}
