// ─── User & Auth ────────────────────────────────────────────────────────────
export type UserRole = 'ADMIN' | 'MANAGER' | 'CASHIER' | 'ACCOUNTANT';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  pin?: string;
  phone?: string;
  branch: string;
  active: boolean;
  avatar?: string;
  lastLogin?: string;
  twoFactorEnabled?: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loginMethod: 'password' | 'pin' | null;
}

// ─── Product & Inventory ─────────────────────────────────────────────────────
export type VATClass = 'STANDARD' | 'ZERO_RATED' | 'EXEMPT';
export type UnitType = 'pcs' | 'kg' | 'litre' | 'dozen' | 'carton' | 'pack' | 'bundle';

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  category: string;
  brand?: string;
  unit: UnitType;
  buyingPrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  vatClass: VATClass;
  supplierId?: string;
  imageUrl?: string;
  reorderLevel: number;
  reorderQty: number;
  minStock: number;
  maxStock: number;
  currentStock: number;
  active: boolean;
  trackExpiry: boolean;
  batches?: Batch[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate?: string;
  quantity: number;
  costPrice: number;
  receivedAt: string;
}

// ─── Stock Movements ─────────────────────────────────────────────────────────
export type StockMovementType =
  | 'SALE'
  | 'GOODS_IN'
  | 'GOODS_OUT'
  | 'ADJUSTMENT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'RETURN_TO_SUPPLIER'
  | 'RETURN_FROM_CUSTOMER'
  | 'WRITE_OFF'
  | 'OPENING';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  unitCost?: number;
  balanceBefore: number;
  balanceAfter: number;
  reason: string;
  referenceId?: string;
  performedBy: string;
  performedByRole: UserRole;
  branch: string;
  deviceInfo?: string;
  createdAt: string;
}

// ─── Categories ───────────────────────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  nameKiswahili?: string;
  icon?: string;
  color?: string;
  active: boolean;
}

// ─── Suppliers ───────────────────────────────────────────────────────────────
export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  kraPin?: string;
  town: string;
  paymentTerms?: string;
  outstandingBalance: number;
  active: boolean;
}

// ─── GRN (Goods Received Note) ───────────────────────────────────────────────
export type GRNStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';

export interface GRNItem {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  batchNumber?: string;
  expiryDate?: string;
}

export interface GRN {
  id: string;
  supplierId: string;
  supplierName: string;
  items: GRNItem[];
  totalCost: number;
  status: GRNStatus;
  deliveryNoteNo?: string;
  invoiceNo?: string;
  createdBy: string;
  approvedBy?: string;
  branch: string;
  notes?: string;
  createdAt: string;
  approvedAt?: string;
}

// ─── Sales & POS ─────────────────────────────────────────────────────────────
export type PaymentMethod = 'CASH' | 'MPESA' | 'AIRTEL_MONEY' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT';

export interface PaymentSplit {
  method: PaymentMethod;
  amount: number;
  reference?: string;
  mpesaStatus?: 'PENDING' | 'CONFIRMED' | 'FAILED';
}

export interface SaleItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  vatClass: VATClass;
  vatAmount: number;
  subtotal: number;
  unit: UnitType;
}

export type SaleStatus = 'PENDING' | 'COMPLETED' | 'VOIDED' | 'PARKED' | 'REFUNDED';

export interface Sale {
  id: string;
  receiptNumber: string;
  items: SaleItem[];
  customerId?: string;
  customerName?: string;
  payments: PaymentSplit[];
  subtotal: number;
  discountTotal: number;
  vatTotal: number;
  grandTotal: number;
  amountPaid: number;
  change: number;
  status: SaleStatus;
  cashierId: string;
  cashierName: string;
  branch: string;
  shiftId: string;
  etimsInvoiceNo?: string;
  notes?: string;
  voidReason?: string;
  voidedBy?: string;
  createdAt: string;
  completedAt?: string;
}

// ─── Customers ────────────────────────────────────────────────────────────────
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  kraPin?: string;
  customerType: 'RETAIL' | 'WHOLESALE';
  creditLimit: number;
  creditBalance: number;
  loyaltyPoints: number;
  town?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
}

// ─── Shifts ───────────────────────────────────────────────────────────────────
export type ShiftStatus = 'OPEN' | 'CLOSED';

export interface Shift {
  id: string;
  cashierId: string;
  cashierName: string;
  branch: string;
  openingFloat: number;
  closingCash?: number;
  expectedCash?: number;
  variance?: number;
  salesTotal: number;
  transactionCount: number;
  status: ShiftStatus;
  openedAt: string;
  closedAt?: string;
}

// ─── Expenses ─────────────────────────────────────────────────────────────────
export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  recordedBy: string;
  branch: string;
  receiptUrl?: string;
  createdAt: string;
}

// ─── Audit Log ───────────────────────────────────────────────────────────────
export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'SALE_CREATED'
  | 'SALE_VOIDED'
  | 'STOCK_RECEIVED'
  | 'STOCK_ADJUSTED'
  | 'STOCK_WRITTEN_OFF'
  | 'PRODUCT_CREATED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_DELETED'
  | 'PRICE_CHANGED'
  | 'DISCOUNT_GIVEN'
  | 'REFUND_PROCESSED'
  | 'USER_CREATED'
  | 'USER_DELETED'
  | 'SETTINGS_CHANGED'
  | 'GRN_APPROVED'
  | 'CASH_VARIANCE';

export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  description: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  performedBy: string;
  performedByRole: UserRole;
  branch: string;
  ipAddress?: string;
  deviceInfo?: string;
  createdAt: string;
}

// ─── Settings ─────────────────────────────────────────────────────────────────
export interface BusinessSettings {
  name: string;
  legalName?: string;
  kraPin: string;
  phone: string;
  email?: string;
  address: string;
  town: string;
  county: string;
  logo?: string;
  currency: string;
  vatRate: number;
  vatInclusivePricing: boolean;
  receiptFooter?: string;
  mpesaTillNumber?: string;
  mpesaPaybill?: string;
  mpesaAccountNumber?: string;
  mpesaConsumerKey?: string;
  mpesaConsumerSecret?: string;
  mpesaSandboxMode: boolean;
  africasTalkingApiKey?: string;
  africasTalkingUsername?: string;
  smsSendReceipts: boolean;
  smsLowStock: boolean;
  pinLockTimeout: number;
  requireAdminForDiscount: boolean;
  discountThreshold: number;
  etimsEnabled: boolean;
  etimsSandboxMode: boolean;
}

// ─── Notification ─────────────────────────────────────────────────────────────
export type NotificationType = 'LOW_STOCK' | 'EXPIRY_ALERT' | 'PENDING_APPROVAL' | 'FAILED_PAYMENT' | 'CASH_VARIANCE' | 'SECURITY' | 'INFO';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

// ─── Branch ───────────────────────────────────────────────────────────────────
export interface Branch {
  id: string;
  name: string;
  town: string;
  county: string;
  phone?: string;
  managerName?: string;
  active: boolean;
}

// ─── Barcode Label ────────────────────────────────────────────────────────────
export interface LabelConfig {
  width: number;
  height: number;
  showName: boolean;
  showPrice: boolean;
  showBarcode: boolean;
  showSku: boolean;
  showExpiry: boolean;
  quantity: number;
}
