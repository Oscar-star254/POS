import React, { useState } from 'react';
import {
  Settings, Building2, Key, Smartphone, Bell, Users, Shield,
  Check, Globe, Lock, Printer, Plus, Trash2, X, AlertTriangle
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { User, UserRole } from '../types';

type SettingsTab = 'business' | 'mpesa' | 'etims' | 'users' | 'notifications' | 'security' | 'receipt';

export default function SettingsPage() {
  const { state, dispatch, createUser, deleteUser } = useApp();
  const { settings, users, currentUser, branches } = state;
  const [tab, setTab] = useState<SettingsTab>('business');
  const [localSettings, setLocalSettings] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<User | null>(null);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'CASHIER' as Exclude<UserRole, 'ADMIN'>,
    branch: state.activeBranch,
    pin: '',
    password: '',
  });

  const isAdmin = currentUser?.role === 'ADMIN';

  const handleSave = () => {
    dispatch({ type: 'UPDATE_SETTINGS', settings: localSettings });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const update = (key: keyof typeof localSettings, value: unknown) => {
    setLocalSettings(s => ({ ...s, [key]: value }));
  };

  const resetUserForm = () => {
    setNewUser({
      name: '',
      email: '',
      phone: '',
      role: 'CASHIER',
      branch: state.activeBranch,
      pin: '',
      password: '',
    });
    setUserError('');
  };

  const handleCreateUser = (event: React.FormEvent) => {
    event.preventDefault();
    setUserError('');
    setUserSuccess('');
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.pin || !newUser.password) {
      setUserError('Name, email, PIN, and temporary password are required.');
      return;
    }
    if (!/^\d{4}$/.test(newUser.pin)) {
      setUserError('PIN must contain exactly 4 digits.');
      return;
    }
    if (newUser.password.length < 8) {
      setUserError('Temporary password must be at least 8 characters.');
      return;
    }

    const result = createUser({
      ...newUser,
      name: newUser.name.trim(),
      email: newUser.email.trim(),
      phone: newUser.phone.trim() || undefined,
    });
    if (!result.success) {
      setUserError(result.error || 'Unable to create user.');
      return;
    }
    setShowUserForm(false);
    resetUserForm();
    setUserSuccess(`${newUser.name.trim()} can now sign in.`);
    setTimeout(() => setUserSuccess(''), 3500);
  };

  const handleDeleteUser = () => {
    if (!pendingDelete) return;
    const result = deleteUser(pendingDelete.id);
    if (!result.success) {
      setUserError(result.error || 'Unable to delete user.');
      return;
    }
    setPendingDelete(null);
    setUserSuccess('User deleted and the action was added to the audit trail.');
    setTimeout(() => setUserSuccess(''), 3500);
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: 'business', label: 'Business', icon: Building2 },
    { id: 'mpesa', label: 'M-Pesa', icon: Smartphone },
    { id: 'etims', label: 'eTIMS / KRA', icon: Globe },
    { id: 'receipt', label: 'Receipt', icon: Printer },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <div className="flex gap-6 h-full">
      {/* Settings nav */}
      <div className="w-48 flex-shrink-0">
        <nav className="card p-2 space-y-0.5">
          {tabs.map(t_ => {
            const Icon = t_.icon;
            return (
              <button key={t_.id} onClick={() => setTab(t_.id)}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all text-left"
                style={{
                  background: tab === t_.id ? 'rgba(31,42,68,0.08)' : 'transparent',
                  color: tab === t_.id ? '#1F2A44' : 'var(--text-secondary)',
                }}>
                <Icon size={15} />
                {t_.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings panel */}
      <div className="flex-1 min-w-0">
        <div className="card p-6 space-y-5">
          {/* Business profile */}
          {tab === 'business' && (
            <>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Business Profile
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Business Name', key: 'name' as const },
                  { label: 'Legal Name', key: 'legalName' as const },
                  { label: 'KRA PIN', key: 'kraPin' as const },
                  { label: 'Phone', key: 'phone' as const },
                  { label: 'Email', key: 'email' as const },
                  { label: 'Address', key: 'address' as const },
                  { label: 'Town', key: 'town' as const },
                  { label: 'County', key: 'county' as const },
                ].map(field => (
                  <div key={field.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {field.label}
                    </label>
                    <input className="input-base" value={(localSettings[field.key] as string) || ''}
                      onChange={e => update(field.key, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>VAT Rate</label>
                  <div className="flex items-center gap-2">
                    <input type="number" className="input-base" value={localSettings.vatRate}
                      onChange={e => update('vatRate', +e.target.value)} />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>VAT Pricing</label>
                  <div className="flex items-center gap-3 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={localSettings.vatInclusivePricing}
                        onChange={() => update('vatInclusivePricing', true)} />
                      <span className="text-xs">VAT Inclusive</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" checked={!localSettings.vatInclusivePricing}
                        onChange={() => update('vatInclusivePricing', false)} />
                      <span className="text-xs">VAT Exclusive</span>
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* M-Pesa */}
          {tab === 'mpesa' && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  M-Pesa Integration
                </h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Sandbox mode</span>
                  <button onClick={() => update('mpesaSandboxMode', !localSettings.mpesaSandboxMode)}
                    className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                    style={{ background: localSettings.mpesaSandboxMode ? '#C9A227' : '#6B8F71' }}>
                    <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                      style={{ left: localSettings.mpesaSandboxMode ? '2px' : 'calc(100% - 18px)' }} />
                  </button>
                </div>
              </div>
              {localSettings.mpesaSandboxMode && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                  style={{ background: 'rgba(201,162,39,0.1)', color: '#96780F' }}>
                  ⚠️ Sandbox mode: payments are simulated. Switch off for production.
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Buy Goods Till Number', key: 'mpesaTillNumber' as const },
                  { label: 'Paybill Number', key: 'mpesaPaybill' as const },
                  { label: 'Account Number', key: 'mpesaAccountNumber' as const },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                    <input className="input-base" value={(localSettings[f.key] as string) || ''}
                      onChange={e => update(f.key, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <div className="p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Daraja API Credentials
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    Register at developer.safaricom.co.ke and add your sandbox/production credentials below.
                  </div>
                </div>
                {[
                  { label: 'Consumer Key', key: 'mpesaConsumerKey' as const },
                  { label: 'Consumer Secret', key: 'mpesaConsumerSecret' as const },
                ].map(f => (
                  <div key={f.key}>
                    <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                    <input className="input-base font-mono text-xs" type="password"
                      value={(localSettings[f.key] as string) || ''}
                      placeholder="●●●●●●●●●●●●●●●●●●"
                      onChange={e => update(f.key, e.target.value)} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* eTIMS */}
          {tab === 'etims' && (
            <>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                KRA eTIMS Integration
              </h2>
              <div className="p-4 rounded-xl" style={{ background: 'rgba(47,127,121,0.06)', border: '1px solid rgba(47,127,121,0.2)' }}>
                <div className="font-semibold text-sm mb-1" style={{ color: '#2F7F79' }}>About eTIMS</div>
                <div className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  KRA's Electronic Tax Invoice Management System (eTIMS) requires all VAT-registered businesses to issue electronic receipts.
                  Each receipt gets a unique Control Unit Invoice Number and QR code for verification.
                  Integration points are fully architected — connect your eTIMS credentials to go live.
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>eTIMS Enabled</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Generate eTIMS invoice numbers on every receipt</div>
                </div>
                <button onClick={() => update('etimsEnabled', !localSettings.etimsEnabled)}
                  className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                  style={{ background: localSettings.etimsEnabled ? '#2F7F79' : 'var(--border-color)' }}>
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                    style={{ left: localSettings.etimsEnabled ? 'calc(100% - 18px)' : '2px' }} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sandbox / Test Mode</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Use KRA sandbox environment for testing</div>
                </div>
                <button onClick={() => update('etimsSandboxMode', !localSettings.etimsSandboxMode)}
                  className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                  style={{ background: localSettings.etimsSandboxMode ? '#C9A227' : '#2F7F79' }}>
                  <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                    style={{ left: localSettings.etimsSandboxMode ? 'calc(100% - 18px)' : '2px' }} />
                </button>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  KRA PIN
                </label>
                <input className="input-base font-mono" value={localSettings.kraPin}
                  onChange={e => update('kraPin', e.target.value)} />
              </div>
            </>
          )}

          {/* Receipt */}
          {tab === 'receipt' && (
            <>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Receipt Settings
              </h2>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Receipt Footer Message
                </label>
                <textarea className="input-base resize-none h-20 text-sm"
                  value={localSettings.receiptFooter || ''}
                  onChange={e => update('receiptFooter', e.target.value)}
                  placeholder="Thank you for shopping with us!" />
              </div>
              <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                <div className="font-semibold text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Receipt Preview</div>
                <div className="font-mono text-xs space-y-1 text-center" style={{ color: 'var(--text-primary)' }}>
                  <div className="font-bold">{localSettings.name}</div>
                  <div style={{ color: 'var(--text-muted)' }}>KRA PIN: {localSettings.kraPin}</div>
                  <div style={{ color: 'var(--text-muted)' }}>Tel: {localSettings.phone}</div>
                  <div className="border-t border-dashed my-2" style={{ borderColor: 'var(--border-color)' }} />
                  <div className="text-left">Item 1 × 2 ........ 240.00</div>
                  <div className="text-left">Item 2 × 1 ........ 120.00</div>
                  <div className="border-t border-dashed my-1" style={{ borderColor: 'var(--border-color)' }} />
                  <div className="flex justify-between"><span>TOTAL</span><span>KES 360.00</span></div>
                  <div className="border-t border-dashed my-1" style={{ borderColor: 'var(--border-color)' }} />
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{localSettings.receiptFooter}</div>
                </div>
              </div>
            </>
          )}

          {/* Users */}
          {tab === 'users' && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                    Users & Roles
                  </h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    Create and remove staff accounts. Every change is recorded in the audit trail.
                  </p>
                </div>
                {isAdmin && (
                  <button onClick={() => { resetUserForm(); setShowUserForm(true); }} className="btn-teal">
                    <Plus size={15} /> Add user
                  </button>
                )}
              </div>
              {userSuccess && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs badge-sage">
                  <Check size={14} /> {userSuccess}
                </div>
              )}
              {userError && !showUserForm && (
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs badge-terracotta">
                  <AlertTriangle size={14} /> {userError}
                </div>
              )}
              <div className="p-3 rounded-xl text-xs mb-2" style={{ background: 'var(--bg-surface)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>Permission Matrix</strong>
                <div className="mt-2 grid grid-cols-5 gap-2 text-center">
                  <div style={{ color: 'var(--text-muted)' }}>Action</div>
                  {['Admin', 'Manager', 'Cashier', 'Accountant'].map(r => (
                    <div key={r} className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{r}</div>
                  ))}
                  {[
                    ['Make Sales', true, true, true, false],
                    ['View Stock', true, true, true, true],
                    ['Receive Stock (GRN)', true, false, false, false],
                    ['Adjust Stock', true, false, false, false],
                    ['Write-off Stock', true, false, false, false],
                    ['View Cost Price', true, false, false, true],
                    ['View All Reports', true, true, false, true],
                    ['Void Sales', true, true, false, false],
                    ['Manage Users', true, false, false, false],
                    ['Settings', true, false, false, false],
                    ['Audit Trail', true, false, false, false],
                  ].map(([action, ...perms]) => (
                    <React.Fragment key={action as string}>
                      <div className="text-left py-1" style={{ color: 'var(--text-secondary)' }}>{action as string}</div>
                      {(perms as boolean[]).map((p, i) => (
                        <div key={i} className="py-1 flex justify-center">
                          {p ? <span style={{ color: '#6B8F71' }}>✓</span> : <span style={{ color: '#B5574B' }}>✗</span>}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {users.map(u => (
                  <div key={u.id} className="flex items-center gap-4 p-3 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                    <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                      style={{ background: 'rgba(31,42,68,0.12)', color: '#1F2A44' }}>
                      {u.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{u.name}</div>
                      <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email} · PIN: {u.pin}</div>
                    </div>
                    <span className={`badge ${u.role === 'ADMIN' ? 'badge-navy' : u.role === 'MANAGER' ? 'badge-teal' : u.role === 'CASHIER' ? 'badge-slate' : 'badge-amber'}`}>
                      {u.role}
                    </span>
                    <span className={`badge ${u.active ? 'badge-sage' : 'badge-terracotta'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                    {isAdmin && u.role !== 'ADMIN' && (
                      <button
                        onClick={() => { setUserError(''); setPendingDelete(u); }}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: '#B5574B' }}
                        title={`Delete ${u.name}`}
                        aria-label={`Delete ${u.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {showUserForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(18,22,31,0.58)' }}>
                  <div className="card w-full max-w-lg p-6" role="dialog" aria-modal="true" aria-labelledby="create-user-title">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <h3 id="create-user-title" className="font-bold" style={{ color: 'var(--text-primary)' }}>Create staff account</h3>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Assign access based on the staff member's responsibilities.</p>
                      </div>
                      <button className="btn-ghost p-2" onClick={() => setShowUserForm(false)} aria-label="Close">
                        <X size={16} />
                      </button>
                    </div>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Full name
                          <input className="input-base mt-1.5" value={newUser.name} onChange={event => setNewUser(user => ({ ...user, name: event.target.value }))} autoFocus />
                        </label>
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Phone (optional)
                          <input className="input-base mt-1.5" value={newUser.phone} onChange={event => setNewUser(user => ({ ...user, phone: event.target.value }))} placeholder="07XX XXX XXX" />
                        </label>
                      </div>
                      <label className="block text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                        Email address
                        <input type="email" className="input-base mt-1.5" value={newUser.email} onChange={event => setNewUser(user => ({ ...user, email: event.target.value }))} placeholder="name@business.co.ke" />
                      </label>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Role
                          <select className="input-base mt-1.5" value={newUser.role} onChange={event => setNewUser(user => ({ ...user, role: event.target.value as Exclude<UserRole, 'ADMIN'> }))}>
                            <option value="CASHIER">Cashier</option>
                            <option value="MANAGER">Manager</option>
                            <option value="ACCOUNTANT">Accountant</option>
                          </select>
                        </label>
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Branch
                          <select className="input-base mt-1.5" value={newUser.branch} onChange={event => setNewUser(user => ({ ...user, branch: event.target.value }))}>
                            {branches.filter(branch => branch.active).map(branch => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
                          </select>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          4-digit PIN
                          <input inputMode="numeric" maxLength={4} className="input-base mt-1.5 font-mono" value={newUser.pin} onChange={event => setNewUser(user => ({ ...user, pin: event.target.value.replace(/\D/g, '') }))} placeholder="••••" />
                        </label>
                        <label className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Temporary password
                          <input type="password" className="input-base mt-1.5" value={newUser.password} onChange={event => setNewUser(user => ({ ...user, password: event.target.value }))} placeholder="At least 8 characters" />
                        </label>
                      </div>
                      {userError && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs badge-terracotta">
                          <AlertTriangle size={14} /> {userError}
                        </div>
                      )}
                      <div className="flex justify-end gap-2 pt-2">
                        <button type="button" className="btn-ghost" onClick={() => setShowUserForm(false)}>Cancel</button>
                        <button type="submit" className="btn-teal"><Plus size={15} /> Create user</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
              {pendingDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(18,22,31,0.58)' }}>
                  <div className="card w-full max-w-sm p-6" role="alertdialog" aria-modal="true" aria-labelledby="delete-user-title">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 badge-terracotta">
                      <Trash2 size={18} />
                    </div>
                    <h3 id="delete-user-title" className="font-bold" style={{ color: 'var(--text-primary)' }}>Delete {pendingDelete.name}?</h3>
                    <p className="text-sm mt-2" style={{ color: 'var(--text-secondary)' }}>
                      Their sign-in access will be removed immediately. The audit record will remain permanently.
                    </p>
                    <div className="flex justify-end gap-2 mt-6">
                      <button className="btn-ghost" onClick={() => setPendingDelete(null)}>Cancel</button>
                      <button className="btn-danger" onClick={handleDeleteUser}><Trash2 size={15} /> Delete user</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Security */}
          {tab === 'security' && (
            <>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Security Settings
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      PIN Auto-Lock Timeout
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Lock POS after inactivity
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" className="input-base w-20 text-sm" value={localSettings.pinLockTimeout}
                      onChange={e => update('pinLockTimeout', +e.target.value)} />
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>seconds</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                  <div>
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Require Admin for Large Discounts
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      Discounts above {localSettings.discountThreshold}% need admin override
                    </div>
                  </div>
                  <button onClick={() => update('requireAdminForDiscount', !localSettings.requireAdminForDiscount)}
                    className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                    style={{ background: localSettings.requireAdminForDiscount ? '#2F7F79' : 'var(--border-color)' }}>
                    <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                      style={{ left: localSettings.requireAdminForDiscount ? 'calc(100% - 18px)' : '2px' }} />
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Discount Threshold (%) requiring admin approval
                  </label>
                  <input type="number" className="input-base w-32" value={localSettings.discountThreshold}
                    onChange={e => update('discountThreshold', +e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* Notifications */}
          {tab === 'notifications' && (
            <>
              <h2 className="font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Notifications
              </h2>
              <div className="space-y-3">
                {[
                  { label: 'SMS Receipts to Customers', subLabel: "Send receipt via Africa's Talking SMS", key: 'smsSendReceipts' as const },
                  { label: 'Low Stock SMS Alerts', subLabel: 'Notify owner when items reach reorder level', key: 'smsLowStock' as const },
                ].map(item => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{item.label}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.subLabel}</div>
                    </div>
                    <button onClick={() => update(item.key, !localSettings[item.key])}
                      className="w-10 h-5 rounded-full transition-all relative flex-shrink-0"
                      style={{ background: localSettings[item.key] ? '#2F7F79' : 'var(--border-color)' }}>
                      <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all"
                        style={{ left: localSettings[item.key] ? 'calc(100% - 18px)' : '2px' }} />
                    </button>
                  </div>
                ))}
                <div className="p-4 rounded-xl" style={{ background: 'var(--bg-surface)' }}>
                  <div className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Africa's Talking SMS</div>
                  {[
                    { label: 'API Key', key: 'africasTalkingApiKey' as const },
                    { label: 'Username', key: 'africasTalkingUsername' as const },
                  ].map(f => (
                    <div key={f.key} className="mb-2">
                      <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                      <input className="input-base font-mono text-xs" type="password"
                        value={(localSettings[f.key] as string) || ''}
                        placeholder="●●●●●●●●●●"
                        onChange={e => update(f.key, e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Save button */}
          {tab !== 'users' && (
            <div className="flex justify-end pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <button onClick={handleSave} className="btn-teal px-6 py-2.5">
                {saved ? <><Check size={15} /> Saved!</> : 'Save Settings'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
