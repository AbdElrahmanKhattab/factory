import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, ActivityLog, Product, RawMaterialCategory, 
  FinishedGoodMainCategory, MonthlyStats, Role,
  EmployeeExpense, OperationalExpense, MarketingExpense, Order
} from '../types';

interface DashboardContextType {
  currentUser: User | null;
  users: User[];
  products: Product[];
  rawMaterials: RawMaterialCategory[];
  finishedGoods: FinishedGoodMainCategory[];
  activityLogs: ActivityLog[];
  monthlyStats: MonthlyStats[];
  darkMode: boolean;
  
  // Brand Accounts State
  employeeExpenses: EmployeeExpense[];
  operationalExpenses: OperationalExpense[];
  marketingExpenses: MarketingExpense[];
  orders: Order[];
  productCategories: string[];
  language: 'en' | 'ar';

  // Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addLog: (log: Omit<ActivityLog, 'id' | 'timestamp'>) => void;
  setDarkMode: (val: boolean) => void;
  setLanguage: (lang: 'en' | 'ar') => void;
  
  // CRUD User
  addUser: (user: User) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;

  // CRUD Products
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addProductCategory: (cat: string) => void;
  deleteProductCategory: (cat: string) => void;

  // CRUD Inventory
  addRawMaterialCategory: (name: string) => void;
  deleteRawMaterialCategory: (id: string) => void;
  addFinishedGoodCategory: (name: string) => void;
  deleteFinishedGoodCategory: (id: string) => void;
  updateRawMaterial: (catId: string, item: any) => void;
  updateFinishedGood: (mainCatId: string, subCatId: string, item: any) => void;
  deleteRawMaterialItem: (catId: string, itemId: string) => void;
  deleteFinishedGoodItem: (mainCatId: string, subCatId: string, itemId: string) => void;

  // CRUD Orders
  addOrder: (order: Order) => void;
  updateOrder: (order: Order) => void;
  deleteOrder: (id: string) => void;

  // CRUD Brand Accounts
  addEmployeeExpense: (exp: EmployeeExpense) => void;
  updateEmployeeExpense: (exp: EmployeeExpense) => void;
  deleteEmployeeExpense: (id: string) => void;
  addOperationalExpense: (exp: OperationalExpense) => void;
  updateOperationalExpense: (exp: OperationalExpense) => void;
  deleteOperationalExpense: (id: string) => void;
  addMarketingExpense: (exp: MarketingExpense) => void;
  updateMarketingExpense: (exp: MarketingExpense) => void;
  deleteMarketingExpense: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState<'en' | 'ar'>('ar');
  
  const [productCategories, setProductCategories] = useState<string[]>(['T-Shirts', 'Pants', 'Jackets', 'Accessories']);

  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Hussein', email: 'hussein@factory.com', password: 'hussein123', roles: ['owner'], status: 'Active' },
    { id: '2', name: 'Abd El-Hakim', email: 'abdelhakim@factory.com', password: 'abdelhakim123', roles: ['owner'], status: 'Active' },
    { id: '3', name: 'Ahmed Sayed', email: 'ahmed@factory.com', password: 'ahmed123', roles: ['inventory_editor'], status: 'Active' },
    { id: '4', name: 'Sara Mohamed', email: 'sara@factory.com', password: 'sara123', roles: ['finance_viewer', 'logs_viewer'], status: 'Active' },
  ]);

  const [products, setProducts] = useState<Product[]>([
    { id: 'p1', nameEn: 'Classic White Round Neck T-Shirt', nameAr: 'تيشيرت أبيض كلاسيك ورقبة مستديرة', category: 'T-Shirts', price: 120, description: 'High quality cotton t-shirt', status: 'Active', sku: 'TS-001', addedBy: 'حسين', createdAt: '2025-05-10T10:00:00Z' },
    { id: 'p2', nameEn: 'Black Slim Jeans', nameAr: 'بنطلون جينز أسود سليم', category: 'Pants', price: 250, description: 'Classic slim fit black jeans', status: 'Active', sku: 'PN-001', addedBy: 'أحمد سيد', createdAt: '2025-06-15T12:00:00Z' },
    { id: 'p3', nameEn: 'Navy Blue Polo', nameAr: 'تيشيرت بولو كحلي', category: 'T-Shirts', price: 180, description: 'Elegant navy blue polo shirt', status: 'Active', sku: 'TS-002', addedBy: 'حسين', createdAt: '2025-07-20T14:30:00Z' },
  ]);

  const [rawMaterials, setRawMaterials] = useState<RawMaterialCategory[]>([
    { id: 'rmc1', name: 'Fabrics', items: [
      { id: 'rmi1', name: 'Cotton Fabric', unit: 'meters', quantity: 500, minThreshold: 100, costPerUnit: 45, supplier: 'Textile Co', lastUpdated: new Date().toISOString(), updatedBy: 'أحمد سيد', addedBy: 'حسين', createdAt: '2025-01-01T09:00:00Z', history: [
        { id: 'h1', timestamp: '2025-01-01T09:00:00Z', user: 'حسين', action: 'Created', notes: 'الرصيد الافتتاحي' },
        { id: 'h2', timestamp: '2025-03-10T11:00:00Z', user: 'أحمد سيد', action: 'Stock In', change: '+50', notes: 'توريد جديد من Textile Co' }
      ]},
      { id: 'rmi2', name: 'Polyester', unit: 'meters', quantity: 200, minThreshold: 50, costPerUnit: 30, supplier: 'Synthetic Ltd', lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'System', createdAt: '2025-01-01T09:00:00Z', history: [{ id: 'h3', timestamp: '2025-01-01T09:00:00Z', user: 'System', action: 'Created' }] },
      { id: 'rmi3', name: 'Linen', unit: 'meters', quantity: 80, minThreshold: 80, costPerUnit: 60, supplier: 'Flax World', lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'System', createdAt: '2025-01-01T09:00:00Z', history: [{ id: 'h4', timestamp: '2025-01-01T09:00:00Z', user: 'System', action: 'Created' }] },
    ]},
    { id: 'rmc2', name: 'Accessories', items: [
      { id: 'rmi4', name: 'Buttons Large', unit: 'pcs', quantity: 3000, minThreshold: 500, costPerUnit: 0.5, lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'System', createdAt: '2025-01-01T09:00:00Z', history: [{ id: 'h5', timestamp: '2025-01-01T09:00:00Z', user: 'System', action: 'Created' }] },
      { id: 'rmi5', name: 'Zippers', unit: 'pcs', quantity: 800, minThreshold: 200, costPerUnit: 3, lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'System', createdAt: '2025-01-01T09:00:00Z', history: [{ id: 'h6', timestamp: '2025-01-01T09:00:00Z', user: 'System', action: 'Created' }] },
      { id: 'rmi6', name: 'Thread White', unit: 'rolls', quantity: 100, minThreshold: 20, costPerUnit: 15, lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'System', createdAt: '2025-01-01T09:00:00Z', history: [{ id: 'h7', timestamp: '2025-01-01T09:00:00Z', user: 'System', action: 'Created' }] },
    ]},
    { id: 'rmc3', name: 'Packaging', items: [
      { id: 'rmi7', name: 'Poly Bags', unit: 'pcs', quantity: 1500, minThreshold: 300, costPerUnit: 0.3, lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'System', createdAt: '2025-01-01T09:00:00Z', history: [{ id: 'h8', timestamp: '2025-01-01T09:00:00Z', user: 'System', action: 'Created' }] },
      { id: 'rmi8', name: 'Hangers', unit: 'pcs', quantity: 400, minThreshold: 400, costPerUnit: 2, lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'System', createdAt: '2025-01-01T09:00:00Z', history: [{ id: 'h9', timestamp: '2025-01-01T09:00:00Z', user: 'System', action: 'Created' }] },
    ]},
  ]);

  const [finishedGoods, setFinishedGoods] = useState<FinishedGoodMainCategory[]>([
    { id: 'fgc1', name: 'T-Shirts', subCategories: [
      { id: 'fgsc1', name: 'Round Neck', items: [
        { id: 'fgi1', name: 'Classic White', color: 'White', sizes: { S: 50, M: 80, L: 60, XL: 30, XXL: 10 }, totalQuantity: 230, sellingPrice: 120, productionCost: 55, minThreshold: 50, lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'System', createdAt: '2025-01-01T09:00:00Z', history: [{ id: 'h10', timestamp: '2025-01-01T09:00:00Z', user: 'System', action: 'Created' }] },
      ]},
      { id: 'fgsc2', name: 'V-Neck', items: [
        { id: 'fgi2', name: 'Black V-Neck', color: 'Black', sizes: { S: 20, M: 35, L: 25, XL: 10, XXL: 5 }, totalQuantity: 95, sellingPrice: 130, productionCost: 58, minThreshold: 30, lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'System', createdAt: '2025-01-01T09:00:00Z', history: [{ id: 'h11', timestamp: '2025-01-01T09:00:00Z', user: 'System', action: 'Created' }] },
      ]},
    ]},
    { id: 'fgc2', name: 'Pants', subCategories: [
      { id: 'fgsc3', name: 'Jeans', items: [
        { id: 'fgi3', name: 'Slim Blue Jeans', color: 'Blue', sizes: { S: 15, M: 40, L: 35, XL: 20, XXL: 8 }, totalQuantity: 118, sellingPrice: 250, productionCost: 120, minThreshold: 20, lastUpdated: new Date().toISOString(), updatedBy: 'System', addedBy: 'حسين', createdAt: '2025-02-01T10:00:00Z', history: [{ id: 'h12', timestamp: '2025-02-01T10:00:00Z', user: 'حسين', action: 'Created' }] },
      ]},
    ]},
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: 'l1', timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(), user: 'حسين', action: 'تسجيل دخول', module: 'النظام', target: 'حساب الشخصي', details: 'دخول ناجح للنظام' },
    { id: 'l2', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), user: 'أحمد سيد', action: 'تعديل مخزون', module: 'المخزون', target: 'قماش قطن', details: 'زيادة المخزون بمقدار 50 متر' },
  ]);

  const [employeeExpenses, setEmployeeExpenses] = useState<EmployeeExpense[]>([
    // Fixed salaries (17,000 per month)
    ...Array.from({ length: 12 }).flatMap((_, i) => {
      const date = new Date(2026, 3 - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return [
        { id: `ee-${monthStr}-1`, employeeName: 'خالد أحمد', role: 'خياط', monthlySalary: 4500, month: monthStr, paymentDate: `${monthStr}-01`, paymentMethod: 'Cash', addedBy: 'حسين', timestamp: new Date().toISOString() },
        { id: `ee-${monthStr}-2`, employeeName: 'محمود إبراهيم', role: 'عامل تعبئة', monthlySalary: 3200, month: monthStr, paymentDate: `${monthStr}-01`, paymentMethod: 'Cash', addedBy: 'حسين', timestamp: new Date().toISOString() },
        { id: `ee-${monthStr}-3`, employeeName: 'فاطمة علي', role: 'مراقبة جودة', monthlySalary: 3800, month: monthStr, paymentDate: `${monthStr}-01`, paymentMethod: 'Bank Transfer', addedBy: 'عبد الحكيم', timestamp: new Date().toISOString() },
        { id: `ee-${monthStr}-4`, employeeName: 'سارة محمد', role: 'محاسبة', monthlySalary: 5500, month: monthStr, paymentDate: `${monthStr}-01`, paymentMethod: 'Cash', addedBy: 'حسين', timestamp: new Date().toISOString() },
      ];
    })
  ]);

  const [operationalExpenses, setOperationalExpenses] = useState<OperationalExpense[]>([
    // Varied operational expenses (~15k - 20k per month)
    ...Array.from({ length: 12 }).flatMap((_, i) => {
      const date = new Date(2026, 3 - i, 5);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      // Add random fluctuation +/- 15%
      const variance = 0.85 + Math.random() * 0.3; 
      return [
        { id: `oe-${monthStr}-1`, type: 'Electricity' as any, description: `كهرباء ${monthStr}`, amount: Math.round(3500 * variance), date: `${monthStr}-05`, paymentMethod: 'Cash', addedBy: 'حسين', timestamp: new Date().toISOString() },
        { id: `oe-${monthStr}-2`, type: 'Water' as any, description: `مياه ${monthStr}`, amount: Math.round(500 * variance), date: `${monthStr}-05`, paymentMethod: 'Cash', addedBy: 'حسين', timestamp: new Date().toISOString() },
        { id: `oe-${monthStr}-3`, type: 'Production / Factory Cost' as any, description: `إيجار وخدمات ${monthStr}`, amount: Math.round(12500 * (0.95 + Math.random() * 0.1)), date: `${monthStr}-01`, paymentMethod: 'Bank Transfer', addedBy: 'عبد الحكيم', timestamp: new Date().toISOString() },
      ];
    })
  ]);

  const [marketingExpenses, setMarketingExpenses] = useState<MarketingExpense[]>([
    // Higher variance for marketing (~8k - 15k per month)
    ...Array.from({ length: 12 }).flatMap((_, i) => {
      const date = new Date(2026, 3 - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      // Seasonal multiplier: Higher in winter months (Oct-Dec)
      const monthIdx = date.getMonth();
      const seasonMult = (monthIdx >= 9 || monthIdx <= 0) ? 1.5 : 1.0;
      const variance = 0.7 + Math.random() * 0.6;
      return [
        { id: `me-${monthStr}-1`, platform: 'Facebook Ads', description: `حملة فيسبوك ${monthStr}`, amount: Math.round(8000 * variance * seasonMult), startDate: `${monthStr}-01`, duration: '30 days', addedBy: 'حسين', timestamp: new Date().toISOString() },
        { id: `me-${monthStr}-2`, platform: 'Instagram', description: `انستجرام ${monthStr}`, amount: Math.round(3000 * variance), startDate: `${monthStr}-05`, duration: '15 days', addedBy: 'حسين', timestamp: new Date().toISOString() },
      ];
    })
  ]);

  const [orders, setOrders] = useState<Order[]>([
    // Varied orders (100k - 250k revenue per month)
    ...Array.from({ length: 12 }).flatMap((_, i) => {
      const date = new Date(2026, 3 - i, 15);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthIdx = date.getMonth();
      // Trend: Growth over time + Seasonal spikes in winter
      const trendMult = 1 + ( (11 - i) * 0.03); // Slight growth
      const seasonMult = (monthIdx >= 9 || monthIdx <= 0) ? 1.4 : 1.0;
      const variance = 0.8 + Math.random() * 0.4;
      
      const bulkQty = Math.round(1200 * trendMult * seasonMult * variance);
      const retailQty = Math.round(300 * variance);

      return [
        { id: `ORD-${monthStr}-01`, customerName: 'تاجر جملة الرئيسي', customerPhone: '0101111111', items: [{ productId: 'p1', name: 'تيشيرت صيفي', quantity: bulkQty, price: 100 }], totalAmount: Math.round(bulkQty * 100), date: `${monthStr}-10`, paymentMethod: 'Bank Transfer', status: 'Delivered' },
        { id: `ORD-${monthStr}-02`, customerName: 'منفذ بيع القاهرة', customerPhone: '0102222222', items: [{ productId: 'p2', name: 'بنطلون جينز', quantity: retailQty, price: 250 }], totalAmount: Math.round(retailQty * 250), date: `${monthStr}-20`, paymentMethod: 'InstaPay', status: 'Delivered' },
      ];
    })
  ]);

  const [monthlyStats] = useState<MonthlyStats[]>([
    { month: 'Jan', revenue: 45000, expenses: 28000, orders: 120, unitsSold: 340 },
    { month: 'Feb', revenue: 52000, expenses: 31000, orders: 145, unitsSold: 410 },
    { month: 'Mar', revenue: 48000, expenses: 29000, orders: 130, unitsSold: 375 },
    { month: 'Apr', revenue: 61000, expenses: 35000, orders: 170, unitsSold: 490 },
    { month: 'May', revenue: 57000, expenses: 34000, orders: 155, unitsSold: 445 },
    { month: 'Jun', revenue: 70000, expenses: 40000, orders: 200, unitsSold: 570 },
    { month: 'Jul', revenue: 65000, expenses: 38000, orders: 185, unitsSold: 530 },
    { month: 'Aug', revenue: 73000, expenses: 43000, orders: 210, unitsSold: 600 },
    { month: 'Sep', revenue: 68000, expenses: 40000, orders: 195, unitsSold: 555 },
    { month: 'Oct', revenue: 80000, expenses: 47000, orders: 230, unitsSold: 660 },
    { month: 'Nov', revenue: 75000, expenses: 44000, orders: 215, unitsSold: 615 },
    { month: 'Dec', revenue: 90000, expenses: 52000, orders: 260, unitsSold: 740 },
  ]);

  useEffect(() => {
    const savedSession = localStorage.getItem('dash_session');
    if (savedSession) {
      const user = JSON.parse(savedSession);
      const fullUser = users.find(u => u.id === user.id);
      if (fullUser) setCurrentUser(fullUser);
    }
    const savedTheme = localStorage.getItem('dash_theme');
    if (savedTheme === 'dark') setDarkMode(true);
  }, []);

  // Load from localStorage if available
  useEffect(() => {
    const savedLang = localStorage.getItem('factory-lang') as 'en' | 'ar';
    if (savedLang) setLanguage(savedLang);
    
    const savedTheme = localStorage.getItem('factory-theme');
    if (savedTheme) {
        setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('factory-lang', language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    localStorage.setItem('factory-theme', darkMode ? 'dark' : 'light');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const login = (email: string, password: string) => {
    const user = users.find(u => u.email === email && u.password === password);
    if (user && user.status === 'Active') {
      setCurrentUser(user);
      localStorage.setItem('dash_session', JSON.stringify({ id: user.id }));
      addLog({ user: user.name, action: 'Login', module: 'Auth', target: 'Self', details: 'Successful login' });
      return true;
    }
    return false;
  };

  const logout = () => {
    if (currentUser) {
      addLog({ user: currentUser.name, action: 'Logout', module: 'Auth', target: 'Self', details: 'User logged out' });
    }
    setCurrentUser(null);
    localStorage.removeItem('dash_session');
  };

  const addLog = (log: Omit<ActivityLog, 'id' | 'timestamp'>) => {
    const newLog = {
      ...log,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString()
    };
    setActivityLogs(prev => [newLog, ...prev]);
  };

  const toggleDarkMode = (val: boolean) => {
    setDarkMode(val);
    localStorage.setItem('dash_theme', val ? 'dark' : 'light');
    if (val) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const addUser = (user: User) => setUsers(prev => [...prev, user]);
  const updateUser = (user: User) => setUsers(prev => prev.map(u => u.id === user.id ? user : u));
  const deleteUser = (id: string) => setUsers(prev => prev.filter(u => u.id !== id));

  const addProduct = (p: Product) => {
    const newProduct = {
        ...p,
        addedBy: currentUser?.name || 'System',
        createdAt: new Date().toISOString()
    };
    setProducts(prev => [...prev, newProduct]);
  };
  const updateProduct = (p: Product) => setProducts(prev => prev.map(old => old.id === p.id ? p : old));
  const deleteProduct = (id: string) => setProducts(prev => prev.filter(p => p.id !== id));

  const addProductCategory = (cat: string) => setProductCategories(prev => [...prev, cat]);
  const deleteProductCategory = (cat: string) => setProductCategories(prev => prev.filter(c => c !== cat));

  const addRawMaterialCategory = (name: string) => {
    const newCat = { id: Math.random().toString(36).substr(2, 9), name, items: [] };
    setRawMaterials(prev => [...prev, newCat]);
  };
  const deleteRawMaterialCategory = (id: string) => setRawMaterials(prev => prev.filter(c => c.id !== id));

  const addFinishedGoodCategory = (name: string) => {
    const newCat = { id: Math.random().toString(36).substr(2, 9), name, subCategories: [] };
    setFinishedGoods(prev => [...prev, newCat]);
  };
  const deleteFinishedGoodCategory = (id: string) => setFinishedGoods(prev => prev.filter(c => c.id !== id));

  const updateRawMaterial = (catId: string, item: any) => {
    setRawMaterials(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const exists = cat.items.find(i => i.id === item.id);
      
      const historyEntry = {
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        user: currentUser?.name || 'System',
        action: (exists ? (item.quantity !== exists.quantity ? (item.quantity > exists.quantity ? 'Stock In' : 'Stock Out') : 'Other') : 'Created') as any,
        change: exists ? (item.quantity !== exists.quantity ? `${item.quantity - exists.quantity}` : undefined) : `${item.quantity}`,
      };

      if (exists) {
        const updatedItem = { 
          ...item, 
          lastUpdated: new Date().toISOString(), 
          updatedBy: currentUser?.name || 'System',
          history: [historyEntry, ...(exists.history || [])]
        };
        return { ...cat, items: cat.items.map(i => i.id === item.id ? updatedItem : i) };
      }

      const newItem = {
          ...item,
          addedBy: currentUser?.name || 'System',
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          updatedBy: currentUser?.name || 'System',
          history: [historyEntry]
      };
      return { ...cat, items: [...cat.items, newItem] };
    }));
  };

  const updateFinishedGood = (mainCatId: string, subCatId: string, item: any) => {
    setFinishedGoods(prev => prev.map(mc => {
      if (mc.id !== mainCatId) return mc;
      return {
        ...mc,
        subCategories: mc.subCategories.map(sc => {
          if (sc.id !== subCatId) return sc;
          const exists = sc.items.find(i => i.id === item.id);
          
          const historyEntry = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            user: currentUser?.name || 'System',
            action: (exists ? (item.totalQuantity !== exists.totalQuantity ? (item.totalQuantity > exists.totalQuantity ? 'Stock In' : 'Stock Out') : 'Other') : 'Created') as any,
            change: exists ? (item.totalQuantity !== exists.totalQuantity ? `${item.totalQuantity - exists.totalQuantity}` : undefined) : `${item.totalQuantity}`,
          };

          if (exists) {
            const updatedItem = { 
              ...item,
              lastUpdated: new Date().toISOString(), 
              updatedBy: currentUser?.name || 'System',
              history: [historyEntry, ...(exists.history || [])]
            };
            return { ...sc, items: sc.items.map(i => i.id === item.id ? updatedItem : i) };
          }

          const newItem = {
              ...item,
              addedBy: currentUser?.name || 'System',
              createdAt: new Date().toISOString(),
              lastUpdated: new Date().toISOString(),
              updatedBy: currentUser?.name || 'System',
              history: [historyEntry]
          };
          return { ...sc, items: [...sc.items, newItem] };
        })
      };
    }));
  };

  const deleteRawMaterialItem = (catId: string, itemId: string) => {
    setRawMaterials(prev => prev.map(cat => cat.id === catId ? ({ ...cat, items: cat.items.filter(i => i.id !== itemId) }) : cat));
  };

  const deleteFinishedGoodItem = (mainCatId: string, subCatId: string, itemId: string) => {
    setFinishedGoods(prev => prev.map(mc => mc.id === mainCatId ? ({
      ...mc,
      subCategories: mc.subCategories.map(sc => sc.id === subCatId ? ({ ...sc, items: sc.items.filter(i => i.id !== itemId) }) : sc)
    }) : mc));
  };

  const addOrder = (order: Order) => setOrders(prev => [order, ...prev]);
  const updateOrder = (order: Order) => setOrders(prev => prev.map(o => o.id === order.id ? order : o));
  const deleteOrder = (id: string) => setOrders(prev => prev.filter(o => o.id !== id));

  const addEmployeeExpense = (exp: EmployeeExpense) => setEmployeeExpenses(prev => [...prev, exp]);
  const updateEmployeeExpense = (exp: EmployeeExpense) => setEmployeeExpenses(prev => prev.map(e => e.id === exp.id ? exp : e));
  const deleteEmployeeExpense = (id: string) => setEmployeeExpenses(prev => prev.filter(e => e.id !== id));

  const addOperationalExpense = (exp: OperationalExpense) => setOperationalExpenses(prev => [...prev, exp]);
  const updateOperationalExpense = (exp: OperationalExpense) => setOperationalExpenses(prev => prev.map(e => e.id === exp.id ? exp : e));
  const deleteOperationalExpense = (id: string) => setOperationalExpenses(prev => prev.filter(e => e.id !== id));

  const addMarketingExpense = (exp: MarketingExpense) => setMarketingExpenses(prev => [...prev, exp]);
  const updateMarketingExpense = (exp: MarketingExpense) => setMarketingExpenses(prev => prev.map(e => e.id === exp.id ? exp : e));
  const deleteMarketingExpense = (id: string) => setMarketingExpenses(prev => prev.filter(e => e.id !== id));

  return (
    <DashboardContext.Provider value={{
      currentUser, users, products, rawMaterials, finishedGoods, activityLogs, monthlyStats, darkMode,
      employeeExpenses, operationalExpenses, marketingExpenses, orders, productCategories, language,
      login, logout, addLog, setDarkMode: toggleDarkMode, setLanguage,
      addUser, updateUser, deleteUser,
      addProduct, updateProduct, deleteProduct, addProductCategory, deleteProductCategory,
      addRawMaterialCategory, deleteRawMaterialCategory, addFinishedGoodCategory, deleteFinishedGoodCategory,
      updateRawMaterial, updateFinishedGood, deleteRawMaterialItem, deleteFinishedGoodItem,
      addOrder, updateOrder, deleteOrder,
      addEmployeeExpense, updateEmployeeExpense, deleteEmployeeExpense,
      addOperationalExpense, updateOperationalExpense, deleteOperationalExpense,
      addMarketingExpense, updateMarketingExpense, deleteMarketingExpense
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) throw new Error('useDashboard must be used within DashboardProvider');
  return context;
};
