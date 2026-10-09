import React, { useState } from 'react';
import { Shield, Search, Filter, Download, Lock, AlertTriangle } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { formatDateTime, clsx } from '../lib/utils';
import type { AuditAction } from '../types';

const actionColors: Record<string, string> = {
  LOGIN: 'badge-navy',
  LOGOUT: 'badge-slate',
  SALE_CREATED: 'badge-teal',
  SALE_VOIDED: 'badge-terracotta',
  STOCK_RECEIVED: 'badge-sage',
  STOCK_ADJUSTED: 'badge-amber',
  PRICE_CHANGED: 'badge-amber',
  REFUND_PROCESSED: 'badge-terracotta',
  CASH_VARIANCE: 'badge-terracotta',
  GRN_APPROVED: 'badge-sage',
  USER_CREATED: 'badge-navy',
  SETTINGS_CHANGED: 'badge-slate',
};

export default function AuditPage() {
  const { state } = useApp();
  const { auditLogs, currentUser, language } = state;
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  const isAdmin = currentUser?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Lock size={48} color="#B5574B" className="mb-4" />
        <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Access Restricted
        </h2>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          The Audit Trail is only accessible by Admins.
        </p>
      </div>
    );
  }

  const filtered = auditLogs.filter(log => {
    const matchSearch = !search ||
      log.description.toLowerCase().includes(search.toLowerCase()) ||
      log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      (log.entityId || '').toLowerCase().includes(search.toLowerCase());
    const matchAction = filterAction === 'all' || log.action === filterAction;
    const matchRole = filterRole === 'all' || log.performedByRole === filterRole;
    return matchSearch && matchAction && matchRole;
  });

  const uniqueActions = Array.from(new Set(auditLogs.map(l => l.action)));

  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="flex items-center gap-4 p-4 rounded-xl"
        style={{ background: 'rgba(31,42,68,0.06)', border: '1px solid rgba(31,42,68,0.12)' }}>
        <Shield size={22} color="#1F2A44" />
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Immutable Audit Log</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
            All records are append-only. No one — including the Admin — can edit or delete audit entries.
            Every action records: who, what, when, from which device/IP, and old → new values.
          </div>
        </div>
        <div className="ml-auto text-xs font-mono px-3 py-1.5 rounded-lg" style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}>
          {auditLogs.length} entries
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input className="input-base pl-8 text-sm" placeholder="Search actions, users, entities…"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input-base w-44 text-sm" value={filterAction} onChange={e => setFilterAction(e.target.value)}>
          <option value="all">All actions</option>
          {uniqueActions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
        </select>
        <select className="input-base w-36 text-sm" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
          <option value="all">All roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="CASHIER">Cashier</option>
          <option value="ACCOUNTANT">Accountant</option>
        </select>
        <button className="btn-ghost text-sm">
          <Download size={14} /> Export CSV
        </button>
      </div>

      {/* Audit table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)' }}>
                {['Timestamp', 'Action', 'Description', 'By', 'Role', 'Branch', 'IP / Device'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => (
                <tr key={log.id} className="border-b hover:opacity-90 transition-opacity"
                  style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3 whitespace-nowrap font-mono" style={{ color: 'var(--text-muted)' }}>
                    {formatDateTime(log.createdAt)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={clsx('badge', actionColors[log.action] || 'badge-slate')}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-[260px]" style={{ color: 'var(--text-secondary)' }}>
                    <div className="truncate">{log.description}</div>
                    {(log.oldValue || log.newValue) && (
                      <div className="text-xs mt-0.5 font-mono" style={{ color: 'var(--text-muted)' }}>
                        {log.oldValue && <span style={{ color: '#B5574B' }}>before: {JSON.stringify(log.oldValue).slice(0, 40)} </span>}
                        {log.newValue && <span style={{ color: '#6B8F71' }}>after: {JSON.stringify(log.newValue).slice(0, 40)}</span>}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>
                    {log.performedBy}
                  </td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge', log.performedByRole === 'ADMIN' ? 'badge-navy' : log.performedByRole === 'MANAGER' ? 'badge-teal' : 'badge-slate')}>
                      {log.performedByRole}
                    </span>
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>{log.branch}</td>
                  <td className="px-4 py-3 font-mono" style={{ color: 'var(--text-muted)' }}>
                    <div>{log.ipAddress || '—'}</div>
                    {log.deviceInfo && <div className="text-xs">{log.deviceInfo.slice(0, 20)}</div>}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                    No audit records match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Security alerts */}
      <div className="card p-5">
        <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          <AlertTriangle size={15} color="#C9A227" /> Security Alerts
        </h3>
        <div className="space-y-2">
          {auditLogs.filter(l => l.action === 'CASH_VARIANCE' || l.action === 'SALE_VOIDED').map(log => (
            <div key={log.id} className="flex items-start gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(201,162,39,0.08)', border: '1px solid rgba(201,162,39,0.2)' }}>
              <AlertTriangle size={14} color="#C9A227" className="flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-semibold" style={{ color: '#96780F' }}>{log.action.replace(/_/g, ' ')}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{log.description}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  by {log.performedBy} · {formatDateTime(log.createdAt)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
