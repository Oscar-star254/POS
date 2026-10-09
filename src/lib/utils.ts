import type { VATClass } from '../types';

// ─── Currency ─────────────────────────────────────────────────────────────────
export const formatKES = (amount: number): string => {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (n: number): string =>
  new Intl.NumberFormat('en-KE').format(n);

// ─── Dates ────────────────────────────────────────────────────────────────────
export const formatDate = (iso: string): string => {
  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    timeZone: 'Africa/Nairobi',
  }).format(new Date(iso));
};

export const formatDateTime = (iso: string): string => {
  return new Intl.DateTimeFormat('en-KE', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Africa/Nairobi',
    hour12: false,
  }).format(new Date(iso));
};

export const formatTime = (iso: string): string => {
  return new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Africa/Nairobi',
    hour12: false,
  }).format(new Date(iso));
};

export const timeAgo = (iso: string): string => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return formatDate(iso);
};

// ─── VAT ──────────────────────────────────────────────────────────────────────
export const VAT_RATE = 0.16;

export const calculateVAT = (amount: number, vatClass: VATClass, inclusive: boolean): number => {
  if (vatClass !== 'STANDARD') return 0;
  if (inclusive) return amount - amount / (1 + VAT_RATE);
  return amount * VAT_RATE;
};

export const getVATLabel = (vatClass: VATClass): string => {
  switch (vatClass) {
    case 'STANDARD': return 'VAT 16%';
    case 'ZERO_RATED': return 'Zero-rated';
    case 'EXEMPT': return 'VAT Exempt';
  }
};

// ─── Receipt Number ───────────────────────────────────────────────────────────
export const generateReceiptNumber = (): string => {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RCT-${date}-${rand}`;
};

export const generateGRNNumber = (): string => {
  const now = new Date();
  const rand = Math.floor(100 + Math.random() * 900);
  return `GRN-${now.getFullYear()}-${rand}`;
};

// ─── Barcode ──────────────────────────────────────────────────────────────────
export const generateEAN13 = (): string => {
  const digits = '600' + Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
  const sum = digits.split('').reduce((acc, d, i) => {
    return acc + parseInt(d) * (i % 2 === 0 ? 1 : 3);
  }, 0);
  const check = (10 - (sum % 10)) % 10;
  return digits + check;
};

// ─── M-Pesa ───────────────────────────────────────────────────────────────────
export const generateMpesaRef = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789';
  return 'Q' + Array.from({ length: 9 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

export const simulateMpesaSTK = (phone: string, amount: number): Promise<{ success: boolean; reference: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.15;
      resolve({
        success,
        reference: success ? generateMpesaRef() : '',
      });
    }, 3000 + Math.random() * 2000);
  });
};

// ─── Stock ────────────────────────────────────────────────────────────────────
export const stockStatus = (current: number, reorderLevel: number): 'OUT' | 'LOW' | 'OK' => {
  if (current <= 0) return 'OUT';
  if (current <= reorderLevel) return 'LOW';
  return 'OK';
};

// ─── Permissions ─────────────────────────────────────────────────────────────
import type { UserRole } from '../types';

export const canManageStock = (role: UserRole): boolean => role === 'ADMIN';
export const canViewCostPrice = (role: UserRole): boolean => role === 'ADMIN' || role === 'ACCOUNTANT';
export const canViewReports = (role: UserRole): boolean => role !== 'CASHIER';
export const canManageUsers = (role: UserRole): boolean => role === 'ADMIN';
export const canVoidSale = (role: UserRole): boolean => role === 'ADMIN' || role === 'MANAGER';
export const canApproveGRN = (role: UserRole): boolean => role === 'ADMIN';

export const PERMISSION_DENIED = 'Access denied. This action requires ADMIN privileges.';

// ─── Misc ─────────────────────────────────────────────────────────────────────
export const clsx = (...classes: (string | boolean | undefined | null)[]): string =>
  classes.filter(Boolean).join(' ');

export const truncate = (str: string, n: number): string =>
  str.length > n ? str.slice(0, n) + '…' : str;

export const trendColor = (value: number): string => {
  if (value > 0) return 'text-[#6B8F71]';
  if (value < 0) return 'text-[#B5574B]';
  return 'text-[#64748B]';
};

export const trendBg = (value: number): string => {
  if (value > 0) return 'badge-sage';
  if (value < 0) return 'badge-terracotta';
  return 'badge-slate';
};
