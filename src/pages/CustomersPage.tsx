import React, { useState } from 'react';
import { Users, Plus, Search, CreditCard, Phone, Mail, X, Check, TrendingUp } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatKES, formatDate, clsx } from '../lib/utils';
import type { Customer } from '../types';

function CustomerModal({ onClose }: { onClose: () => void }) {
  const { dispatch, state } = useApp();
  const [form, setForm] = useState({
    name: '', phone: '07', email: '', customerType: 'RETAIL' as const, creditLimit: 0, town: '', notes: ''
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const customer: Customer = {
      id: `cust-${Date.now()}`,
      name: form.name,
      phone: form.phone,
      email: form.email,
      customerType: form.customerType,
      creditLimit: form.creditLimit,
      creditBalance: 0,
      loyaltyPoints: 0,
      town: form.town,
      notes: form.notes,
      active: true,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_CUSTOMER', customer });
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Add Customer
          </h3>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        {saved ? (
          <div className="p-8 text-center">
            <Check size={36} color="#6B8F71" className="mx-auto mb-2" />
            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Customer added!</div>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Full Name *</label>
              <input className="input-base" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Customer name" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Phone *</label>
              <input className="input-base" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="0722 000 000" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <input className="input-base" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Customer Type</label>
              <select className="input-base" value={form.customerType} onChange={e => setForm({ ...form, customerType: e.target.value as any })}>
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Credit Limit (KES)</label>
              <input className="input-base" type="number" value={form.creditLimit} onChange={e => setForm({ ...form, creditLimit: +e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Town</label>
              <input className="input-base" value={form.town} onChange={e => setForm({ ...form, town: e.target.value })} placeholder="Nairobi, Mombasa, Kisumu…" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} disabled={!form.name || !form.phone} className="btn-teal flex-1 justify-center">
                <Check size={15} /> Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const { state } = useApp();
  const { customers, language } = state;
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Customer | null>(null);

  const t = (en: string, sw: string) => language === 'sw' ? sw : en;

  const filtered = customers.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const totalDebtors = customers.reduce((s, c) => s + c.creditBalance, 0);
  const totalLoyaltyPoints = customers.reduce((s, c) => s + c.loyaltyPoints, 0);

  return (
    <div className="space-y-5">
      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: t('Total Customers', 'Wateja Wote'), value: customers.filter(c => c.active).length.toString(), accent: '#1F2A44' },
          { label: t('Outstanding Credit (Deni)', 'Deni Linalodaiwa'), value: formatKES(totalDebtors), accent: '#B5574B' },
          { label: t('Total Loyalty Points', 'Pointi za Uaminifu'), value: totalLoyaltyPoints.toLocaleString(), accent: '#2F7F79' },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{k.label}</div>
            <div className="text-xl font-bold mt-1" style={{ color: k.accent, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Search & add */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-base pl-8" placeholder={t('Search by name or phone…', 'Tafuta kwa jina au simu…')}
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <button onClick={() => setShowModal(true)} className="btn-teal">
          <Plus size={15} /> {t('Add Customer', 'Ongeza Mteja')}
        </button>
      </div>

      {/* Customer list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {filtered.map(c => (
          <div key={c.id}
            onClick={() => setSelected(c)}
            className="card card-hover p-4 cursor-pointer">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm"
                  style={{ background: 'rgba(31,42,68,0.1)', color: '#1F2A44' }}>
                  {c.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                  <div className="text-xs flex items-center gap-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    <Phone size={10} />{c.phone}
                  </div>
                </div>
              </div>
              <span className={clsx('badge', c.customerType === 'WHOLESALE' ? 'badge-navy' : 'badge-slate')}>
                {c.customerType}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                <div className="text-xs font-bold" style={{ color: c.creditBalance > 0 ? '#B5574B' : 'var(--text-primary)' }}>
                  {formatKES(c.creditBalance)}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Deni</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                <div className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>
                  {formatKES(c.creditLimit)}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Limit</div>
              </div>
              <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)' }}>
                <div className="text-xs font-bold" style={{ color: '#2F7F79' }}>
                  {c.loyaltyPoints.toLocaleString()}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Points</div>
              </div>
            </div>
            {c.town && (
              <div className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>📍 {c.town}</div>
            )}
            {c.creditBalance > 0 && (
              <div className="mt-2 w-full rounded-full overflow-hidden h-1.5" style={{ background: 'var(--bg-surface)' }}>
                <div className="h-full rounded-full"
                  style={{ width: `${Math.min(100, (c.creditBalance / c.creditLimit) * 100)}%`, background: '#B5574B' }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && <CustomerModal onClose={() => setShowModal(false)} />}

      {/* Customer detail panel */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)}><X size={18} style={{ color: 'var(--text-muted)' }} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Phone</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.phone}</div>
                {selected.email && <>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Email</div>
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.email}</div>
                </>}
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Type</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{selected.customerType}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Credit Balance</div>
                <div className="text-xs font-bold" style={{ color: selected.creditBalance > 0 ? '#B5574B' : '#6B8F71' }}>
                  {formatKES(selected.creditBalance)}
                </div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Credit Limit</div>
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{formatKES(selected.creditLimit)}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Loyalty Points</div>
                <div className="text-xs font-semibold" style={{ color: '#2F7F79' }}>{selected.loyaltyPoints.toLocaleString()}</div>
                <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>Member since</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(selected.createdAt)}</div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="btn-ghost flex-1 justify-center text-xs py-2">
                  <Phone size={13} /> Call
                </button>
                <button className="btn-ghost flex-1 justify-center text-xs py-2">
                  <MessageSquare size={13} /> SMS Statement
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Fix missing import
function MessageSquare(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
