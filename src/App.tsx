import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag,
  Archive, 
  BarChart3, 
  History, 
  Users, 
  Settings, 
  DollarSign,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronRight,
  Sun,
  Moon,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Import Pages (to be created)
import Login from './pages/Login';
import DashboardHome from './pages/DashboardHome';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import InventoryRaw from './pages/InventoryRaw';
import InventoryFinished from './pages/InventoryFinished';
import Analytics from './pages/Analytics';
import BrandAccounts from './pages/BrandAccounts';
import Orders from './pages/Orders';
import ActivityLogs from './pages/ActivityLogs';
import UserManagement from './pages/UserManagement';
import SettingsPage from './pages/Settings';

import GlobalSearch from './components/GlobalSearch';

const ProtectedRoute = ({ children, requiredRoles }: { children: React.ReactNode, requiredRoles?: string[] }) => {
  const { currentUser } = useDashboard();
  const location = useLocation();

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRoles && !currentUser.roles.includes('owner' as any)) {
      const hasPermission = currentUser.roles.some(r => requiredRoles.includes(r));
      if (!hasPermission) return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const Navigation = () => {
  const { currentUser, logout, rawMaterials, finishedGoods } = useDashboard();
  const location = useLocation();

  const t = {
    overview: 'نظرة عامة',
    products: 'المنتجات',
    orders: 'الطلبات',
    inventory: 'المخزون',
    accounts: 'حسابات البرند',
    analytics: 'التحليلات',
    logs: 'سجلات النشاط',
    users: 'إدارة المستخدمين',
    settings: 'الإعدادات',
    exit: 'تسجيل الخروج'
  };
  
  const lowStockCount = [
    ...rawMaterials.flatMap(c => c.items.filter(i => i.quantity <= i.minThreshold)),
    ...finishedGoods.flatMap(mc => mc.subCategories.flatMap(sc => sc.items.filter(i => i.totalQuantity <= i.minThreshold)))
  ].length;

  const menuItems = [
    { path: '/', label: t.overview, icon: LayoutDashboard, roles: ['owner', 'inventory_editor', 'products_editor', 'finance_viewer', 'logs_viewer'] },
    { path: '/products', label: t.products, icon: Package, roles: ['owner', 'products_editor'] },
    { path: '/orders', label: t.orders, icon: ShoppingBag, roles: ['owner', 'finance_viewer', 'finance_editor'] },
    { path: '/inventory', label: t.inventory, icon: Archive, roles: ['owner', 'inventory_editor'] },
    { path: '/accounts', label: t.accounts, icon: DollarSign, roles: ['owner', 'finance_viewer', 'finance_editor'] },
    { path: '/analytics', label: t.analytics, icon: BarChart3, roles: ['owner', 'finance_viewer'] },
    { path: '/logs', label: t.logs, icon: History, roles: ['owner', 'logs_viewer'] },
    { path: '/users', label: t.users, icon: Users, roles: ['owner'] },
    { path: '/settings', label: t.settings, icon: Settings, roles: ['owner', 'inventory_editor', 'products_editor', 'finance_viewer', 'logs_viewer'] },
  ];

  const filteredMenu = menuItems.filter(item => 
    currentUser?.roles.includes('owner' as any) || 
    item.roles.some(role => currentUser?.roles.includes(role as any))
  );

  return (
    <aside className="w-64 bg-white border-l border-slate-200 flex flex-col h-screen fixed sticky top-0 z-40" dir="rtl">
      <div className="p-8 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-500/20 rotate-3 hover:rotate-0 transition-transform cursor-pointer">
            <span>H</span>
        </div>
        <div className="group cursor-pointer">
            <h1 className="font-black text-xs tracking-widest text-slate-900 leading-tight uppercase italic group-hover:text-blue-600 transition-colors">مـصــنــع</h1>
            <p className="text-[10px] text-slate-400 tracking-[0.4em] uppercase font-black mt-1 group-hover:text-slate-600 transition-colors">للأنـظمة</p>
        </div>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-5 space-y-1.5 custom-scrollbar">
        {filteredMenu.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link group py-3.5 px-4 mb-1 border-transparent ${isActive ? 'sidebar-link-active' : 'hover:bg-slate-50'}`}
            >
              <Icon size={16} strokeWidth={isActive ? 3 : 2} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-600'} />
              <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-slate-600'}`}>{item.label}</span>
              {item.path === '/' && lowStockCount > 0 && (
                <span className="mr-auto w-5 h-5 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-lg shadow-md shadow-red-500/20">
                    {lowStockCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        <div className="flex items-center gap-4 px-3 py-3 mb-6 bg-white rounded-2xl border border-slate-100 group cursor-pointer hover:shadow-sm transition-all text-right">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:border-blue-500 group-hover:text-blue-600 transition-all shrink-0">
                {currentUser?.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 truncate uppercase tracking-widest">{currentUser?.name}</p>
                <p className="text-[9px] text-slate-400 truncate uppercase tracking-widest font-black italic mt-1">{currentUser?.roles[0].replace('_', ' ')}</p>
            </div>
        </div>
        <button 
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 text-[10px] font-black text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl border border-slate-100 hover:border-red-100 transition-all uppercase tracking-widest group"
        >
          <LogOut size={14} className="group-hover:translate-x-1 transition-transform" />
          <span>{t.exit}</span>
        </button>
      </div>
    </aside>
  );
};

const Header = () => {
    const { currentUser, rawMaterials, finishedGoods } = useDashboard();
    const [showNotifications, setShowNotifications] = React.useState(false);
    const location = useLocation();

    const lowStockItems = [
        ...rawMaterials.flatMap(c => c.items.filter(i => i.quantity <= i.minThreshold).map(i => ({ ...i, category: c.name, type: 'Raw' }))),
        ...finishedGoods.flatMap(mc => mc.subCategories.flatMap(sc => sc.items.filter(i => i.totalQuantity <= i.minThreshold).map(i => ({ ...i, category: sc.name, type: 'Finished' }))))
    ];

    const currentModule = location.pathname === '/' ? 'نظام الإدارة' : location.pathname.substring(1).split('/').pop()?.replace('-', ' ');

    return (
        <header className="h-20 border-b border-slate-100 bg-white/80 backdrop-blur-xl px-10 flex items-center justify-between sticky top-0 z-30 shadow-sm" dir="rtl">
            <div className="flex items-center gap-4 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <span className="hover:text-blue-600 transition-colors cursor-pointer">الرئيسية</span>
                <ChevronRight size={12} className="text-slate-200 rotate-180" />
                <span className="text-slate-900 italic tracking-widest">{currentModule}</span>
            </div>

            <div className="flex-1 flex justify-center px-12">
                <GlobalSearch />
            </div>

            <div className="flex items-center gap-8">
                <div className="relative">
                    <button 
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="text-slate-400 hover:text-blue-600 transition-all relative p-2 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 group"
                    >
                        <Bell size={18} className="group-hover:rotate-12 transition-transform" />
                        {lowStockItems.length > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-lg shadow-red-500/20"></span>
                        )}
                    </button>

                    <AnimatePresence>
                        {showNotifications && (
                            <motion.div 
                                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                                className="absolute left-0 mt-6 w-96 bg-white border border-slate-200 rounded-3xl shadow-xl z-50 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                    <h3 className="font-black text-[10px] uppercase tracking-widest text-slate-900 italic">تنبيهات النظام</h3>
                                    <span className="text-[9px] uppercase tracking-widest font-black px-3 py-1 bg-red-50 text-red-500 rounded-full border border-red-100">{lowStockItems.length} تحذيرات</span>
                                </div>
                                <div className="max-h-[30rem] overflow-y-auto custom-scrollbar bg-white p-2">
                        {lowStockItems.length > 0 ? lowStockItems.map((item, idx) => (
                                            <div 
                                                key={idx} 
                                                onClick={() => {
                                                    const path = item.type === 'Raw' ? '/inventory/raw' : '/inventory/finished';
                                                    window.location.href = path; // Simple navigation
                                                }}
                                                className="p-4 mb-2 rounded-2xl border border-slate-50 flex gap-4 hover:bg-slate-50/50 hover:border-slate-100 transition-all group cursor-pointer"
                                            >
                                                <div className="p-3 bg-slate-50 text-red-500 rounded-xl h-fit border border-slate-100 group-hover:bg-red-500 group-hover:text-white transition-all">
                                                    <AlertCircle size={14} />
                                                </div>
                                                <div className="flex-1 text-right">
                                                    <div className="flex justify-between items-start">
                                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">{item.type === 'Raw' ? 'مواد خام' : 'منتج تام'}</p>
                                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.category}</span>
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest leading-relaxed italic">
                                                        {item.name} <span className="text-slate-400">حرج: {(item as any).quantity || (item as any).totalQuantity} وحدة</span>
                                                    </p>
                                                </div>
                                            </div>
                                        )) : (
                                        <div className="p-12 text-center">
                                            <AlertCircle size={32} className="mx-auto text-slate-100 mb-4" />
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 italic">لا توجد ثغرات أمنية</p>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-slate-100 text-center bg-slate-50">
                                    <button className="text-[9px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest transition-colors">مسح الإشارات</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="h-8 w-px bg-slate-100"></div>
                
                <button className="btn-amber px-10 py-3.5 italic">
                    + بدء الإنتاج
                </button>
            </div>
        </header>
    );
};

const MainLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      <Navigation />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="p-8 flex-1 overflow-x-hidden overflow-y-auto custom-scrollbar bg-slate-50">
          <OutletWrapper />
        </main>
      </div>
    </div>
  );
};

// This wrapper is needed to avoid re-rendering issues in the parent
const OutletWrapper = () => (
    <Routes>
        <Route path="/" element={<ProtectedRoute><DashboardHome /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute requiredRoles={['products_editor']}><Products /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute requiredRoles={['inventory_editor']}><Inventory /></ProtectedRoute>} />
        <Route path="/inventory/raw" element={<ProtectedRoute requiredRoles={['inventory_editor']}><InventoryRaw /></ProtectedRoute>} />
        <Route path="/inventory/finished" element={<ProtectedRoute requiredRoles={['inventory_editor']}><InventoryFinished /></ProtectedRoute>} />
        <Route path="/accounts" element={<ProtectedRoute requiredRoles={['finance_viewer', 'finance_editor']}><BrandAccounts /></ProtectedRoute>} />
        <Route path="/analytics" element={<ProtectedRoute requiredRoles={['finance_viewer', 'finance_editor']}><Analytics /></ProtectedRoute>} />
        <Route path="/logs" element={<ProtectedRoute requiredRoles={['logs_viewer']}><ActivityLogs /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);

export default function App() {
  return (
    <DashboardProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={<MainLayout />} />
        </Routes>
      </Router>
    </DashboardProvider>
  );
}
