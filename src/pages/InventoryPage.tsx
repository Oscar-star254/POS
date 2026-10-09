import React, { useState } from 'react';
import {
  Package, Plus, Search, Filter, AlertTriangle, TrendingDown,
  Check, X, Edit2, BarChart3, ArrowUpDown, ShieldAlert, ChevronDown,
  Eye, FileDown, Upload, Layers
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import {
  formatKES, formatNumber, stockStatus, canManageStock, formatDateTime, clsx
} from '../lib/utils';
import type { Product } from '../types';

type InventoryTab = 'overview' | 'products' | 'grn' | 'movements' | 'stocktake';

function StockBadge({ current, reorder }: { current: number; reorder: number }) {
  const status = stockStatus(current, reorder);
  return (
    <span className={clsx('badge', status === 'OUT' ? 'badge-terracotta' : status === 'LOW' ? 'badge-amber' : 'badge-sage')}>
      {status === 'OUT' ? 'Out of Stock' : status === 'LOW' ? 'Low Stock' : 'In Stock'}
    </span>
  );
}

function GRNModal({ onClose }: { onClose: () => void }) {
  const { state, dispatch, addAudit } = useApp();
  const { products, suppliers, currentUser } = state;
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState([{ productId: '', qty: 0, unitCost: 0 }]);
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!canManageStock(currentUser?.role || 'CASHIER')) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="card p-6 max-w-sm mx-4 text-center">
          <ShieldAlert size={32} color="#B5574B" className="mx-auto mb-3" />
          <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            Only ADMIN can receive stock. This action is restricted.
          </p>
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    const validItems = items.filter(i => i.productId && i.qty > 0);
    if (!supplierId || validItems.length === 0) return;
    const supplier = suppliers.find(s => s.id === supplierId);
    const grnItems = validItems.map(i => {
      const product = products.find(p => p.id === i.productId);
      return {
        productId: i.productId,
        productName: product?.name || '',
        quantity: i.qty,
        unitCost: i.unitCost,
      };
    });
    const totalCost = grnItems.reduce((s, i) => s + i.quantity * i.unitCost, 0);
    const grnId = `GRN-${Date.now()}`;
    dispatch({ type: 'ADD_GRN', grn: {
      id: grnId,
      supplierId,
      supplierName: supplier?.name || '',
      items: grnItems,
      totalCost,
      status: 'APPROVED',
      createdBy: currentUser?.name || '',
      approvedBy: currentUser?.name || '',
      branch: state.activeBranch,
      notes,
      createdAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
    }});
    dispatch({ type: 'APPROVE_GRN', grnId, approvedBy: currentUser?.name || '' });
    addAudit('GRN_APPROVED', 'GRN', `GRN approved: ${validItems.length} products from ${supplier?.name}`);
    setSubmitted(true);
    setTimeout(() => { onClose(); }, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-lg max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Goods Received Note (GRN)
          </h3>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        {submitted ? (
          <div className="p-8 text-center">
            <Check size={36} color="#6B8F71" className="mx-auto mb-2" />
            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Stock received & approved!</div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Supplier</label>
              <select className="input-base" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                <option value="">Select supplier…</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Items</label>
                <button onClick={() => setItems([...items, { productId: '', qty: 0, unitCost: 0 }])}
                  className="text-xs" style={{ color: '#2F7F79' }}>+ Add item</button>
              </div>
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2">
                    <select className="input-base col-span-5 text-xs"
                      value={item.productId}
                      onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, productId: e.target.value } : it))}>
                      <option value="">Product…</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <input type="number" className="input-base col-span-3 text-xs" placeholder="Qty"
                      value={item.qty || ''} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, qty: +e.target.value } : it))} />
                    <input type="number" className="input-base col-span-3 text-xs" placeholder="Cost"
                      value={item.unitCost || ''} onChange={e => setItems(items.map((it, i) => i === idx ? { ...it, unitCost: +e.target.value } : it))} />
                    <button onClick={() => setItems(items.filter((_, i) => i !== idx))} className="col-span-1 flex items-center justify-center">
                      <X size={14} style={{ color: '#B5574B' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Notes</label>
              <textarea className="input-base resize-none h-16 text-xs" placeholder="Delivery note, invoice number…"
                value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={handleSubmit} className="btn-teal flex-1 justify-center">
                <Check size={15} /> Approve & Receive Stock
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AdjustModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const { state, adjustStock, writeOffStock } = useApp();
  const { currentUser } = state;
  const [mode, setMode] = useState<'adjust' | 'writeoff'>('adjust');
  const [newQty, setNewQty] = useState(product.currentStock);
  const [writeQty, setWriteQty] = useState(0);
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);

  if (!canManageStock(currentUser?.role || 'CASHIER')) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="card p-6 max-w-sm mx-4 text-center">
          <ShieldAlert size={32} color="#B5574B" className="mx-auto mb-3" />
          <h3 className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Access Denied</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Only ADMIN can adjust stock.</p>
          <button onClick={onClose} className="btn-ghost">Close</button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!reason) return;
    if (mode === 'adjust') adjustStock(product.id, newQty, reason);
    else writeOffStock(product.id, writeQty, reason);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Stock Adjustment — ADMIN ONLY
          </h3>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        {done ? (
          <div className="p-8 text-center">
            <Check size={36} color="#6B8F71" className="mx-auto mb-2" />
            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Stock updated!</div>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
              <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{product.name}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Current stock: <strong>{product.currentStock}</strong> {product.unit}
              </div>
            </div>
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
              {(['adjust', 'writeoff'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all capitalize"
                  style={{
                    background: mode === m ? 'var(--bg-card)' : 'transparent',
                    color: mode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}>
                  {m === 'adjust' ? 'Stocktake / Adjust' : 'Write-off / Damage'}
                </button>
              ))}
            </div>
            {mode === 'adjust' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  New Quantity ({product.unit})
                </label>
                <input type="number" className="input-base" value={newQty}
                  onChange={e => setNewQty(parseInt(e.target.value) || 0)} />
                {newQty !== product.currentStock && (
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Change: {newQty - product.currentStock > 0 ? '+' : ''}{newQty - product.currentStock} units
                  </div>
                )}
              </div>
            )}
            {mode === 'writeoff' && (
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Quantity to Write Off
                </label>
                <input type="number" min={0} max={product.currentStock} className="input-base"
                  value={writeQty} onChange={e => setWriteQty(parseInt(e.target.value) || 0)} />
              </div>
            )}
            <div>
              <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Reason (mandatory)
              </label>
              <select className="input-base text-xs mb-2" value={reason} onChange={e => setReason(e.target.value)}>
                <option value="">Select reason…</option>
                {mode === 'adjust' ? (
                  <>
                    <option>Stocktake correction</option>
                    <option>Opening balance entry</option>
                    <option>System error correction</option>
                  </>
                ) : (
                  <>
                    <option>Damaged/broken</option>
                    <option>Expired goods</option>
                    <option>Theft/shrinkage</option>
                    <option>Sample/internal use</option>
                    <option>Return to supplier</option>
                  </>
                )}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={handleSubmit} disabled={!reason} className="btn-primary flex-1 justify-center">
                <Check size={15} /> Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InventoryPage() {
  const { state } = useApp();
  const { products, categories, stockMovements, currentUser, language } = state;
  const [tab, setTab] = useState<InventoryTab>('overview');
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showGRN, setShowGRN] = useState(false);
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);
  const isAdmin = currentUser?.role === 'ADMIN';

  const t = (en: string, sw: string) => language === 'sw' ? sw : en;

  const filteredProducts = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || p.category === filterCat;
    const status = stockStatus(p.currentStock, p.reorderLevel);
    const matchStatus = filterStatus === 'all' ||
      (filterStatus === 'out' && status === 'OUT') ||
      (filterStatus === 'low' && status === 'LOW') ||
      (filterStatus === 'ok' && status === 'OK');
    return matchSearch && matchCat && matchStatus;
  });

  const totalStockValue = products.reduce((s, p) => s + p.currentStock * p.buyingPrice, 0);
  const totalRetailValue = products.reduce((s, p) => s + p.currentStock * p.sellingPrice, 0);
  const outOfStockCount = products.filter(p => p.currentStock <= 0).length;
  const lowStockCount = products.filter(p => stockStatus(p.currentStock, p.reorderLevel) === 'LOW').length;

  return (
    <div className="space-y-5">
      {/* Admin gate banner */}
      {!isAdmin && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: 'rgba(201,162,39,0.1)', border: '1px solid rgba(201,162,39,0.3)' }}>
          <ShieldAlert size={18} color="#C9A227" />
          <div>
            <div className="text-sm font-semibold" style={{ color: '#96780F' }}>View-Only Mode</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              You can view stock levels but cannot add, adjust or write off stock. Contact your Admin.
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        {([
          { id: 'overview', label: t('Overview', 'Muhtasari') },
          { id: 'products', label: t('Products', 'Bidhaa') },
          { id: 'grn', label: 'GRN' },
          { id: 'movements', label: t('Stock Ledger', 'Rekodi') },
        ] as const).map(t_ => (
          <button key={t_.id} onClick={() => setTab(t_.id)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              background: tab === t_.id ? '#1F2A44' : 'transparent',
              color: tab === t_.id ? 'white' : 'var(--text-muted)',
            }}>
            {t_.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: t('Stock Value (Cost)', 'Thamani ya Stoo (Gharama)'), value: formatKES(totalStockValue), accent: '#1F2A44', sub: `${products.length} products` },
              { label: t('Retail Value', 'Thamani ya Rejareja'), value: formatKES(totalRetailValue), accent: '#2F7F79', sub: `Potential margin` },
              { label: t('Out of Stock', 'Bidhaa Zilizokwisha'), value: outOfStockCount.toString(), accent: '#B5574B', sub: 'Need urgent restock' },
              { label: t('Low Stock', 'Stoo Chache'), value: lowStockCount.toString(), accent: '#C9A227', sub: 'Below reorder level' },
            ].map(kpi => (
              <div key={kpi.label} className="card p-4">
                <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>{kpi.label}</div>
                <div className="text-xl font-bold" style={{ color: kpi.accent, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{kpi.value}</div>
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{kpi.sub}</div>
              </div>
            ))}
          </div>

          {/* Low/out stock list */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                Items Needing Attention
              </h3>
              {isAdmin && (
                <button onClick={() => setShowGRN(true)} className="btn-teal text-xs py-1.5 px-3">
                  <Plus size={13} /> Receive Stock (GRN)
                </button>
              )}
            </div>
            <div className="space-y-2">
              {products.filter(p => stockStatus(p.currentStock, p.reorderLevel) !== 'OK').map(p => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl"
                  style={{ background: 'var(--bg-surface)' }}>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                    <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.sku} · Reorder at {p.reorderLevel}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold" style={{ color: p.currentStock <= 0 ? '#B5574B' : '#C9A227' }}>
                      {p.currentStock} {p.unit}
                    </div>
                    <StockBadge current={p.currentStock} reorder={p.reorderLevel} />
                  </div>
                  {isAdmin && (
                    <button onClick={() => setAdjustProduct(p)} className="btn-ghost text-xs py-1 px-2">
                      <Edit2 size={12} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Products list */}
      {tab === 'products' && (
        <div className="space-y-4">
          <div className="flex gap-3 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input className="input-base pl-8 text-sm" placeholder="Search products…"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="input-base w-40 text-sm" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="all">All categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select className="input-base w-36 text-sm" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All status</option>
              <option value="out">Out of stock</option>
              <option value="low">Low stock</option>
              <option value="ok">In stock</option>
            </select>
            {isAdmin && (
              <button onClick={() => setShowGRN(true)} className="btn-teal text-sm">
                <Plus size={15} /> Receive Stock
              </button>
            )}
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                    {['Product', 'SKU', 'Category', 'Stock', 'Sell Price', isAdmin ? 'Buy Price' : '', 'Status', 'Actions'].filter(Boolean).map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(p => {
                    const cat = categories.find(c => c.id === p.category);
                    return (
                      <tr key={p.id} className="border-b hover:opacity-90 transition-opacity"
                        style={{ borderColor: 'var(--border-color)' }}>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)', maxWidth: 200 }}>
                          <div className="truncate">{p.name}</div>
                          {p.brand && <div className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>{p.brand}</div>}
                        </td>
                        <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-muted)' }}>{p.sku}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{cat?.name || '-'}</td>
                        <td className="px-4 py-3 font-bold" style={{ color: p.currentStock <= 0 ? '#B5574B' : p.currentStock <= p.reorderLevel ? '#C9A227' : 'var(--text-primary)' }}>
                          {p.currentStock} {p.unit}
                        </td>
                        <td className="px-4 py-3 font-semibold" style={{ color: '#2F7F79' }}>{formatKES(p.sellingPrice)}</td>
                        {isAdmin && <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{formatKES(p.buyingPrice)}</td>}
                        <td className="px-4 py-3"><StockBadge current={p.currentStock} reorder={p.reorderLevel} /></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {isAdmin && (
                              <button onClick={() => setAdjustProduct(p)}
                                className="p-1.5 rounded-lg transition-all hover:scale-105"
                                style={{ background: 'var(--bg-surface)' }} title="Adjust stock">
                                <Edit2 size={12} style={{ color: 'var(--text-secondary)' }} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* GRN history */}
      {tab === 'grn' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Goods Received Notes</h3>
            {isAdmin && (
              <button onClick={() => setShowGRN(true)} className="btn-teal text-sm">
                <Plus size={15} /> New GRN
              </button>
            )}
          </div>
          {state.grns.length === 0 ? (
            <div className="card p-10 text-center">
              <Layers size={32} className="mx-auto mb-2" style={{ color: 'var(--text-muted)' }} />
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>No GRNs recorded yet</div>
            </div>
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                    {['GRN ID', 'Supplier', 'Items', 'Total Cost', 'Status', 'By', 'Date'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {state.grns.map(g => (
                    <tr key={g.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{g.id.slice(0, 12)}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{g.supplierName}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{g.items.length}</td>
                      <td className="px-4 py-3 font-semibold" style={{ color: '#2F7F79' }}>{formatKES(g.totalCost)}</td>
                      <td className="px-4 py-3"><span className="badge badge-sage">{g.status}</span></td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{g.createdBy}</td>
                      <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{formatDateTime(g.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Stock movements ledger */}
      {tab === 'movements' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              Stock Movement Ledger
            </h3>
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Append-only · immutable</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                  {['Product', 'Type', 'Qty', 'Before', 'After', 'Reason', 'By', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {stockMovements.map(m => (
                  <tr key={m.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)', maxWidth: 180 }}>
                      <div className="truncate">{m.productName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={clsx('badge', m.type === 'GOODS_IN' || m.type === 'RETURN_FROM_CUSTOMER' ? 'badge-sage' : m.type === 'SALE' ? 'badge-navy' : 'badge-terracotta')}>
                        {m.type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className={clsx('px-4 py-3 font-bold font-mono', m.quantity > 0 ? 'text-[#6B8F71]' : 'text-[#B5574B]')}>
                      {m.quantity > 0 ? '+' : ''}{m.quantity}
                    </td>
                    <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-secondary)' }}>{m.balanceBefore}</td>
                    <td className="px-4 py-3 font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{m.balanceAfter}</td>
                    <td className="px-4 py-3 max-w-[180px]" style={{ color: 'var(--text-secondary)' }}>
                      <div className="truncate">{m.reason}</div>
                    </td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{m.performedBy}</td>
                    <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{formatDateTime(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showGRN && <GRNModal onClose={() => setShowGRN(false)} />}
      {adjustProduct && <AdjustModal product={adjustProduct} onClose={() => setAdjustProduct(null)} />}
    </div>
  );
}
