import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Shield, 
  Lock, 
  UserPlus, 
  CheckCircle,
  XCircle,
  X,
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Role } from '../types';

export default function UserManagement() {
  const { users, currentUser, addUser, updateUser, deleteUser, addLog } = useDashboard();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    password: '',
    roles: [],
    status: 'Active'
  });

  if (!currentUser?.roles.includes('owner')) {
    return (
        <div className="flex flex-col items-center justify-center h-[70vh]">
            <div className="w-20 h-20 bg-white border border-slate-200 text-amber-500 rounded-3xl flex items-center justify-center mb-6 shadow-xl">
                <Lock size={32} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-wider italic">الوصول مقيد</h2>
            <p className="text-slate-400 mt-2 max-w-xs text-center text-xs font-bold uppercase tracking-widest leading-relaxed italic">فشل التحقق من الهوية. صلاحيات مدير النظام مطلوبة لهذا الإجراء.</p>
        </div>
    );
  }

  const roleOptions: { label: string, value: Role }[] = [
    { label: 'مدقق المخزون', value: 'inventory_editor' },
    { label: 'مهندس المنتجات', value: 'products_editor' },
    { label: 'محلل مالي', value: 'finance_viewer' },
    { label: 'محرر مالي', value: 'finance_editor' },
    { label: 'مشاهد السجلات', value: 'logs_viewer' }
  ];

  const handleOpenModal = (user?: User) => {
    if (user) {
        setEditingUser(user);
        setFormData(user);
    } else {
        setEditingUser(null);
        setFormData({ name: '', email: '', password: Math.random().toString(36).substr(2, 8), roles: [], status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleRoleToggle = (role: Role) => {
    const roles = formData.roles || [];
    if (roles.includes(role)) {
        setFormData({ ...formData, roles: roles.filter(r => r !== role) });
    } else {
        setFormData({ ...formData, roles: [...roles, role] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
        updateUser(formData as User);
        addLog({ user: currentUser.name, action: 'تعديل مستخدم', module: 'المستخدمين', target: formData.name!, details: `تحديث ملف ${formData.email}` });
    } else {
        const newUser = {
            ...formData,
            id: 'u' + Math.random().toString(36).substr(2, 9),
            lastLogin: 'لم يدخل بعد'
        } as User;
        addUser(newUser);
        addLog({ user: currentUser.name, action: 'إضافة مستخدم', module: 'المستخدمين', target: newUser.name, details: `إنشاء حساب جديد: ${newUser.email}` });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
      const userToDelete = users.find(u => u.id === id);
      if (userToDelete?.roles.includes('owner')) {
          alert("لا يمكن حذف حساب المالك.");
          return;
      }
      if (window.confirm(`هل أنت متأكد من حذف ${name}؟`)) {
          deleteUser(id);
          addLog({ user: currentUser.name, action: 'حذف مستخدم', module: 'المستخدمين', target: name, details: `حذف حساب الموظف بشكل نهائي` });
      }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 uppercase tracking-wider italic">مصفوفة التحكم في الوصول</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black mt-1 italic">إدارة الموظفين وتوزيع الصلاحيات</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-amber px-8 py-3.5 text-[10px] uppercase font-black tracking-widest shadow-xl shadow-amber-500/10 active:scale-95 transition-all italic"
        >
          <UserPlus size={16} className="ml-2" />
          <span>إنشاء حساب موظف</span>
        </button>
      </div>

      <div className="card-premium overflow-hidden border-slate-200 shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-right" dir="rtl">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 uppercase">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest">هوية الموظف</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest">نطاق الصلاحيات</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest text-center">الحالة</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest">آخر نشاط</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest text-left">التحكم</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black relative border border-slate-100 ${user.roles.includes('owner') ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-50 text-slate-400'}`}>
                        {user.name[0]}
                        {user.roles.includes('owner') && <ShieldCheck size={12} className="absolute -bottom-1 -right-1 text-blue-600 bg-white rounded-full p-0.5" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider italic">{user.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5 max-w-xs">
                        {user.roles.includes('owner') ? (
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[9px] font-black uppercase tracking-widest italic">صلاحية كاملة</span>
                        ) : (
                            user.roles.map(role => (
                                <span key={role} className="px-2 py-0.5 bg-slate-50 text-slate-500 border border-slate-200 rounded text-[9px] font-black uppercase tracking-widest">
                                    {roleOptions.find(r => r.value === role)?.label || role.replace('_', ' ')}
                                </span>
                            ))
                        )}
                        {user.roles.length === 0 && <span className="text-[9px] italic text-slate-300 uppercase font-bold tracking-widest">بدون صلاحيات</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] italic ${
                        user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}>
                        {user.status === 'Active' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                        {user.status === 'Active' ? 'نشط' : 'معلق'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                    {user.lastLogin || <span className="opacity-40 italic">---</span>}
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="flex items-center justify-start gap-1">
                      <button onClick={() => handleOpenModal(user)} className="p-2 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 size={16} />
                      </button>
                      {!user.roles.includes('owner') && (
                        <button onClick={() => handleDelete(user.id, user.name)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="relative w-full max-w-xl bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden">
                <form onSubmit={handleSubmit}>
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tighter italic">{editingUser ? 'تحديث الملف الشخصي' : 'تفويض مشغل جديد'}</h3>
                        <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"><X size={20}/></button>
                    </div>
                    
                    <div className="p-10 space-y-7">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="label-style">اسم الموظف</label>
                                <input required type="text" className="input-style" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="الاسم القانوني بالكامل" />
                            </div>
                            <div>
                                <label className="label-style">البريد الإلكتروني</label>
                                <input required type="email" className="input-style" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="البريد المؤسسي" />
                            </div>
                        </div>

                        <div>
                            <label className="label-style">كلمة المرور</label>
                            <div className="relative">
                                <input 
                                    required 
                                    type={showPassword ? 'text' : 'password'} 
                                    className="input-style pr-4 pl-12 font-mono tracking-widest text-left" 
                                    value={formData.password} 
                                    onChange={e => setFormData({...formData, password: e.target.value})} 
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-4 top-3 text-slate-400 hover:text-slate-900 transition-colors">
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                            <p className="text-[9px] text-slate-300 mt-2 italic font-black uppercase tracking-widest">طبقة التشفير نشطة. تم توليد مفتاح مؤقت.</p>
                        </div>

                        <div>
                            <label className="label-style mb-4 italic">تخصيص مصفوفة الصلاحيات</label>
                            <div className="grid grid-cols-2 gap-3">
                                {roleOptions.map(option => (
                                    <button 
                                        type="button" 
                                        key={option.value}
                                        onClick={() => handleRoleToggle(option.value)}
                                        className={`p-4 rounded-2xl border text-right flex items-start gap-4 transition-all ${
                                            formData.roles?.includes(option.value) 
                                                ? 'bg-blue-600 text-white border-blue-600 font-black shadow-lg shadow-blue-600/20' 
                                                : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                            formData.roles?.includes(option.value) ? 'bg-white text-blue-600 border-white' : 'border-slate-200 bg-slate-50'
                                        }`}>
                                            {formData.roles?.includes(option.value) && <Shield size={10} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[10px] font-black leading-tight uppercase tracking-widest">{option.label}</p>
                                            <p className={`text-[8px] mt-1 font-bold uppercase tracking-[0.15em] ${formData.roles?.includes(option.value) ? 'text-white/60' : 'text-slate-300'}`}>
                                                {option.value.includes('editor') ? 'تعديل السجلات' : 'عرض فقط'}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
                             <label className="label-style uppercase mb-0">حالة الهوية</label>
                             <div className="flex gap-2">
                                {['Active', 'Suspended'].map(s => (
                                    <button 
                                        key={s} 
                                        type="button"
                                        onClick={() => setFormData({...formData, status: s as any})}
                                        className={`px-6 py-2 rounded-xl text-[10px] font-black border uppercase tracking-widest transition-all ${
                                            formData.status === s ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20' : 'bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100'
                                        }`}
                                    >
                                        {s === 'Active' ? 'نشط' : 'معلق'}
                                    </button>
                                ))}
                             </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 btn-secondary text-[10px] uppercase font-black tracking-widest py-4 rounded-2xl">إلغاء العملية</button>
                        <button type="submit" className="flex-[2] btn-amber text-[10px] uppercase font-black tracking-widest shadow-xl shadow-amber-500/10 py-4 rounded-2xl italic">{editingUser ? 'تحديث البيانات' : 'تفعيل الهوية'}</button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <style>{`
        .label-style { @apply block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 px-1 italic; }
        .input-style { @apply w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-900 placeholder-slate-300 outline-none; }
        .btn-amber { @apply bg-amber-500 text-amber-950 font-black hover:bg-amber-400 transition-all; }
        .btn-secondary { @apply bg-white border border-slate-200 text-slate-400 font-black hover:bg-slate-50 transition-all; }
      `}</style>
    </div>
  );
}
