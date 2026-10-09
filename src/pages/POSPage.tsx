import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search, Plus, Minus, Trash2, ChevronDown, User, X, Check,
  Printer, MessageSquare, Smartphone, Banknote, CreditCard, Loader2,
  Tag, ShoppingCart, ParkingCircle, ReceiptText, Keyboard, AlertCircle,
  CheckCircle2, Clock, Phone
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatKES, calculateVAT, simulateMpesaSTK, clsx, generateMpesaRef } from '../lib/utils';
import type { SaleItem, PaymentSplit, PaymentMethod, Product } from '../types';

type CheckoutStep = 'cart' | 'payment' | 'receipt';

const QUICK_CASH = [50, 100, 200, 500, 1000, 2000];
const VAT_RATE = 0.16;

function ProductCard({ product, onAdd }: { product: Product; onAdd: (p: Product) => void }) {
  const outOfStock = product.currentStock <= 0;
  return (
    <button
      onClick={() => !outOfStock && onAdd(product)}
      disabled={outOfStock}
      className={clsx('pos-product-card text-left', outOfStock && 'opacity-50 cursor-not-allowed')}
    >
      <div className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
        {product.name}
      </div>
      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{product.sku}</div>
      <div className="flex items-end justify-between mt-2">
        <span className="text-sm font-bold" style={{ color: '#2F7F79' }}>
          {formatKES(product.sellingPrice)}
        </span>
        <span className={clsx('text-xs font-medium', product.currentStock <= 0 ? 'text-[#B5574B]' : product.currentStock <= product.reorderLevel ? 'text-[#C9A227]' : 'text-[#6B8F71]')}>
          {product.currentStock <= 0 ? 'Out' : `${product.currentStock} left`}
        </span>
      </div>
    </button>
  );
}

export default function POSPage() {
  const { state, completeSale } = useApp();
  const { products, categories, customers, currentUser, settings, language } = state;

  const [cart, setCart] = useState<SaleItem[]>([]);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [step, setStep] = useState<CheckoutStep>('cart');
  const [selectedCustomer, setSelectedCustomer] = useState<typeof customers[0] | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashAmount, setCashAmount] = useState('');
  const [mpesaPhone, setMpesaPhone] = useState('0722');
  const [mpesaStatus, setMpesaStatus] = useState<'idle' | 'pending' | 'confirmed' | 'failed'>('idle');
  const [mpesaRef, setMpesaRef] = useState('');
  const [splits, setSplits] = useState<PaymentSplit[]>([]);
  const [completedSale, setCompletedSale] = useState<ReturnType<typeof completeSale>>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printCycle, setPrintCycle] = useState(0);
  const [wholeDiscount, setWholeDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const printTimeoutRef = useRef<number | null>(null);

  const t = (en: string, sw: string) => language === 'sw' ? sw : en;

  useEffect(() => () => {
    if (printTimeoutRef.current !== null) window.clearTimeout(printTimeoutRef.current);
  }, []);

  // Filter products
  const filteredProducts = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search));
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    return matchSearch && matchCat && p.active;
  });

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i => i.productId === product.id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice }
          : i
        );
      }
      const vatAmount = product.vatClass === 'STANDARD'
        ? (product.sellingPrice / (1 + VAT_RATE)) * VAT_RATE : 0;
      return [...prev, {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        quantity: 1,
        unitPrice: product.sellingPrice,
        discount: 0,
        vatClass: product.vatClass,
        vatAmount,
        subtotal: product.sellingPrice,
        unit: product.unit,
      }];
    });
  }, []);

  const updateQty = (productId: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.productId !== productId) return i;
      const newQty = Math.max(1, i.quantity + delta);
      return { ...i, quantity: newQty, subtotal: newQty * (i.unitPrice - i.discount) };
    }).filter(i => i.quantity > 0));
  };

  const removeItem = (productId: string) => {
    setCart(prev => prev.filter(i => i.productId !== productId));
  };

  const subtotal = cart.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const discountTotal = cart.reduce((s, i) => s + i.discount * i.quantity, 0) + (subtotal * wholeDiscount / 100);
  const vatTotal = cart.reduce((s, i) => s + i.vatAmount * i.quantity, 0);
  const grandTotal = subtotal - discountTotal;
  const cashIn = parseFloat(cashAmount) || 0;
  const change = cashIn - grandTotal;

  const clearCart = () => {
    if (printTimeoutRef.current !== null) {
      window.clearTimeout(printTimeoutRef.current);
      printTimeoutRef.current = null;
    }
    setCart([]);
    setWholeDiscount(0);
    setSelectedCustomer(null);
    setStep('cart');
    setMpesaStatus('idle');
    setMpesaRef('');
    setCompletedSale(null);
    setIsPrinting(false);
  };

  const handleSTKPush = async () => {
    setMpesaStatus('pending');
    const result = await simulateMpesaSTK(mpesaPhone, grandTotal);
    if (result.success) {
      setMpesaStatus('confirmed');
      setMpesaRef(result.reference);
    } else {
      setMpesaStatus('failed');
    }
  };

  const handleCompleteSale = () => {
    let payments: PaymentSplit[] = [];
    if (paymentMethod === 'CASH') {
      payments = [{ method: 'CASH', amount: grandTotal }];
    } else if (paymentMethod === 'MPESA') {
      payments = [{ method: 'MPESA', amount: grandTotal, reference: mpesaRef, mpesaStatus: 'CONFIRMED' }];
    } else if (paymentMethod === 'CARD') {
      payments = [{ method: 'CARD', amount: grandTotal }];
    }

    const sale = completeSale(cart, payments, selectedCustomer?.id, selectedCustomer?.name, notes);
    setCompletedSale(sale);
    setPrintCycle(cycle => cycle + 1);
    setIsPrinting(true);
    setStep('receipt');
  };

  const handlePrint = () => {
    setPrintCycle(cycle => cycle + 1);
    setIsPrinting(true);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    printTimeoutRef.current = window.setTimeout(() => {
      printTimeoutRef.current = null;
      window.print();
    }, reduceMotion ? 100 : 1900);
  };

  const canCheckout = cart.length > 0 && (
    (paymentMethod === 'CASH' && cashIn >= grandTotal) ||
    (paymentMethod === 'MPESA' && mpesaStatus === 'confirmed') ||
    paymentMethod === 'CARD'
  );

  const categoryTabs = [{ id: 'all', name: 'All', nameKiswahili: 'Zote' }, ...categories];

  return (
    <div className="flex gap-4 h-[calc(100vh-7rem)] -m-6 p-4">
      {/* Left: Products */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Search */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              ref={searchRef}
              className="input-base pl-9"
              placeholder={t('Search by name, SKU or barcode… (F2)', 'Tafuta kwa jina, SKU au barcode…')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 mb-3 overflow-x-auto pb-1 flex-shrink-0">
          {categoryTabs.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0"
              style={{
                background: activeCategory === cat.id ? '#1F2A44' : 'var(--bg-card)',
                color: activeCategory === cat.id ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-color)',
              }}>
              {'icon' in cat && cat.icon} {language === 'sw' && 'nameKiswahili' in cat ? cat.nameKiswahili || cat.name : cat.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} onAdd={addToCart} />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-12 text-center">
                <ShoppingCart size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No products found</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Cart */}
      <div className="w-80 xl:w-96 flex-shrink-0 flex flex-col">
        <div className="card flex flex-col h-full overflow-hidden">
          {/* Cart header */}
          <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <ShoppingCart size={16} style={{ color: '#2F7F79' }} />
              <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {t('Cart', 'Mkoba')} {cart.length > 0 && <span className="badge badge-teal ml-1">{cart.length}</span>}
              </span>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} className="text-xs flex items-center gap-1" style={{ color: '#B5574B' }}>
                <X size={12} /> {t('Clear', 'Futa')}
              </button>
            )}
          </div>

          {step === 'cart' && (
            <>
              {/* Customer selector */}
              <div className="px-3 py-2 border-b relative" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all"
                  style={{ background: 'var(--bg-surface)' }}
                  onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}>
                  <User size={13} style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs flex-1" style={{ color: selectedCustomer ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {selectedCustomer ? selectedCustomer.name : t('Walk-in customer', 'Mteja wa kawaida')}
                  </span>
                  <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
                </div>
                {showCustomerDropdown && (
                  <div className="absolute left-3 right-3 top-full mt-1 rounded-xl shadow-xl z-20 overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                    <div className="p-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <input className="input-base text-xs py-1.5" placeholder="Search customers…"
                        value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} />
                    </div>
                    <div className="max-h-44 overflow-y-auto">
                      <button onClick={() => { setSelectedCustomer(null); setShowCustomerDropdown(false); }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                        Walk-in customer
                      </button>
                      {customers.filter(c => c.active && (!customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch))).map(c => (
                        <button key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); }}
                          className="flex items-center justify-between w-full px-3 py-2 text-xs hover:opacity-80"
                          style={{ color: 'var(--text-primary)', borderTop: '1px solid var(--border-color)' }}>
                          <span className="font-medium">{c.name}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{c.phone}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
                {cart.length === 0 && (
                  <div className="py-10 text-center">
                    <ShoppingCart size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {t('Tap products to add to cart', 'Bonyeza bidhaa kuongeza')}
                    </div>
                  </div>
                )}
                {cart.map(item => (
                  <div key={item.productId} className="flex items-center gap-2 p-2 rounded-xl"
                    style={{ background: 'var(--bg-surface)' }}>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {item.productName}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {formatKES(item.unitPrice)} × {item.quantity}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => updateQty(item.productId, -1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: 'var(--border-color)' }}>
                        <Minus size={11} />
                      </button>
                      <span className="w-6 text-center text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {item.quantity}
                      </span>
                      <button onClick={() => updateQty(item.productId, 1)}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110"
                        style={{ background: '#2F7F79', color: 'white' }}>
                        <Plus size={11} />
                      </button>
                    </div>
                    <div className="text-right flex-shrink-0 w-16">
                      <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                        {formatKES(item.unitPrice * item.quantity)}
                      </div>
                      <button onClick={() => removeItem(item.productId)}>
                        <Trash2 size={11} style={{ color: '#B5574B' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              {cart.length > 0 && (
                <div className="border-t px-4 py-3 space-y-1.5" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>Subtotal</span><span>{formatKES(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>VAT (16%)</span><span>{formatKES(vatTotal)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag size={12} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Discount</span>
                    <input type="number" min={0} max={100} value={wholeDiscount}
                      onChange={e => setWholeDiscount(parseFloat(e.target.value) || 0)}
                      className="ml-auto w-14 text-right text-xs py-0.5 px-2 rounded"
                      style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>%</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm pt-1 border-t" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>
                    <span>Total</span><span>{formatKES(grandTotal)}</span>
                  </div>
                  <button onClick={() => setStep('payment')}
                    className="btn-teal w-full justify-center py-2.5 mt-1 text-sm">
                    {t('Proceed to Pay', 'Lipa')} (F8)
                  </button>
                </div>
              )}
            </>
          )}

          {/* Payment step */}
          {step === 'payment' && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {formatKES(grandTotal)}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''} • {selectedCustomer?.name || 'Walk-in'}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
                {/* Payment method selector */}
                <div>
                  <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                    {t('Payment Method', 'Njia ya Malipo')}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { id: 'CASH', label: t('Cash', 'Pesa Taslimu'), labelSw: 'Pesa', icon: Banknote },
                      { id: 'MPESA', label: 'M-Pesa', labelSw: 'M-Pesa', icon: Smartphone },
                      { id: 'CARD', label: t('Card', 'Kadi'), labelSw: 'Kadi', icon: CreditCard },
                      { id: 'AIRTEL_MONEY', label: 'Airtel Money', labelSw: 'Airtel', icon: Phone },
                    ] as const).map(pm => (
                      <button key={pm.id} onClick={() => { setPaymentMethod(pm.id); setMpesaStatus('idle'); }}
                        className="flex items-center gap-2 p-2.5 rounded-xl transition-all"
                        style={{
                          background: paymentMethod === pm.id ? 'rgba(47,127,121,0.12)' : 'var(--bg-surface)',
                          border: `1px solid ${paymentMethod === pm.id ? '#2F7F79' : 'var(--border-color)'}`,
                          color: paymentMethod === pm.id ? '#2F7F79' : 'var(--text-secondary)',
                        }}>
                        <pm.icon size={15} />
                        <span className="text-xs font-semibold">{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cash */}
                {paymentMethod === 'CASH' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                        {t('Amount Received (Ksh)', 'Kiasi Kilicholipwa')}
                      </label>
                      <input type="number" className="input-base text-lg font-bold"
                        value={cashAmount} onChange={e => setCashAmount(e.target.value)}
                        placeholder="0.00" />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {QUICK_CASH.map(amount => (
                        <button key={amount} onClick={() => setCashAmount(amount.toString())}
                          className="py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                          {formatKES(amount)}
                        </button>
                      ))}
                    </div>
                    {cashIn > 0 && cashIn >= grandTotal && (
                      <div className="flex justify-between p-3 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(107,143,113,0.1)', color: '#4A6E50' }}>
                        <span>{t('Change', 'Chenji')}</span>
                        <span>{formatKES(change)}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* M-Pesa */}
                {paymentMethod === 'MPESA' && (
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(47,127,121,0.08)', border: '1px solid rgba(47,127,121,0.2)' }}>
                      <div className="text-xs font-semibold" style={{ color: '#2F7F79' }}>
                        {t('Lipa Na M-Pesa', 'Lipa Na M-Pesa')}
                      </div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        Till: {settings.mpesaTillNumber} • {settings.mpesaSandboxMode ? 'Sandbox' : 'Live'}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                        Customer Phone Number
                      </label>
                      <input type="tel" className="input-base" value={mpesaPhone}
                        onChange={e => setMpesaPhone(e.target.value)}
                        placeholder="0722 000 000" />
                    </div>

                    {mpesaStatus === 'idle' && (
                      <button onClick={handleSTKPush} className="btn-teal w-full justify-center py-2.5">
                        <Smartphone size={16} />
                        {t('Send STK Push', 'Tuma STK Push')}
                      </button>
                    )}

                    {mpesaStatus === 'pending' && (
                      <div className="flex flex-col items-center gap-2 py-4">
                        <Loader2 size={24} color="#2F7F79" className="animate-spin" />
                        <div className="text-xs font-semibold" style={{ color: '#2F7F79' }}>
                          Waiting for M-Pesa confirmation…
                        </div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          Customer will receive a prompt on {mpesaPhone}
                        </div>
                      </div>
                    )}

                    {mpesaStatus === 'confirmed' && (
                      <div className="flex flex-col items-center gap-2 py-3 rounded-xl"
                        style={{ background: 'rgba(107,143,113,0.1)' }}>
                        <CheckCircle2 size={24} color="#6B8F71" />
                        <div className="text-xs font-semibold" style={{ color: '#4A6E50' }}>Payment Confirmed!</div>
                        <div className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{mpesaRef}</div>
                      </div>
                    )}

                    {mpesaStatus === 'failed' && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: 'rgba(181,87,75,0.1)' }}>
                          <AlertCircle size={15} color="#B5574B" />
                          <span className="text-xs" style={{ color: '#B5574B' }}>Payment failed. Try again or use cash.</span>
                        </div>
                        <button onClick={() => setMpesaStatus('idle')} className="btn-ghost w-full justify-center text-xs">
                          Retry
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>
                        Or enter M-Pesa reference manually
                      </label>
                      <div className="flex gap-2">
                        <input className="input-base flex-1 font-mono text-xs uppercase"
                          placeholder="e.g. QGH78XXXXX"
                          value={mpesaRef} onChange={e => setMpesaRef(e.target.value.toUpperCase())} />
                        {mpesaRef.length >= 8 && (
                          <button onClick={() => setMpesaStatus('confirmed')}
                            className="px-3 rounded-lg flex-shrink-0"
                            style={{ background: '#2F7F79', color: 'white' }}>
                            <Check size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="p-4 rounded-xl text-center" style={{ background: 'var(--bg-surface)' }}>
                    <CreditCard size={28} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      Present card to POS terminal. Confirm after payment.
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 pb-4 flex gap-2">
                <button onClick={() => setStep('cart')} className="btn-ghost flex-1 justify-center text-sm">
                  {t('Back', 'Rudi')}
                </button>
                <button onClick={handleCompleteSale} disabled={!canCheckout}
                  className="btn-teal flex-1 justify-center py-2.5 text-sm">
                  <Check size={16} />
                  {t('Complete Sale', 'Maliza')}
                </button>
              </div>
            </div>
          )}

          {/* Receipt step */}
          {step === 'receipt' && completedSale && (
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 py-4">
                <div className="text-center mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                    style={{ background: 'rgba(107,143,113,0.2)' }}>
                    <CheckCircle2 size={26} color="#6B8F71" />
                  </div>
                  <div className="font-bold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    {t('Sale Complete!', 'Mauzo Yamekamilika!')}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {completedSale.receiptNumber}
                  </div>
                </div>

                {/* Animated thermal receipt */}
                <div className="receipt-machine">
                  <div className="receipt-printer-head no-print">
                    <div className="flex items-center gap-2">
                      <div className={clsx('receipt-status-light', isPrinting && 'is-printing')} />
                      <span>{isPrinting ? t('Printing receipt…', 'Risiti inachapishwa…') : t('Receipt ready', 'Risiti iko tayari')}</span>
                    </div>
                    <Printer size={16} />
                    <div className="receipt-printer-slot" />
                  </div>
                  <div className="receipt-output-window">
                    <div
                      key={printCycle}
                      className="receipt-paper receipt-print-target p-4 text-xs space-y-1.5 font-mono"
                      onAnimationEnd={() => setIsPrinting(false)}
                    >
                      <div className="text-center font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                        {settings.name}
                      </div>
                      <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                        KRA PIN: {settings.kraPin}
                      </div>
                      <div className="text-center text-xs" style={{ color: 'var(--text-muted)' }}>
                        {settings.address}, {settings.town}
                      </div>
                      <div className="border-t border-dashed my-2" style={{ borderColor: 'var(--border-color)' }} />
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Receipt:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{completedSale.receiptNumber}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>eTIMS Inv:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{completedSale.etimsInvoiceNo}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Cashier:</span>
                        <span style={{ color: 'var(--text-primary)' }}>{completedSale.cashierName}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {new Intl.DateTimeFormat('en-KE', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                            timeZone: 'Africa/Nairobi',
                          }).format(new Date(completedSale.createdAt))}
                        </span>
                      </div>
                      <div className="border-t border-dashed my-2" style={{ borderColor: 'var(--border-color)' }} />
                      {completedSale.items.map(item => (
                        <div key={item.productId}>
                          <div className="truncate" style={{ color: 'var(--text-secondary)' }}>{item.productName}</div>
                          <div className="flex justify-between">
                            <span style={{ color: 'var(--text-muted)' }}>{item.quantity} × {formatKES(item.unitPrice)}</span>
                            <span style={{ color: 'var(--text-primary)' }}>{formatKES(item.unitPrice * item.quantity)}</span>
                          </div>
                        </div>
                      ))}
                      <div className="border-t border-dashed my-2" style={{ borderColor: 'var(--border-color)' }} />
                      <div className="flex justify-between font-bold">
                        <span style={{ color: 'var(--text-primary)' }}>TOTAL</span>
                        <span style={{ color: 'var(--text-primary)' }}>{formatKES(completedSale.grandTotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>VAT 16%</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{formatKES(completedSale.vatTotal)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span style={{ color: 'var(--text-muted)' }}>Payment</span>
                        <span style={{ color: 'var(--text-secondary)' }}>{completedSale.payments.map(payment => payment.method).join(' + ')}</span>
                      </div>
                      {completedSale.change > 0 && (
                        <div className="flex justify-between text-xs">
                          <span style={{ color: 'var(--text-muted)' }}>Change</span>
                          <span style={{ color: '#4A6E50' }}>{formatKES(completedSale.change)}</span>
                        </div>
                      )}
                      <div className="border-t border-dashed mt-2 pt-2 text-center" style={{ borderColor: 'var(--border-color)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{settings.receiptFooter}</span>
                      </div>
                      <div className="text-center pt-1" style={{ color: 'var(--text-muted)' }}>— ZAWADI POS —</div>
                    </div>
                  </div>
                </div>

                {/* Share options */}
                <div className="flex gap-2 mt-4">
                  <button onClick={handlePrint} disabled={isPrinting} className="btn-ghost flex-1 justify-center text-xs py-2">
                    {isPrinting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={14} />}
                    {isPrinting ? t('Printing…', 'Inachapishwa…') : t('Print again', 'Chapisha tena')}
                  </button>
                  <button className="btn-ghost flex-1 justify-center text-xs py-2">
                    <MessageSquare size={14} /> WhatsApp
                  </button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <button onClick={clearCart} className="btn-teal w-full justify-center py-2.5 text-sm">
                  <Plus size={16} />
                  {t('New Sale', 'Mauzo Mapya')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
