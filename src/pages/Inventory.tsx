import React, { useState } from 'react';
import { useDashboard } from '../context/DashboardContext';
import { Archive, Package, ChevronRight, Layers, Box } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import InventoryRaw from './InventoryRaw';
import InventoryFinished from './InventoryFinished';

export default function Inventory() {
  const { language } = useDashboard();
  const [activeTab, setActiveTab] = useState<'raw' | 'finished'>('raw');

  const translations = {
    ar: {
      title: 'إدارة المخزون',
      subtitle: 'مراقبة المواد الخام والمنتجات النهائية',
      rawTab: 'المواد الخام',
      finishedTab: 'المنتجات الجاهزة',
    }
  };

  const t = translations['ar'];

  return (
    <div className="space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic flex items-center gap-3">
            <Archive className="text-blue-600" />
            {t.title}
          </h1>
          <p className="text-slate-500 text-xs mt-2 uppercase tracking-widest font-bold">{t.subtitle}</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            onClick={() => setActiveTab('raw')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'raw' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Layers size={14} />
            {t.rawTab}
          </button>
          <button
            onClick={() => setActiveTab('finished')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === 'finished' 
                ? 'bg-white text-pink-600 shadow-sm' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Box size={14} />
            {t.finishedTab}
          </button>
        </div>
      </div>

      <div className="relative min-h-[600px]">
        <AnimatePresence mode="wait">
          {activeTab === 'raw' ? (
            <motion.div
              key="raw"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InventoryRaw />
            </motion.div>
          ) : (
            <motion.div
              key="finished"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <InventoryFinished />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
