export type Role = 'owner' | 'inventory_editor' | 'products_editor' | 'finance_viewer' | 'finance_editor' | 'logs_viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  roles: Role[];
  status: 'Active' | 'Suspended';
  lastLogin?: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: 'Products' | 'Inventory' | 'Users' | 'Analytics' | 'Auth' | 'Settings' | 'Brand Accounts';
  target: string;
  details: string;
}

export interface InventoryHistory {
  id: string;
  timestamp: string;
  user: string;
  action: 'Created' | 'Stock In' | 'Stock Out' | 'Price Update' | 'Threshold Update' | 'Other';
  change?: string;
  notes?: string;
}

export interface Product {
  id: string;
  nameEn: string;
  nameAr: string;
  category: string;
  price: number;
  description: string;
  status: 'Active' | 'Hidden';
  sku: string;
  image?: string;
  linkedInventoryId?: string;
  addedBy: string;
  createdAt: string;
}

export interface RawMaterialItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  minThreshold: number;
  costPerUnit: number;
  supplier?: string;
  lastUpdated: string;
  updatedBy: string;
  addedBy: string;
  createdAt: string;
  history: InventoryHistory[];
}

export interface RawMaterialCategory {
  id: string;
  name: string;
  items: RawMaterialItem[];
}

export interface SizeVariants {
  S: number;
  M: number;
  L: number;
  XL: number;
  XXL: number;
}

export interface FinishedGoodItem {
  id: string;
  name: string;
  color: string;
  sizes: SizeVariants;
  totalQuantity: number;
  sellingPrice: number;
  productionCost: number;
  minThreshold: number;
  lastUpdated: string;
  updatedBy: string;
  addedBy: string;
  createdAt: string;
  history: InventoryHistory[];
}

export interface FinishedGoodSubCategory {
  id: string;
  name: string;
  items: FinishedGoodItem[];
}

export interface FinishedGoodMainCategory {
  id: string;
  name: string;
  subCategories: FinishedGoodSubCategory[];
}

export interface MonthlyStats {
  month: string;
  revenue: number;
  expenses: number;
  orders: number;
  unitsSold: number;
}

export interface EmployeeExpense {
  id: string;
  employeeName: string;
  role: string;
  monthlySalary: number;
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer';
  month: string;
  notes?: string;
  addedBy: string;
  timestamp: string;
}

export interface OperationalExpense {
  id: string;
  type: 'Electricity' | 'Water' | 'Raw Materials Purchase' | 'Production / Factory Cost' | 'Shipping & Delivery' | 'Maintenance & Repairs' | 'Other';
  description: string;
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Supplier Credit';
  referenceNo?: string;
  addedBy: string;
  timestamp: string;
}

export interface MarketingExpense {
  id: string;
  platform: 'Facebook Ads' | 'Instagram' | 'TikTok Ads' | 'Google Ads' | 'Influencer' | 'Other';
  description: string;
  amount: number;
  startDate: string;
  duration?: string;
  results?: string;
  addedBy: string;
  timestamp: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  date: string;
  paymentMethod: 'Credit Card' | 'Wallet Transfer' | 'Bank Transfer' | 'InstaPay';
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
}
