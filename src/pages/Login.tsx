import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '../context/DashboardContext';
import { LogIn, Lock, Mail, Loader2, Shirt } from 'lucide-react';
import { motion } from 'motion/react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useDashboard();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate slight delay
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        navigate('/');
      } else {
        setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-slate-900 font-sans" dir="rtl">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-2xl mb-6 shadow-2xl shadow-blue-600/20">
                <Shirt size={32} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">نـظام إدارة الـمـصـنـع</h1>
            <p className="text-slate-400 mt-2 text-[10px] uppercase tracking-[0.3em] font-bold">بوابة الوصول الآمن</p>
        </div>

        <div className="card-premium p-10 bg-white border-slate-200 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">هوية النظام</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  className="block w-full pr-11 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  placeholder="البريد الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 italic">مفتاح الأمان</label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pr-11 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all"
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-50 text-red-600 text-[10px] font-black rounded-xl border border-red-100 text-center uppercase tracking-widest italic"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-amber w-full py-4 text-[11px] tracking-[0.2em] font-black uppercase shadow-lg shadow-blue-600/20 flex items-center justify-center gap-3"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>تـسـجـيـل الـدخول</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-10 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-relaxed italic">
                النظام قيد المراقبة النشطة.<br/>مطلوب بيانات اعتماد مصرح بها.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
