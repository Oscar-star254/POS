import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { FileBarChart2, Download, Calendar, TrendingUp, DollarSign, Package, Users } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatKES, formatNumber, formatDate } from '../lib/utils';
import { generateWeeklySales, generateMonthlySales, paymentMethodData } from '../data/seed';

type ReportTab = 'sales' | 'inventory' | 'vat' | 'cashier' | 'pnl';

const weeklySales = generateWeeklySales();
const monthlySales = generateMonthlySales();

export default function ReportsPage() {
  const { state } = useApp();
  const { products, expenses, customers, language, sales } = state;
  const [tab, setTab] = useState<ReportTab>('sales');
  const [dateRange, setDateRange] = useState('month');

  const t = (en: string, sw: string) => language === 'sw' ? sw : en;

  const totalRevenue = monthlySales.reduce((s, m) => s + m.sales, 0);
  const totalProfit = monthlySales.reduce((s, m) => s + m.profit, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalProfit - totalExpenses;
  const totalVAT = totalRevenue * 0.16 / 1.16;
  const stockValue = products.reduce((s, p) => s + p.currentStock * p.buyingPrice, 0);
  const topProducts = Object.values(sales.filter(sale => sale.status === 'COMPLETED').reduce<Record<string, {
    name: string;
    units: number;
    sales: number;
  }>>((totals, sale) => {
    sale.items.forEach(item => {
      const current = totals[item.productId] ?? { name: item.productName, units: 0, sales: 0 };
      current.units += item.quantity;
      current.sales += item.subtotal;
      totals[item.productId] = current;
    });
    return totals;
  }, {})).sort((a, b) => b.sales - a.sales);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="px-3 py-2 rounded-lg shadow-lg text-xs"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
        <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</div>
        {payload.map((p: any) => (
          <div key={p.name} style={{ color: p.color }}>
            {p.name}: <strong>{formatKES(p.value)}</strong>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
          {([
            { id: 'sales', label: t('Sales', 'Mauzo') },
            { id: 'inventory', label: t('Inventory', 'Stoo') },
            { id: 'vat', label: 'VAT / KRA' },
            { id: 'cashier', label: t('By Cashier', 'Kwa Cashier') },
            { id: 'pnl', label: 'P&L' },
          ] as const).map(t_ => (
            <button key={t_.id} onClick={() => setTab(t_.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                background: tab === t_.id ? '#1F2A44' : 'transparent',
                color: tab === t_.id ? 'white' : 'var(--text-muted)',
              }}>
              {t_.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <select className="input-base text-xs w-36" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="last_month">Last Month</option>
            <option value="year">This Year</option>
          </select>
          <button className="btn-ghost text-xs">
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Sales Report */}
      {tab === 'sales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Revenue', value: formatKES(totalRevenue), icon: DollarSign, accent: '#2F7F79' },
              { label: 'Gross Profit', value: formatKES(totalProfit), icon: TrendingUp, accent: '#6B8F71' },
              { label: 'Transactions', value: formatNumber(1847), icon: FileBarChart2, accent: '#1F2A44' },
              { label: 'Avg Basket Size', value: formatKES(totalRevenue / 1847), icon: Users, accent: '#C9A227' },
            ].map(k => (
              <div key={k.label} className="card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{k.label}</div>
                  <k.icon size={16} color={k.accent} />
                </div>
                <div className="text-xl font-bold" style={{ color: k.accent, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{k.value}</div>
              </div>
            ))}
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Monthly Sales & Profit</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                  tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sales" fill="#1F2A44" radius={[3,3,0,0]} maxBarSize={32} name="sales" />
                <Bar dataKey="profit" fill="#2F7F79" radius={[3,3,0,0]} maxBarSize={32} name="profit" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Top Products by Revenue</h3>
            <div className="space-y-2">
              {topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-4">
                  <span className="w-5 text-xs font-bold text-center" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</span>
                      <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{formatKES(p.sales)}</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                      <div className="h-full rounded-full" style={{
                        width: `${(p.sales / (topProducts[0]?.sales || 1) * 100).toFixed(0)}%`,
                        background: i < 3 ? '#1F2A44' : '#2F7F79',
                      }} />
                    </div>
                  </div>
                  <span className="text-xs w-14 text-right" style={{ color: 'var(--text-muted)' }}>{formatNumber(p.units)} pcs</span>
                </div>
              ))}
              {topProducts.length === 0 && (
                <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                  Product performance will appear after completed sales.
                </div>
              )}
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Payment Method Breakdown
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {paymentMethodData.map(pm => (
                <div key={pm.name} className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)', borderLeft: `3px solid ${pm.color}` }}>
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{pm.name}</div>
                  <div className="text-lg font-bold mt-1" style={{ color: pm.color }}>{pm.value}%</div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {formatKES(totalRevenue * pm.value / 100)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Inventory report */}
      {tab === 'inventory' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Stock Value (Cost)', value: formatKES(stockValue), accent: '#1F2A44' },
              { label: 'Retail Value', value: formatKES(products.reduce((s, p) => s + p.currentStock * p.sellingPrice, 0)), accent: '#2F7F79' },
              { label: 'Potential Margin', value: formatKES(products.reduce((s, p) => s + p.currentStock * (p.sellingPrice - p.buyingPrice), 0)), accent: '#6B8F71' },
            ].map(k => (
              <div key={k.label} className="card p-4">
                <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{k.label}</div>
                <div className="text-xl font-bold mt-1" style={{ color: k.accent, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{k.value}</div>
              </div>
            ))}
          </div>
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Stock Valuation Report</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                    {['Product', 'Qty', 'Unit Cost', 'Cost Value', 'Sell Price', 'Retail Value', 'Margin'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.filter(p => p.currentStock > 0).map(p => {
                    const costVal = p.currentStock * p.buyingPrice;
                    const retailVal = p.currentStock * p.sellingPrice;
                    const margin = ((p.sellingPrice - p.buyingPrice) / p.buyingPrice * 100).toFixed(1);
                    return (
                      <tr key={p.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{p.currentStock} {p.unit}</td>
                        <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{formatKES(p.buyingPrice)}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{formatKES(costVal)}</td>
                        <td className="px-4 py-3" style={{ color: '#2F7F79' }}>{formatKES(p.sellingPrice)}</td>
                        <td className="px-4 py-3 font-semibold" style={{ color: '#2F7F79' }}>{formatKES(retailVal)}</td>
                        <td className="px-4 py-3">
                          <span className="badge badge-sage">{margin}%</span>
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

      {/* VAT Report */}
      {tab === 'vat' && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl" style={{ background: 'rgba(47,127,121,0.08)' }}>
              <div className="text-2xl">🇰🇪</div>
              <div>
                <div className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>KRA VAT Report</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  For filing purposes. KRA PIN: {state.settings.kraPin}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {[
                { label: 'Total Sales (Incl. VAT)', value: formatKES(totalRevenue) },
                { label: 'Standard-Rated Sales', value: formatKES(totalRevenue * 0.65) },
                { label: 'Zero-Rated Sales', value: formatKES(totalRevenue * 0.35) },
                { label: 'Output VAT (16%)', value: formatKES(totalVAT) },
                { label: 'Input VAT (Purchases)', value: formatKES(totalVAT * 0.6) },
                { label: 'VAT Payable to KRA', value: formatKES(totalVAT * 0.4) },
              ].map(k => (
                <div key={k.label} className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{k.label}</div>
                  <div className="text-sm font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{k.value}</div>
                </div>
              ))}
            </div>
            <div className="card p-4" style={{ background: 'rgba(47,127,121,0.06)' }}>
              <div className="text-xs font-semibold mb-2" style={{ color: '#2F7F79' }}>eTIMS Integration Status</div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 rounded-full bg-[#6B8F71]" />
                <span style={{ color: 'var(--text-secondary)' }}>Sandbox mode active — connect real eTIMS API in Settings</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cashier report */}
      {tab === 'cashier' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Sales by Cashier</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                  {['Cashier', 'Transactions', 'Revenue', 'Avg Basket', 'Cash', 'M-Pesa', 'Variances'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Aisha Hassan', txn: 143, rev: 94780, cash: 28340, mpesa: 58420, variance: -250 },
                  { name: 'John Kamau', txn: 89, rev: 67450, cash: 20400, mpesa: 39280, variance: 0 },
                  { name: 'Mary Wanjiku', txn: 112, rev: 82100, cash: 24600, mpesa: 49300, variance: 150 },
                ].map(row => (
                  <tr key={row.name} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>{row.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{row.txn}</td>
                    <td className="px-4 py-3 font-semibold" style={{ color: '#2F7F79' }}>{formatKES(row.rev)}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{formatKES(row.rev / row.txn)}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{formatKES(row.cash)}</td>
                    <td className="px-4 py-3" style={{ color: '#2F7F79' }}>{formatKES(row.mpesa)}</td>
                    <td className="px-4 py-3">
                      <span className={row.variance < 0 ? 'badge badge-terracotta' : row.variance > 0 ? 'badge badge-sage' : 'badge badge-slate'}>
                        {row.variance >= 0 ? '+' : ''}{formatKES(row.variance)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* P&L */}
      {tab === 'pnl' && (
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text-primary)' }}>
              Profit & Loss Statement — {new Date().toLocaleString('en-KE', { month: 'long', year: 'numeric' })}
            </h3>
            <div className="space-y-1">
              {[
                { label: 'Gross Revenue', value: totalRevenue, bold: false, color: '' },
                { label: '  Less: Cost of Goods Sold', value: -totalRevenue * 0.72, bold: false, color: '' },
                { label: 'Gross Profit', value: totalProfit, bold: true, color: '#6B8F71', border: true },
                { label: '  Rent', value: -45000, bold: false, color: '' },
                { label: '  Electricity (KPLC)', value: -8500, bold: false, color: '' },
                { label: '  Transport', value: -3500, bold: false, color: '' },
                { label: '  Water', value: -2200, bold: false, color: '' },
                { label: '  Wages (Casual)', value: -6000, bold: false, color: '' },
                { label: '  County Permit', value: -12000, bold: false, color: '' },
                { label: 'Total Expenses', value: -totalExpenses, bold: true, color: '#B5574B', border: true },
                { label: 'Net Profit', value: netProfit, bold: true, color: netProfit > 0 ? '#6B8F71' : '#B5574B', border: true },
              ].map((row, i) => (
                <div key={i} className={`flex justify-between py-2 text-sm ${row.border ? 'border-t mt-1' : ''}`}
                  style={{ borderColor: 'var(--border-color)' }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: row.bold ? 600 : 400 }}>{row.label}</span>
                  <span style={{ color: row.color || (row.value < 0 ? '#B5574B' : 'var(--text-primary)'), fontWeight: row.bold ? 700 : 500 }}>
                    {formatKES(row.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
