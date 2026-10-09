import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import type {
  User, Product, Customer, Sale, Shift, Expense, AuditLog, Notification,
  StockMovement, Category, Supplier, GRN, Branch, BusinessSettings,
  AuditAction, UserRole, SaleItem, PaymentSplit
} from '../types';
import {
  seedProducts, seedUsers, seedCustomers, seedShifts, seedExpenses,
  seedAuditLogs, seedNotifications, seedStockMovements, seedCategories,
  seedSuppliers, branches as seedBranches, defaultSettings
} from '../data/seed';
import { generateReceiptNumber, canManageStock, PERMISSION_DENIED } from '../lib/utils';

// ─── State ────────────────────────────────────────────────────────────────────
interface AppState {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  loginMethod: 'password' | 'pin' | null;
  // Data
  users: User[];
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  customers: Customer[];
  sales: Sale[];
  shifts: Shift[];
  expenses: Expense[];
  auditLogs: AuditLog[];
  notifications: Notification[];
  stockMovements: StockMovement[];
  grns: GRN[];
  branches: Branch[];
  settings: BusinessSettings;
  // UI
  darkMode: boolean;
  language: 'en' | 'sw';
  activeBranch: string;
  activeShiftId: string | null;
  onlineStatus: 'online' | 'offline' | 'syncing';
  currentPage: string;
  sidebarOpen: boolean;
}

type Action =
  | { type: 'LOGIN'; user: User; method: 'password' | 'pin' }
  | { type: 'LOGOUT' }
  | { type: 'SET_PAGE'; page: string }
  | { type: 'TOGGLE_DARK' }
  | { type: 'SET_LANGUAGE'; lang: 'en' | 'sw' }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; open: boolean }
  | { type: 'MARK_NOTIFICATION_READ'; id: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'ADD_SALE'; sale: Sale }
  | { type: 'VOID_SALE'; id: string; reason: string; voidedBy: string }
  | { type: 'ADD_STOCK_MOVEMENT'; movement: StockMovement }
  | { type: 'UPDATE_PRODUCT_STOCK'; productId: string; delta: number }
  | { type: 'ADD_PRODUCT'; product: Product }
  | { type: 'UPDATE_PRODUCT'; product: Product }
  | { type: 'ADD_GRN'; grn: GRN }
  | { type: 'APPROVE_GRN'; grnId: string; approvedBy: string }
  | { type: 'ADD_AUDIT'; log: AuditLog }
  | { type: 'OPEN_SHIFT'; shift: Shift }
  | { type: 'CLOSE_SHIFT'; shiftId: string; closingCash: number }
  | { type: 'ADD_CUSTOMER'; customer: Customer }
  | { type: 'ADD_EXPENSE'; expense: Expense }
  | { type: 'ADD_USER'; user: User }
  | { type: 'DELETE_USER'; userId: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<BusinessSettings> }
  | { type: 'SET_ONLINE_STATUS'; status: 'online' | 'offline' | 'syncing' };

// ─── Reducer ──────────────────────────────────────────────────────────────────
const initialState: AppState = {
  currentUser: null,
  isAuthenticated: false,
  loginMethod: null,
  users: seedUsers,
  products: seedProducts,
  categories: seedCategories,
  suppliers: seedSuppliers,
  customers: seedCustomers,
  sales: [],
  shifts: seedShifts,
  expenses: seedExpenses,
  auditLogs: seedAuditLogs,
  notifications: seedNotifications,
  stockMovements: seedStockMovements,
  grns: [],
  branches: seedBranches,
  settings: defaultSettings,
  darkMode: false,
  language: 'en',
  activeBranch: 'b1',
  activeShiftId: 'sh2',
  onlineStatus: 'online',
  currentPage: 'dashboard',
  sidebarOpen: true,
};

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, currentUser: action.user, isAuthenticated: true, loginMethod: action.method };
    case 'LOGOUT':
      return { ...state, currentUser: null, isAuthenticated: false, loginMethod: null };
    case 'SET_PAGE':
      return { ...state, currentPage: action.page };
    case 'TOGGLE_DARK':
      return { ...state, darkMode: !state.darkMode };
    case 'SET_LANGUAGE':
      return { ...state, language: action.lang };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, sidebarOpen: action.open };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => n.id === action.id ? { ...n, read: true } : n),
      };
    case 'MARK_ALL_READ':
      return { ...state, notifications: state.notifications.map(n => ({ ...n, read: true })) };
    case 'ADD_SALE':
      return { ...state, sales: [action.sale, ...state.sales] };
    case 'VOID_SALE':
      return {
        ...state,
        sales: state.sales.map(s =>
          s.id === action.id ? { ...s, status: 'VOIDED', voidReason: action.reason, voidedBy: action.voidedBy } : s
        ),
      };
    case 'ADD_STOCK_MOVEMENT':
      return { ...state, stockMovements: [action.movement, ...state.stockMovements] };
    case 'UPDATE_PRODUCT_STOCK':
      return {
        ...state,
        products: state.products.map(p =>
          p.id === action.productId
            ? { ...p, currentStock: Math.max(0, p.currentStock + action.delta) }
            : p
        ),
      };
    case 'ADD_PRODUCT':
      return { ...state, products: [action.product, ...state.products] };
    case 'UPDATE_PRODUCT':
      return { ...state, products: state.products.map(p => p.id === action.product.id ? action.product : p) };
    case 'ADD_GRN':
      return { ...state, grns: [action.grn, ...state.grns] };
    case 'APPROVE_GRN': {
      const grn = state.grns.find(g => g.id === action.grnId);
      if (!grn) return state;
      const newMovements: StockMovement[] = grn.items.map(item => ({
        id: `sm-${Date.now()}-${item.productId}`,
        productId: item.productId,
        productName: item.productName,
        type: 'GOODS_IN' as const,
        quantity: item.quantity,
        unitCost: item.unitCost,
        balanceBefore: state.products.find(p => p.id === item.productId)?.currentStock ?? 0,
        balanceAfter: (state.products.find(p => p.id === item.productId)?.currentStock ?? 0) + item.quantity,
        reason: `GRN #${grn.id}`,
        performedBy: action.approvedBy,
        performedByRole: 'ADMIN' as UserRole,
        branch: grn.branch,
        createdAt: new Date().toISOString(),
      }));
      return {
        ...state,
        grns: state.grns.map(g => g.id === action.grnId ? { ...g, status: 'APPROVED', approvedBy: action.approvedBy, approvedAt: new Date().toISOString() } : g),
        products: state.products.map(p => {
          const grnItem = grn.items.find(i => i.productId === p.id);
          return grnItem ? { ...p, currentStock: p.currentStock + grnItem.quantity } : p;
        }),
        stockMovements: [...newMovements, ...state.stockMovements],
      };
    }
    case 'ADD_AUDIT':
      return { ...state, auditLogs: [action.log, ...state.auditLogs] };
    case 'OPEN_SHIFT':
      return { ...state, shifts: [action.shift, ...state.shifts], activeShiftId: action.shift.id };
    case 'CLOSE_SHIFT': {
      const shift = state.shifts.find(s => s.id === action.shiftId);
      if (!shift) return state;
      const shiftSales = state.sales.filter(s => s.shiftId === action.shiftId && s.status === 'COMPLETED');
      const cashSales = shiftSales.reduce((sum, s) => {
        return sum + s.payments.filter(p => p.method === 'CASH').reduce((a, b) => a + b.amount, 0);
      }, 0);
      return {
        ...state,
        activeShiftId: null,
        shifts: state.shifts.map(s =>
          s.id === action.shiftId
            ? { ...s, status: 'CLOSED', closingCash: action.closingCash, expectedCash: shift.openingFloat + cashSales, variance: action.closingCash - (shift.openingFloat + cashSales), closedAt: new Date().toISOString() }
            : s
        ),
      };
    }
    case 'ADD_CUSTOMER':
      return { ...state, customers: [action.customer, ...state.customers] };
    case 'ADD_EXPENSE':
      return { ...state, expenses: [action.expense, ...state.expenses] };
    case 'ADD_USER':
      return { ...state, users: [action.user, ...state.users] };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(user => user.id !== action.userId) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    case 'SET_ONLINE_STATUS':
      return { ...state, onlineStatus: action.status };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  // Helpers
  login: (emailOrPin: string, password?: string) => boolean;
  logout: () => void;
  navigate: (page: string) => void;
  addAudit: (action: AuditAction, entityType: string, description: string, extra?: Partial<AuditLog>) => void;
  completeSale: (items: SaleItem[], payments: PaymentSplit[], customerId?: string, customerName?: string, notes?: string) => Sale | null;
  receiveStock: (productId: string, qty: number, reason: string, unitCost?: number) => boolean;
  adjustStock: (productId: string, newQty: number, reason: string) => boolean;
  writeOffStock: (productId: string, qty: number, reason: string) => boolean;
  createUser: (user: Omit<User, 'id' | 'active'>) => { success: boolean; error?: string };
  deleteUser: (userId: string) => { success: boolean; error?: string };
  unreadCount: number;
}

const AppContext = createContext<AppContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Dark mode sync
  useEffect(() => {
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.darkMode]);

  // Online status
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_ONLINE_STATUS', status: 'online' });
    const handleOffline = () => dispatch({ type: 'SET_ONLINE_STATUS', status: 'offline' });
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  const login = useCallback((emailOrPin: string, password?: string): boolean => {
    if (password !== undefined) {
      // Email + password login
      const user = state.users.find(u => u.email === emailOrPin && u.active);
      if (!user) return false;
      // Seeded demo accounts accept any password; newly created users use their assigned password.
      if (user.password && password !== user.password) return false;
      if (emailOrPin === 'admin@zawadisupermarket.co.ke' && password !== 'admin123') return false;
      dispatch({ type: 'LOGIN', user, method: 'password' });
      dispatch({ type: 'ADD_AUDIT', log: {
        id: `al-${Date.now()}`, action: 'LOGIN', entityType: 'USER', entityId: user.id,
        description: `${user.name} logged in via email/password`,
        performedBy: user.name, performedByRole: user.role,
        branch: user.branch, createdAt: new Date().toISOString(),
      }});
      return true;
    } else {
      // PIN login
      const user = state.users.find(u => u.pin === emailOrPin && u.active);
      if (!user) return false;
      dispatch({ type: 'LOGIN', user, method: 'pin' });
      return true;
    }
  }, [state.users]);

  const logout = useCallback(() => {
    if (state.currentUser) {
      dispatch({ type: 'ADD_AUDIT', log: {
        id: `al-${Date.now()}`, action: 'LOGOUT', entityType: 'USER',
        description: `${state.currentUser.name} logged out`,
        performedBy: state.currentUser.name, performedByRole: state.currentUser.role,
        branch: state.currentUser.branch, createdAt: new Date().toISOString(),
      }});
    }
    dispatch({ type: 'LOGOUT' });
  }, [state.currentUser]);

  const navigate = useCallback((page: string) => {
    dispatch({ type: 'SET_PAGE', page });
  }, []);

  const addAudit = useCallback((action: AuditAction, entityType: string, description: string, extra?: Partial<AuditLog>) => {
    if (!state.currentUser) return;
    dispatch({ type: 'ADD_AUDIT', log: {
      id: `al-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      action, entityType, description,
      performedBy: state.currentUser.name,
      performedByRole: state.currentUser.role,
      branch: state.activeBranch,
      createdAt: new Date().toISOString(),
      ...extra,
    }});
  }, [state.currentUser, state.activeBranch]);

  const completeSale = useCallback((
    items: SaleItem[],
    payments: PaymentSplit[],
    customerId?: string,
    customerName?: string,
    notes?: string
  ): Sale | null => {
    if (!state.currentUser || !state.activeShiftId) return null;

    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const discountTotal = items.reduce((s, i) => s + i.discount * i.quantity, 0);
    const vatTotal = items.reduce((s, i) => s + i.vatAmount, 0);
    const grandTotal = subtotal + vatTotal - discountTotal;
    const amountPaid = payments.reduce((s, p) => s + p.amount, 0);

    const sale: Sale = {
      id: `sale-${Date.now()}`,
      receiptNumber: generateReceiptNumber(),
      items, customerId, customerName,
      payments,
      subtotal, discountTotal, vatTotal, grandTotal,
      amountPaid, change: Math.max(0, amountPaid - grandTotal),
      status: 'COMPLETED',
      cashierId: state.currentUser.id,
      cashierName: state.currentUser.name,
      branch: state.activeBranch,
      shiftId: state.activeShiftId,
      etimsInvoiceNo: `ETI${Date.now()}`,
      notes,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    dispatch({ type: 'ADD_SALE', sale });

    // Deduct stock
    items.forEach(item => {
      const product = state.products.find(p => p.id === item.productId);
      if (product) {
        dispatch({ type: 'UPDATE_PRODUCT_STOCK', productId: item.productId, delta: -item.quantity });
        dispatch({ type: 'ADD_STOCK_MOVEMENT', movement: {
          id: `sm-${Date.now()}-${item.productId}`,
          productId: item.productId,
          productName: item.productName,
          type: 'SALE',
          quantity: -item.quantity,
          balanceBefore: product.currentStock,
          balanceAfter: Math.max(0, product.currentStock - item.quantity),
          reason: `Sale ${sale.receiptNumber}`,
          referenceId: sale.id,
          performedBy: state.currentUser!.name,
          performedByRole: state.currentUser!.role,
          branch: state.activeBranch,
          createdAt: new Date().toISOString(),
        }});
      }
    });

    addAudit('SALE_CREATED', 'SALE', `Sale ${sale.receiptNumber} — ${sale.grandTotal.toFixed(2)} KES`, { entityId: sale.id });

    return sale;
  }, [state.currentUser, state.activeShiftId, state.products, state.activeBranch, addAudit]);

  const receiveStock = useCallback((productId: string, qty: number, reason: string, unitCost?: number): boolean => {
    if (!state.currentUser || !canManageStock(state.currentUser.role)) {
      alert(PERMISSION_DENIED);
      return false;
    }
    const product = state.products.find(p => p.id === productId);
    if (!product) return false;
    dispatch({ type: 'UPDATE_PRODUCT_STOCK', productId, delta: qty });
    dispatch({ type: 'ADD_STOCK_MOVEMENT', movement: {
      id: `sm-${Date.now()}`, productId, productName: product.name,
      type: 'GOODS_IN', quantity: qty, unitCost,
      balanceBefore: product.currentStock, balanceAfter: product.currentStock + qty,
      reason, performedBy: state.currentUser.name, performedByRole: state.currentUser.role,
      branch: state.activeBranch, createdAt: new Date().toISOString(),
    }});
    addAudit('STOCK_RECEIVED', 'PRODUCT', `${qty} units of ${product.name} received`, { entityId: productId });
    return true;
  }, [state.currentUser, state.products, state.activeBranch, addAudit]);

  const adjustStock = useCallback((productId: string, newQty: number, reason: string): boolean => {
    if (!state.currentUser || !canManageStock(state.currentUser.role)) {
      alert(PERMISSION_DENIED);
      return false;
    }
    const product = state.products.find(p => p.id === productId);
    if (!product) return false;
    const delta = newQty - product.currentStock;
    dispatch({ type: 'UPDATE_PRODUCT_STOCK', productId, delta });
    dispatch({ type: 'ADD_STOCK_MOVEMENT', movement: {
      id: `sm-${Date.now()}`, productId, productName: product.name,
      type: 'ADJUSTMENT', quantity: delta,
      balanceBefore: product.currentStock, balanceAfter: newQty,
      reason, performedBy: state.currentUser.name, performedByRole: state.currentUser.role,
      branch: state.activeBranch, createdAt: new Date().toISOString(),
    }});
    addAudit('STOCK_ADJUSTED', 'PRODUCT', `Stock adjusted: ${product.name} — ${product.currentStock} → ${newQty}`, {
      entityId: productId, oldValue: { stock: product.currentStock }, newValue: { stock: newQty }
    });
    return true;
  }, [state.currentUser, state.products, state.activeBranch, addAudit]);

  const writeOffStock = useCallback((productId: string, qty: number, reason: string): boolean => {
    if (!state.currentUser || !canManageStock(state.currentUser.role)) {
      alert(PERMISSION_DENIED);
      return false;
    }
    const product = state.products.find(p => p.id === productId);
    if (!product) return false;
    dispatch({ type: 'UPDATE_PRODUCT_STOCK', productId, delta: -qty });
    dispatch({ type: 'ADD_STOCK_MOVEMENT', movement: {
      id: `sm-${Date.now()}`, productId, productName: product.name,
      type: 'WRITE_OFF', quantity: -qty,
      balanceBefore: product.currentStock, balanceAfter: Math.max(0, product.currentStock - qty),
      reason, performedBy: state.currentUser.name, performedByRole: state.currentUser.role,
      branch: state.activeBranch, createdAt: new Date().toISOString(),
    }});
    addAudit('STOCK_ADJUSTED', 'PRODUCT', `Write-off: ${qty} units of ${product.name} — ${reason}`, { entityId: productId });
    return true;
  }, [state.currentUser, state.products, state.activeBranch, addAudit]);

  const createUser = useCallback((details: Omit<User, 'id' | 'active'>): { success: boolean; error?: string } => {
    if (state.currentUser?.role !== 'ADMIN') {
      return { success: false, error: 'Only an administrator can create users.' };
    }
    if (details.role === 'ADMIN') {
      return { success: false, error: 'Additional administrator accounts cannot be created here.' };
    }
    const email = details.email.trim().toLowerCase();
    if (state.users.some(user => user.email.toLowerCase() === email)) {
      return { success: false, error: 'A user with this email already exists.' };
    }
    if (details.pin && state.users.some(user => user.pin === details.pin)) {
      return { success: false, error: 'This PIN is already assigned to another user.' };
    }

    const user: User = {
      ...details,
      id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      email,
      active: true,
    };
    dispatch({ type: 'ADD_USER', user });
    addAudit('USER_CREATED', 'USER', `${user.name} created with ${user.role} access`, {
      entityId: user.id,
      newValue: { name: user.name, email: user.email, role: user.role, branch: user.branch },
    });
    return { success: true };
  }, [state.currentUser, state.users, addAudit]);

  const deleteUser = useCallback((userId: string): { success: boolean; error?: string } => {
    if (state.currentUser?.role !== 'ADMIN') {
      return { success: false, error: 'Only an administrator can delete users.' };
    }
    const user = state.users.find(candidate => candidate.id === userId);
    if (!user) return { success: false, error: 'User not found.' };
    if (user.id === state.currentUser.id || user.role === 'ADMIN') {
      return { success: false, error: 'The administrator account cannot be deleted.' };
    }

    dispatch({ type: 'DELETE_USER', userId });
    addAudit('USER_DELETED', 'USER', `${user.name} (${user.role}) was deleted`, {
      entityId: user.id,
      oldValue: { name: user.name, email: user.email, role: user.role, branch: user.branch },
    });
    return { success: true };
  }, [state.currentUser, state.users, addAudit]);

  const unreadCount = state.notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider value={{
      state, dispatch,
      login, logout, navigate, addAudit,
      completeSale, receiveStock, adjustStock, writeOffStock,
      createUser, deleteUser,
      unreadCount,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
