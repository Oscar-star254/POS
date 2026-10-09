import React, { useState } from 'react';
import { DollarSign, Plus, X, Check } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatKES, formatDate } from '../lib/utils';
import type { Expense, PaymentMethod } from '../types';

const EXPENSE_CATEGORIES = ['Rent', 'Electricity', 'Water', 'Transport', 'Wages', 'Licence', 'Repairs', 'Marketing', 'Stationery', 'Other'];

function ExpenseModal({ onClose }: { onClose: () => void }) {
  const { dispatch, state } = useApp();
  const { currentUser } = state;
  const [form, setForm] = useState({
    category: '', description: '', amount: '', paymentMethod: 'CASH' as PaymentMethod, reference: ''
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const expense: Expense = {
      id: `e-${Date.now()}`,
      category: form.category,
      description: form.description,
      amount: parseFloat(form.amount),
      paymentMethod: form.paymentMethod,
      reference: form.reference || undefined,
      recordedBy: currentUser?.name || 'Unknown',
      branch: state.activeBranch,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_EXPENSE', expense });
    setSaved(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Record Expense
          </h3>
          <button onClick={onClose}><X size={18} style={{ color: 'var(--text-muted)' }} /></button>
        </div>
        {saved ? (
          <div className="p-8 text-center">
            <Check size={36} color="#6B8F71" className="mx-auto mb-2" />
            <div className="font-bold" style={{ color: 'var(--text-primary)' }}>Expense recorded!</div>
          </div>
        ) : (
          <div className="p-5 space-y-3">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Category</label>
              <select className="input-base" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category…</option>
                {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
              <input className="input-base" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What was this for?" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Amount (KES)</label>
              <input className="input-base" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Payment Method</label>
              <select className="input-base" value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}>
                <option value="CASH">Cash</option>
                <option value="MPESA">M-Pesa</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Reference (optional)</label>
              <input className="input-base font-mono text-xs" value={form.reference} onChange={e => setForm({ ...form, reference: e.target.value })} placeholder="Receipt no. / M-Pesa ref" />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
              <button onClick={handleSave} disabled={!form.category || !form.description || !form.amount}
                className="btn-teal flex-1 justify-center">
                <Check size={15} /> Save
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const { state } = useApp();
  const { expenses } = state;
  const [showModal, setShowModal] = useState(false);

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const byCategory = EXPENSE_CATEGORIES.map(cat => ({
    cat,
    total: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0),
  })).filter(x => x.total > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <div className="card px-5 py-4 flex items-center gap-4">
          <DollarSign size={20} color="#B5574B" />
          <div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Total Expenses (this month)</div>
            <div className="text-xl font-bold" style={{ color: '#B5574B', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatKES(total)}</div>
          </div>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-teal">
          <Plus size={15} /> Record Expense
        </button>
      </div>

      {/* By category */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {byCategory.map(({ cat, total: amt }) => (
          <div key={cat} className="card p-4">
            <div className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{cat}</div>
            <div className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{formatKES(amt)}</div>
          </div>
        ))}
      </div>

      {/* Expenses list */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>All Expenses</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                {['Date', 'Category', 'Description', 'Amount', 'Method', 'Reference', 'By'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {expenses.map(e => (
                <tr key={e.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{formatDate(e.createdAt)}</td>
                  <td className="px-4 py-3"><span className="badge badge-slate">{e.category}</span></td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{e.description}</td>
                  <td className="px-4 py-3 font-bold" style={{ color: '#B5574B' }}>{formatKES(e.amount)}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{e.paymentMethod}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{e.reference || '—'}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>{e.recordedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <ExpenseModal onClose={() => setShowModal(false)} />}
    </div>
  );
}
