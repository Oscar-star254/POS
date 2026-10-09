import type { Product, Category, Supplier, Customer, User, Sale, Shift, Expense, AuditLog, Notification, Branch, BusinessSettings, StockMovement } from '../types';

// ─── Business Settings ────────────────────────────────────────────────────────
export const defaultSettings: BusinessSettings = {
  name: 'Zawadi Supermarket',
  legalName: 'Zawadi Retail Ltd',
  kraPin: 'P051234567X',
  phone: '0722 345 678',
  email: 'info@zawadisupermarket.co.ke',
  address: 'Kimathi Street, Shop 12',
  town: 'Nairobi CBD',
  county: 'Nairobi',
  currency: 'KES',
  vatRate: 16,
  vatInclusivePricing: true,
  receiptFooter: 'Asante kwa ununuzi wako! | Thank you for shopping with us!',
  mpesaTillNumber: '522522',
  mpesaPaybill: '400200',
  mpesaAccountNumber: 'ZAWADI',
  mpesaSandboxMode: true,
  smsSendReceipts: true,
  smsLowStock: true,
  pinLockTimeout: 120,
  requireAdminForDiscount: true,
  discountThreshold: 10,
  etimsEnabled: true,
  etimsSandboxMode: true,
};

// ─── Branches ────────────────────────────────────────────────────────────────
export const branches: Branch[] = [
  { id: 'b1', name: 'Zawadi CBD', town: 'Nairobi CBD', county: 'Nairobi', phone: '0722 345 678', managerName: 'John Kamau', active: true },
  { id: 'b2', name: 'Zawadi Ruiru', town: 'Ruiru', county: 'Kiambu', phone: '0733 456 789', managerName: 'Mary Wanjiku', active: true },
  { id: 'b3', name: 'Zawadi Thika', town: 'Thika', county: 'Kiambu', phone: '0711 567 890', managerName: 'Peter Mwangi', active: true },
  { id: 'b4', name: 'Zawadi Nakuru', town: 'Nakuru', county: 'Nakuru', phone: '0722 678 901', managerName: 'Grace Atieno', active: false },
];

// ─── Users ────────────────────────────────────────────────────────────────────
export const seedUsers: User[] = [
  {
    id: 'u1',
    name: 'Admin Zawadi',
    email: 'admin@zawadisupermarket.co.ke',
    role: 'ADMIN',
    pin: '0000',
    phone: '0722 111 222',
    branch: 'b1',
    active: true,
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    twoFactorEnabled: true,
  },
  {
    id: 'u2',
    name: 'John Kamau',
    email: 'manager@zawadisupermarket.co.ke',
    role: 'MANAGER',
    pin: '1234',
    phone: '0733 222 333',
    branch: 'b1',
    active: true,
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'u3',
    name: 'Aisha Hassan',
    email: 'cashier@zawadisupermarket.co.ke',
    role: 'CASHIER',
    pin: '5678',
    phone: '0711 333 444',
    branch: 'b1',
    active: true,
    lastLogin: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'u4',
    name: 'Mary Wanjiku',
    email: 'mary@zawadisupermarket.co.ke',
    role: 'MANAGER',
    pin: '2468',
    phone: '0722 444 555',
    branch: 'b2',
    active: true,
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'u5',
    name: 'Accountant Jane',
    email: 'accounts@zawadisupermarket.co.ke',
    role: 'ACCOUNTANT',
    pin: '9999',
    phone: '0733 555 666',
    branch: 'b1',
    active: true,
    lastLogin: new Date(Date.now() - 43200000).toISOString(),
  },
];

// ─── Categories ───────────────────────────────────────────────────────────────
export const seedCategories: Category[] = [
  { id: 'c1', name: 'Flour & Grains', nameKiswahili: 'Unga & Nafaka', icon: '🌾', color: '#C9A227', active: true },
  { id: 'c2', name: 'Cooking Essentials', nameKiswahili: 'Vifaa vya Kupikia', icon: '🫙', color: '#2F7F79', active: true },
  { id: 'c3', name: 'Dairy & Eggs', nameKiswahili: 'Maziwa & Mayai', icon: '🥛', color: '#6B8F71', active: true },
  { id: 'c4', name: 'Beverages', nameKiswahili: 'Vinywaji', icon: '🧃', color: '#1F2A44', active: true },
  { id: 'c5', name: 'Bread & Bakery', nameKiswahili: 'Mkate & Bidhaa za Unga', icon: '🍞', color: '#D9C7A3', active: true },
  { id: 'c6', name: 'Personal Care', nameKiswahili: 'Usafi wa Mwili', icon: '🧴', color: '#64748B', active: true },
  { id: 'c7', name: 'Household', nameKiswahili: 'Vifaa vya Nyumba', icon: '🏠', color: '#B5574B', active: true },
  { id: 'c8', name: 'Airtime & Data', nameKiswahili: 'Airtime & Data', icon: '📱', color: '#2F7F79', active: true },
  { id: 'c9', name: 'Meat & Fish', nameKiswahili: 'Nyama & Samaki', icon: '🥩', color: '#B5574B', active: true },
  { id: 'c10', name: 'Snacks & Confectionery', nameKiswahili: 'Vitafunio', icon: '🍪', color: '#C9A227', active: true },
  { id: 'c11', name: 'Detergents', nameKiswahili: 'Sabuni', icon: '🧼', color: '#6B8F71', active: true },
  { id: 'c12', name: 'Baby Products', nameKiswahili: 'Bidhaa za Mtoto', icon: '👶', color: '#64748B', active: true },
];

// ─── Suppliers ────────────────────────────────────────────────────────────────
export const seedSuppliers: Supplier[] = [
  { id: 's1', name: 'Unga Holdings Ltd', contactPerson: 'Samuel Njoroge', phone: '0722 876 543', email: 'sales@unga.co.ke', kraPin: 'P000123456A', town: 'Nairobi', paymentTerms: 'Net 30', outstandingBalance: 45000, active: true },
  { id: 's2', name: 'Bidco Africa Ltd', contactPerson: 'Rita Moraa', phone: '0733 765 432', email: 'orders@bidco.co.ke', kraPin: 'P000234567B', town: 'Thika', paymentTerms: 'Net 14', outstandingBalance: 28500, active: true },
  { id: 's3', name: 'KCC Dairies', contactPerson: 'James Otieno', phone: '0711 654 321', email: 'sales@kcc.co.ke', kraPin: 'P000345678C', town: 'Nairobi', paymentTerms: 'Weekly', outstandingBalance: 12000, active: true },
  { id: 's4', name: 'East African Breweries', contactPerson: 'Lucy Kamande', phone: '0722 543 210', email: 'sales@eabl.co.ke', kraPin: 'P000456789D', town: 'Nairobi', paymentTerms: 'Net 21', outstandingBalance: 0, active: true },
  { id: 's5', name: 'Procter & Gamble EA', contactPerson: 'David Mwenda', phone: '0733 432 109', email: 'orders@pg.co.ke', kraPin: 'P000567890E', town: 'Nairobi', paymentTerms: 'Net 30', outstandingBalance: 67200, active: true },
  { id: 's6', name: 'Nairobi Millers', contactPerson: 'Grace Mutua', phone: '0711 321 098', kraPin: 'P000678901F', town: 'Ruiru', paymentTerms: 'Cash on Delivery', outstandingBalance: 0, active: true },
];

// ─── Products (Kenyan supermarket items) ─────────────────────────────────────
export const seedProducts: Product[] = [
  // Flour & Grains
  {
    id: 'p01', name: 'Jogoo Unga wa Mahindi 2kg', sku: 'JGO-2KG', barcode: '6001234500001',
    category: 'c1', brand: 'Unga Holdings', unit: 'pcs', buyingPrice: 102, sellingPrice: 120,
    vatClass: 'ZERO_RATED', supplierId: 's1', reorderLevel: 50, reorderQty: 200, minStock: 20, maxStock: 500,
    currentStock: 186, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'p02', name: 'Pembe Unga wa Ngano 2kg', sku: 'PMB-NGN-2KG', barcode: '6001234500002',
    category: 'c1', brand: 'Unga Holdings', unit: 'pcs', buyingPrice: 140, sellingPrice: 165,
    vatClass: 'ZERO_RATED', supplierId: 's1', reorderLevel: 30, reorderQty: 100, minStock: 10, maxStock: 300,
    currentStock: 74, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'p03', name: 'Rice Basmati 1kg', sku: 'RST-1KG', barcode: '6001234500003',
    category: 'c1', brand: 'Mwea Rice', unit: 'pcs', buyingPrice: 145, sellingPrice: 175,
    vatClass: 'ZERO_RATED', reorderLevel: 40, reorderQty: 150, minStock: 15, maxStock: 400,
    currentStock: 112, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  // Cooking Essentials
  {
    id: 'p04', name: 'Mumias Sugar 1kg', sku: 'MMS-1KG', barcode: '6001234500004',
    category: 'c2', brand: 'Mumias', unit: 'pcs', buyingPrice: 120, sellingPrice: 140,
    vatClass: 'ZERO_RATED', reorderLevel: 60, reorderQty: 200, minStock: 20, maxStock: 600,
    currentStock: 243, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'p05', name: 'Elianto Cooking Oil 1L', sku: 'ELN-1L', barcode: '6001234500005',
    category: 'c2', brand: 'Bidco', unit: 'pcs', buyingPrice: 200, sellingPrice: 230,
    wholesalePrice: 215, vatClass: 'STANDARD', supplierId: 's2', reorderLevel: 30, reorderQty: 100, minStock: 10, maxStock: 300,
    currentStock: 87, active: true, trackExpiry: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
    batches: [{ id: 'bt1', productId: 'p05', batchNumber: 'ELN-2024-11', expiryDate: '2025-11-30', quantity: 87, costPrice: 200, receivedAt: '2024-11-01T00:00:00Z' }]
  },
  {
    id: 'p06', name: 'Menengai Bar Soap 175g', sku: 'MNG-175G', barcode: '6001234500006',
    category: 'c11', brand: 'Menengai', unit: 'pcs', buyingPrice: 50, sellingPrice: 65,
    vatClass: 'STANDARD', supplierId: 's5', reorderLevel: 50, reorderQty: 200, minStock: 20, maxStock: 500,
    currentStock: 8, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  // Dairy & Eggs
  {
    id: 'p07', name: 'Brookside Milk 500ml', sku: 'BRK-500ML', barcode: '6001234500007',
    category: 'c3', brand: 'Brookside', unit: 'pcs', buyingPrice: 52, sellingPrice: 62,
    vatClass: 'ZERO_RATED', supplierId: 's3', reorderLevel: 60, reorderQty: 200, minStock: 20, maxStock: 400,
    currentStock: 145, active: true, trackExpiry: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
    batches: [{ id: 'bt2', productId: 'p07', batchNumber: 'BRK-241210', expiryDate: '2024-12-15', quantity: 145, costPrice: 52, receivedAt: '2024-12-10T00:00:00Z' }]
  },
  {
    id: 'p08', name: 'Eggs Tray (30 pcs)', sku: 'EGG-30', barcode: '6001234500008',
    category: 'c3', brand: 'Farmers Choice', unit: 'pcs', buyingPrice: 450, sellingPrice: 540,
    wholesalePrice: 510, vatClass: 'ZERO_RATED', reorderLevel: 10, reorderQty: 30, minStock: 5, maxStock: 100,
    currentStock: 18, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  // Beverages
  {
    id: 'p09', name: 'Ketepa Tea Leaves 100g', sku: 'KTP-100G', barcode: '6001234500009',
    category: 'c4', brand: 'Ketepa', unit: 'pcs', buyingPrice: 78, sellingPrice: 95,
    vatClass: 'STANDARD', reorderLevel: 30, reorderQty: 100, minStock: 10, maxStock: 300,
    currentStock: 63, active: true, trackExpiry: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
    batches: [{ id: 'bt3', productId: 'p09', batchNumber: 'KTP-2024', expiryDate: '2026-06-30', quantity: 63, costPrice: 78, receivedAt: '2024-10-01T00:00:00Z' }]
  },
  {
    id: 'p10', name: 'Coca-Cola 500ml', sku: 'CCL-500ML', barcode: '6001234500010',
    category: 'c4', brand: 'Coca-Cola', unit: 'pcs', buyingPrice: 60, sellingPrice: 80,
    vatClass: 'STANDARD', reorderLevel: 48, reorderQty: 144, minStock: 24, maxStock: 500,
    currentStock: 96, active: true, trackExpiry: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'p11', name: 'Dasani Water 500ml', sku: 'DSN-500ML', barcode: '6001234500011',
    category: 'c4', brand: 'Dasani', unit: 'pcs', buyingPrice: 40, sellingPrice: 55,
    vatClass: 'STANDARD', reorderLevel: 48, reorderQty: 144, minStock: 24, maxStock: 600,
    currentStock: 312, active: true, trackExpiry: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  // Bread & Bakery
  {
    id: 'p12', name: 'Supa Loaf Bread 400g', sku: 'SPL-400G', barcode: '6001234500012',
    category: 'c5', brand: 'Supa Loaf', unit: 'pcs', buyingPrice: 52, sellingPrice: 65,
    vatClass: 'ZERO_RATED', reorderLevel: 20, reorderQty: 60, minStock: 10, maxStock: 200,
    currentStock: 34, active: true, trackExpiry: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
    batches: [{ id: 'bt4', productId: 'p12', batchNumber: 'SPL-241212', expiryDate: '2024-12-14', quantity: 34, costPrice: 52, receivedAt: '2024-12-12T00:00:00Z' }]
  },
  // Personal Care
  {
    id: 'p13', name: 'Colgate Toothpaste 100ml', sku: 'CLG-100ML', barcode: '6001234500013',
    category: 'c6', brand: 'Colgate', unit: 'pcs', buyingPrice: 115, sellingPrice: 140,
    vatClass: 'STANDARD', supplierId: 's5', reorderLevel: 20, reorderQty: 60, minStock: 10, maxStock: 200,
    currentStock: 47, active: true, trackExpiry: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'p14', name: 'Ariel Washing Powder 500g', sku: 'ARL-500G', barcode: '6001234500014',
    category: 'c11', brand: 'Ariel', unit: 'pcs', buyingPrice: 220, sellingPrice: 265,
    vatClass: 'STANDARD', supplierId: 's5', reorderLevel: 20, reorderQty: 60, minStock: 10, maxStock: 200,
    currentStock: 3, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  // Airtime
  {
    id: 'p15', name: 'Safaricom Airtime Ksh 50', sku: 'SAF-50', barcode: '6001234500015',
    category: 'c8', brand: 'Safaricom', unit: 'pcs', buyingPrice: 47, sellingPrice: 50,
    vatClass: 'STANDARD', reorderLevel: 100, reorderQty: 500, minStock: 50, maxStock: 2000,
    currentStock: 847, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'p16', name: 'Safaricom Airtime Ksh 100', sku: 'SAF-100', barcode: '6001234500016',
    category: 'c8', brand: 'Safaricom', unit: 'pcs', buyingPrice: 93, sellingPrice: 100,
    vatClass: 'STANDARD', reorderLevel: 100, reorderQty: 500, minStock: 50, maxStock: 2000,
    currentStock: 423, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  // Household
  {
    id: 'p17', name: 'Hardwood Charcoal 10kg', sku: 'CHR-10KG', barcode: '6001234500017',
    category: 'c7', unit: 'pcs', buyingPrice: 380, sellingPrice: 450,
    vatClass: 'ZERO_RATED', reorderLevel: 10, reorderQty: 20, minStock: 5, maxStock: 100,
    currentStock: 0, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'p18', name: 'Kerosene 1L', sku: 'KRS-1L', barcode: '6001234500018',
    category: 'c7', unit: 'litre', buyingPrice: 145, sellingPrice: 168,
    vatClass: 'STANDARD', reorderLevel: 20, reorderQty: 50, minStock: 10, maxStock: 200,
    currentStock: 45, active: true, trackExpiry: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  // Snacks
  {
    id: 'p19', name: 'Popco Crisps 50g', sku: 'PPC-50G', barcode: '6001234500019',
    category: 'c10', brand: 'Popco', unit: 'pcs', buyingPrice: 18, sellingPrice: 25,
    vatClass: 'STANDARD', reorderLevel: 50, reorderQty: 200, minStock: 20, maxStock: 500,
    currentStock: 178, active: true, trackExpiry: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
  {
    id: 'p20', name: 'Nice & Lovely Lotion 200ml', sku: 'NNL-200ML', barcode: '6001234500020',
    category: 'c6', brand: 'Nice & Lovely', unit: 'pcs', buyingPrice: 115, sellingPrice: 145,
    vatClass: 'STANDARD', reorderLevel: 20, reorderQty: 60, minStock: 10, maxStock: 200,
    currentStock: 29, active: true, trackExpiry: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-12-01T00:00:00Z',
  },
];

// ─── Customers ────────────────────────────────────────────────────────────────
export const seedCustomers: Customer[] = [
  {
    id: 'cust1', name: 'Wanjiku Enterprises', phone: '0722 111 001',
    email: 'wanjiku@gmail.com', customerType: 'WHOLESALE',
    creditLimit: 50000, creditBalance: 12500, loyaltyPoints: 2400, town: 'Nairobi',
    active: true, createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'cust2', name: 'Otieno Mama Mboga', phone: '0733 222 002',
    customerType: 'RETAIL', creditLimit: 5000, creditBalance: 1200, loyaltyPoints: 560,
    town: 'Ruiru', active: true, createdAt: '2024-04-20T00:00:00Z',
  },
  {
    id: 'cust3', name: 'Kamau Hardware', phone: '0711 333 003',
    email: 'hardware@kamau.co.ke', kraPin: 'A001234567B', customerType: 'WHOLESALE',
    creditLimit: 100000, creditBalance: 0, loyaltyPoints: 8900, town: 'Thika',
    active: true, createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'cust4', name: 'Amina Mohamed', phone: '0722 444 004',
    customerType: 'RETAIL', creditLimit: 3000, creditBalance: 750, loyaltyPoints: 320,
    town: 'Mombasa', active: true, createdAt: '2024-06-10T00:00:00Z',
  },
  {
    id: 'cust5', name: 'Kipchoge & Sons Ltd', phone: '0733 555 005',
    email: 'info@kipchoge.co.ke', kraPin: 'P001234890C', customerType: 'WHOLESALE',
    creditLimit: 200000, creditBalance: 45000, loyaltyPoints: 15600, town: 'Eldoret',
    active: true, createdAt: '2024-01-10T00:00:00Z',
  },
];

// ─── Shifts ───────────────────────────────────────────────────────────────────
export const seedShifts: Shift[] = [
  {
    id: 'sh1', cashierId: 'u3', cashierName: 'Aisha Hassan', branch: 'b1',
    openingFloat: 5000, closingCash: 18200, expectedCash: 18450, variance: -250,
    salesTotal: 42780, transactionCount: 67, status: 'CLOSED',
    openedAt: new Date(Date.now() - 86400000).toISOString(),
    closedAt: new Date(Date.now() - 57600000).toISOString(),
  },
  {
    id: 'sh2', cashierId: 'u3', cashierName: 'Aisha Hassan', branch: 'b1',
    openingFloat: 5000, salesTotal: 28450, transactionCount: 43, status: 'OPEN',
    openedAt: new Date(Date.now() - 28800000).toISOString(),
  },
];

// ─── Today's Sales for charts ─────────────────────────────────────────────────
export const generateHourlySales = () => {
  const hours = [];
  const baseValues = [0, 0, 0, 0, 0, 0, 800, 2200, 3400, 5600, 7800, 9200, 11400, 8600, 7200, 8800, 10200, 12400, 9800, 7600, 5400, 3200, 1800, 600];
  for (let h = 0; h < 24; h++) {
    hours.push({
      hour: `${h.toString().padStart(2, '0')}:00`,
      sales: baseValues[h] + Math.floor(Math.random() * 500),
      transactions: Math.floor(baseValues[h] / 450),
    });
  }
  return hours;
};

export const generateWeeklySales = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const bases = [42000, 38000, 45000, 41000, 55000, 78000, 52000];
  return days.map((day, i) => ({
    day,
    sales: bases[i] + Math.floor(Math.random() * 5000),
    profit: Math.floor(bases[i] * 0.22) + Math.floor(Math.random() * 1000),
  }));
};

export const generateMonthlySales = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const bases = [820000, 745000, 890000, 860000, 920000, 880000, 840000, 910000, 875000, 930000, 980000, 1200000];
  return months.map((month, i) => ({
    month,
    sales: bases[i] + Math.floor(Math.random() * 30000),
    profit: Math.floor(bases[i] * 0.21) + Math.floor(Math.random() * 5000),
  }));
};

export const topProducts = [
  { name: 'Safaricom Airtime 50', sales: 124500, units: 2490, trend: 12 },
  { name: 'Mumias Sugar 1kg', sales: 98400, units: 703, trend: 5 },
  { name: 'Jogoo Unga 2kg', sales: 87600, units: 730, trend: -3 },
  { name: 'Brookside Milk 500ml', sales: 76200, units: 1229, trend: 18 },
  { name: 'Coca-Cola 500ml', sales: 68000, units: 850, trend: 8 },
  { name: 'Elianto Oil 1L', sales: 54050, units: 235, trend: -2 },
  { name: 'Supa Loaf Bread', sales: 47450, units: 730, trend: 3 },
  { name: 'Eggs Tray 30pcs', sales: 45360, units: 84, trend: 7 },
];

export const paymentMethodData = [
  { name: 'M-Pesa', value: 58, color: '#2F7F79' },
  { name: 'Cash', value: 32, color: '#1F2A44' },
  { name: 'Card', value: 6, color: '#C9A227' },
  { name: 'Credit', value: 4, color: '#B5574B' },
];

export const categoryRevenue = [
  { category: 'Airtime & Data', revenue: 245000 },
  { category: 'Flour & Grains', revenue: 198000 },
  { category: 'Beverages', revenue: 176000 },
  { category: 'Cooking Essentials', revenue: 154000 },
  { category: 'Dairy & Eggs', revenue: 132000 },
  { category: 'Bread & Bakery', revenue: 98000 },
  { category: 'Detergents', revenue: 87000 },
  { category: 'Personal Care', revenue: 76000 },
];

// ─── Expenses ─────────────────────────────────────────────────────────────────
export const seedExpenses: Expense[] = [
  { id: 'e1', category: 'Rent', description: 'Shop Rent - December 2024', amount: 45000, paymentMethod: 'BANK_TRANSFER', reference: 'RENT-DEC24', recordedBy: 'Admin Zawadi', branch: 'b1', createdAt: '2024-12-01T09:00:00Z' },
  { id: 'e2', category: 'Electricity', description: 'KPLC Token Purchase', amount: 8500, paymentMethod: 'MPESA', reference: 'QGH78XXXXX', recordedBy: 'Admin Zawadi', branch: 'b1', createdAt: '2024-12-05T10:30:00Z' },
  { id: 'e3', category: 'Transport', description: 'Goods delivery from supplier', amount: 3500, paymentMethod: 'CASH', recordedBy: 'John Kamau', branch: 'b1', createdAt: '2024-12-08T14:00:00Z' },
  { id: 'e4', category: 'Water', description: 'Nairobi Water Bill', amount: 2200, paymentMethod: 'MPESA', reference: 'NWW123456', recordedBy: 'Admin Zawadi', branch: 'b1', createdAt: '2024-12-10T11:00:00Z' },
  { id: 'e5', category: 'Wages', description: 'Casual Labour - Loading/Offloading', amount: 6000, paymentMethod: 'CASH', recordedBy: 'John Kamau', branch: 'b1', createdAt: '2024-12-12T16:00:00Z' },
  { id: 'e6', category: 'Licence', description: 'Nairobi County Business Permit 2025', amount: 12000, paymentMethod: 'BANK_TRANSFER', reference: 'PERMIT-2025', recordedBy: 'Admin Zawadi', branch: 'b1', createdAt: '2024-12-13T09:30:00Z' },
];

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const seedAuditLogs: AuditLog[] = [
  {
    id: 'al1', action: 'LOGIN', entityType: 'USER', entityId: 'u1',
    description: 'Admin Zawadi logged in successfully',
    performedBy: 'Admin Zawadi', performedByRole: 'ADMIN',
    branch: 'b1', ipAddress: '197.232.14.5', deviceInfo: 'Chrome/Windows', createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'al2', action: 'STOCK_RECEIVED', entityType: 'PRODUCT', entityId: 'p01',
    description: 'GRN approved: 200 units Jogoo Unga 2kg received from Unga Holdings',
    oldValue: { stock: 86 }, newValue: { stock: 186 },
    performedBy: 'Admin Zawadi', performedByRole: 'ADMIN',
    branch: 'b1', ipAddress: '197.232.14.5', createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'al3', action: 'SALE_VOIDED', entityType: 'SALE', entityId: 'S-20241212-0045',
    description: 'Sale voided — Wrong items scanned',
    performedBy: 'John Kamau', performedByRole: 'MANAGER',
    branch: 'b1', ipAddress: '197.232.14.8', createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'al4', action: 'PRICE_CHANGED', entityType: 'PRODUCT', entityId: 'p05',
    description: 'Selling price changed: Elianto Cooking Oil 1L',
    oldValue: { sellingPrice: 225 }, newValue: { sellingPrice: 230 },
    performedBy: 'Admin Zawadi', performedByRole: 'ADMIN',
    branch: 'b1', ipAddress: '197.232.14.5', createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: 'al5', action: 'STOCK_ADJUSTED', entityType: 'PRODUCT', entityId: 'p06',
    description: 'Stock adjustment: Menengai Bar Soap — Damaged goods write-off',
    oldValue: { stock: 34 }, newValue: { stock: 8 },
    performedBy: 'Admin Zawadi', performedByRole: 'ADMIN',
    branch: 'b1', ipAddress: '197.232.14.5', createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'al6', action: 'LOGIN', entityType: 'USER', entityId: 'u3',
    description: 'Cashier Aisha Hassan PIN login',
    performedBy: 'Aisha Hassan', performedByRole: 'CASHIER',
    branch: 'b1', ipAddress: '197.232.14.10', deviceInfo: 'POS Terminal', createdAt: new Date(Date.now() - 28800000).toISOString(),
  },
  {
    id: 'al7', action: 'REFUND_PROCESSED', entityType: 'SALE', entityId: 'S-20241211-0089',
    description: 'Refund processed for Aisha Hassan — Customer returned Brookside Milk (expired)',
    performedBy: 'John Kamau', performedByRole: 'MANAGER',
    branch: 'b1', ipAddress: '197.232.14.8', createdAt: new Date(Date.now() - 54000000).toISOString(),
  },
  {
    id: 'al8', action: 'CASH_VARIANCE', entityType: 'SHIFT', entityId: 'sh1',
    description: 'Cash variance detected: Expected Ksh 18,450 — Counted Ksh 18,200 (Variance: -250)',
    oldValue: { expected: 18450 }, newValue: { counted: 18200, variance: -250 },
    performedBy: 'Aisha Hassan', performedByRole: 'CASHIER',
    branch: 'b1', ipAddress: '197.232.14.10', createdAt: new Date(Date.now() - 57600000).toISOString(),
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────
export const seedNotifications: Notification[] = [
  {
    id: 'n1', type: 'LOW_STOCK', title: 'Low Stock Alert',
    message: 'Ariel Washing Powder 500g: only 3 units remaining (reorder level: 20)',
    read: false, actionUrl: '/inventory', createdAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'n2', type: 'LOW_STOCK', title: 'Out of Stock',
    message: 'Hardwood Charcoal 10kg is OUT OF STOCK. Reorder immediately.',
    read: false, actionUrl: '/inventory', createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'n3', type: 'EXPIRY_ALERT', title: 'Expiry Alert',
    message: 'Supa Loaf Bread 400g (Batch SPL-241212): expires in 2 days',
    read: false, actionUrl: '/inventory', createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'n4', type: 'CASH_VARIANCE', title: 'Cash Variance Detected',
    message: 'Aisha Hassan shift closed with Ksh -250 variance',
    read: false, actionUrl: '/reports', createdAt: new Date(Date.now() - 57600000).toISOString(),
  },
  {
    id: 'n5', type: 'PENDING_APPROVAL', title: 'GRN Pending Approval',
    message: 'GRN #GRN-2024-0089 from Bidco Africa awaiting your approval',
    read: true, actionUrl: '/inventory', createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'n6', type: 'INFO', title: 'M-Pesa Payment Confirmed',
    message: 'M-Pesa transaction QGH7AB4321 confirmed — Ksh 4,350',
    read: true, actionUrl: '/pos', createdAt: new Date(Date.now() - 10800000).toISOString(),
  },
];

// ─── Stock Movements ──────────────────────────────────────────────────────────
export const seedStockMovements: StockMovement[] = [
  {
    id: 'sm1', productId: 'p01', productName: 'Jogoo Unga wa Mahindi 2kg',
    type: 'GOODS_IN', quantity: 200, unitCost: 102,
    balanceBefore: 86, balanceAfter: 286, reason: 'GRN #GRN-2024-0088 from Unga Holdings',
    performedBy: 'Admin Zawadi', performedByRole: 'ADMIN', branch: 'b1',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'sm2', productId: 'p01', productName: 'Jogoo Unga wa Mahindi 2kg',
    type: 'SALE', quantity: -100, balanceBefore: 286, balanceAfter: 186,
    reason: 'Sales batch Dec 12', performedBy: 'Aisha Hassan', performedByRole: 'CASHIER',
    branch: 'b1', createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'sm3', productId: 'p06', productName: 'Menengai Bar Soap 175g',
    type: 'WRITE_OFF', quantity: -26, balanceBefore: 34, balanceAfter: 8,
    reason: 'Water damage — store flooding', performedBy: 'Admin Zawadi', performedByRole: 'ADMIN',
    branch: 'b1', createdAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 'sm4', productId: 'p17', productName: 'Hardwood Charcoal 10kg',
    type: 'SALE', quantity: -12, balanceBefore: 12, balanceAfter: 0,
    reason: 'Sales', performedBy: 'Aisha Hassan', performedByRole: 'CASHIER',
    branch: 'b1', createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];
