import React, { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, ShoppingBag, DollarSign, Users,
  CreditCard, AlertTriangle, Package, ArrowRight, Clock, ChevronRight
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import {
  formatKES, formatNumber, stockStatus, trendColor, clsx, timeAgo
} from '../lib/utils';
import {
  generateHourlySales, generateWeeklySales, generateMonthlySales,
  paymentMethodData, categoryRevenue
} from '../data/seed';

const hourlySales = generateHourlySales();
const weeklySales = generateWeeklySales();
const monthlySales = generateMonthlySales();

type Range = 'today' | 'week' | 'month';

function KPICard({ title, value, trend, subtitle, icon: Icon, accent }: {
  title: string; value: string; trend: number; subtitle: string;
  icon: React.ElementType; accent: string;
}) {
  const positive = trend >= 0;
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{title}</div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}18` }}>
          <Icon size={18} color={accent} />
        </div>
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
        {value}
      </div>
      <div className="flex items-center gap-2">
        <span className={clsx('flex items-center gap-0.5 text-xs font-semibold', positive ? 'text-[#6B8F71]' : 'text-[#B5574B]')}>
          {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {Math.abs(trend)}%
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{subtitle}</span>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg shadow-lg text-xs"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
      <div className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: 'var(--text-secondary)' }}>{p.name}: </span>
          <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
            {p.name === 'profit' || p.name === 'sales' ? formatKES(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const { state, navigate } = useApp();
  const { products, customers, notifications, sales, language } = state;
  const [range, setRange] = useState<Range>('week');

  const t = (en: string, sw: string) => language === 'sw' ? sw : en;

  const lowStockItems = products.filter(p => stockStatus(p.currentStock, p.reorderLevel) === 'LOW');
  const outOfStock = products.filter(p => p.currentStock <= 0);
  const unreadAlerts = notifications.filter(n => !n.read);
  const totalCreditOutstanding = customers.reduce((s, c) => s + c.creditBalance, 0);
  const topProducts = Object.values(sales.filter(sale => sale.status === 'COMPLETED').reduce<Record<string, {
    name: string;
    units: number;
    sales: number;
    trend: number;
  }>>((totals, sale) => {
    sale.items.forEach(item => {
      const current = totals[item.productId] ?? { name: item.productName, units: 0, sales: 0, trend: 0 };
      current.units += item.quantity;
      current.sales += item.subtotal;
      totals[item.productId] = current;
    });
    return totals;
  }, {})).sort((a, b) => b.sales - a.sales);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chartData: any[] = range === 'today' ? hourlySales : range === 'week' ? weeklySales : monthlySales;
  const xKey = range === 'today' ? 'hour' : range === 'week' ? 'day' : 'month';

  const todaySales = 94780;
  const todayProfit = 21240;
  const todayTransactions = 143;

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title={t("Today's Sales", "Mauzo ya Leo")} value={formatKES(todaySales)}
          trend={12.4} subtitle={t('vs yesterday', 'dhidi ya jana')} icon={ShoppingBag} accent="#2F7F79" />
        <KPICard title={t('Gross Profit', 'Faida Jumla')} value={formatKES(todayProfit)}
          trend={8.7} subtitle={t('vs yesterday', 'dhidi ya jana')} icon={TrendingUp} accent="#6B8F71" />
        <KPICard title={t('Transactions', 'Shughuli')} value={formatNumber(todayTransactions)}
          trend={5.2} subtitle={t('avg basket Ksh 663', 'kikapu wastani')} icon={CreditCard} accent="#C9A227" />
        <KPICard title={t('Credit (Deni)', 'Deni')} value={formatKES(totalCreditOutstanding)}
          trend={-3.1} subtitle={t('outstanding balance', 'deni linalodaiwa')} icon={Users} accent="#B5574B" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Sales trend */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
                {t('Sales Trend', 'Mwenendo wa Mauzo')}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Revenue and profit over time</p>
            </div>
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
              {(['today', 'week', 'month'] as Range[]).map(r => (
                <button key={r} onClick={() => setRange(r)}
                  className="px-2.5 py-1 rounded-md text-xs font-semibold transition-all capitalize"
                  style={{
                    background: range === r ? 'var(--bg-card)' : 'transparent',
                    color: range === r ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow: range === r ? 'var(--shadow-sm)' : 'none',
                  }}>
                  {r === 'today' ? t('Today', 'Leo') : r === 'week' ? t('Week', 'Wiki') : t('Month', 'Mwezi')}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2F7F79" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2F7F79" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B8F71" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6B8F71" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
              <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="sales" stroke="#2F7F79" strokeWidth={2}
                fill="url(#salesGrad)" name="sales" dot={false} />
              {range !== 'today' && (
                <Area type="monotone" dataKey="profit" stroke="#6B8F71" strokeWidth={2}
                  fill="url(#profitGrad)" name="profit" dot={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment mix donut */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {t('Payment Mix', 'Njia za Malipo')}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Today's breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={paymentMethodData} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                dataKey="value" stroke="none">
                {paymentMethodData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v}%`, '']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {paymentMethodData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>{d.name}</span>
                </div>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Top products */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {t('Top Products', 'Bidhaa Zinazouza Zaidi')}
            </h3>
            <button onClick={() => navigate('reports')} className="text-xs flex items-center gap-1" style={{ color: '#2F7F79' }}>
              {t('View all', 'Ona zote')} <ChevronRight size={12} />
            </button>
          </div>
          <div className="space-y-2">
            {topProducts.slice(0, 6).map((p, i) => (
              <div key={p.name} className="flex items-center gap-3 py-1.5">
                <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatNumber(p.units)} units</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{formatKES(p.sales)}</div>
                  <div className={clsx('text-xs font-medium', p.trend >= 0 ? 'text-[#6B8F71]' : 'text-[#B5574B]')}>
                    {p.trend >= 0 ? '+' : ''}{p.trend}%
                  </div>
                </div>
                <div className="w-20 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface)' }}>
                  <div className="h-full rounded-full" style={{
                    width: `${(p.sales / (topProducts[0]?.sales || 1) * 100).toFixed(0)}%`,
                    background: '#2F7F79',
                  }} />
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                Product performance will appear after your first sale.
              </div>
            )}
          </div>
        </div>

        {/* Alerts panel */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {t('Alerts', 'Tahadhari')}
            </h3>
            {unreadAlerts.length > 0 && (
              <span className="badge badge-terracotta">{unreadAlerts.length}</span>
            )}
          </div>
          <div className="space-y-3">
            {outOfStock.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(181,87,75,0.08)' }}>
                <AlertTriangle size={15} color="#B5574B" className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold" style={{ color: '#B5574B' }}>
                    {outOfStock.length} item{outOfStock.length > 1 ? 's' : ''} out of stock
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {outOfStock.map(p => p.name.split(' ').slice(0,2).join(' ')).join(', ')}
                  </div>
                </div>
              </div>
            )}
            {lowStockItems.length > 0 && (
              <div className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(201,162,39,0.08)' }}>
                <Package size={15} color="#C9A227" className="flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-semibold" style={{ color: '#C9A227' }}>
                    {lowStockItems.length} low stock items
                  </div>
                  <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {lowStockItems.slice(0,2).map(p => p.name.split(' ').slice(0,2).join(' ')).join(', ')}
                    {lowStockItems.length > 2 && ` +${lowStockItems.length - 2} more`}
                  </div>
                </div>
              </div>
            )}
            {unreadAlerts.slice(0, 3).map(n => (
              <div key={n.id} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: '#2F7F79' }} />
                <div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</div>
                  <div className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    {n.message.slice(0, 80)}{n.message.length > 80 ? '…' : ''}
                  </div>
                  <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</div>
                </div>
              </div>
            ))}
            <button onClick={() => navigate('inventory')}
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-lg text-xs font-medium transition-all hover:opacity-80"
              style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
              View inventory <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Category revenue bar chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {t('Revenue by Category', 'Mapato kwa Aina')}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>This month</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={categoryRevenue} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" horizontal={true} vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
              tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="revenue" name="sales" fill="#1F2A44" radius={[4, 4, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
