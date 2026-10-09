import React, { useState } from 'react';
import { Wheat, Eye, EyeOff, Loader2, AlertCircle, Delete } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { seedUsers } from '../data/seed';

type LoginTab = 'email' | 'pin';

export default function LoginPage() {
  const { login, state } = useApp();
  const [tab, setTab] = useState<LoginTab>('email');
  const [email, setEmail] = useState('admin@zawadisupermarket.co.ke');
  const [password, setPassword] = useState('admin123');
  const [pin, setPin] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const ok = login(email, password);
    if (!ok) setError('Invalid email or password. Please try again.');
    setLoading(false);
  };

  const handlePinPress = (digit: string) => {
    if (pin.length >= 6) return;
    const newPin = pin + digit;
    setPin(newPin);
    setError('');
    if (newPin.length >= 4) {
      setTimeout(() => {
        const ok = login(newPin);
        if (!ok && newPin.length >= 4) {
          setError('Invalid PIN. Please try again.');
          setPin('');
        }
      }, 200);
    }
  };

  const demoUsers = [
    { label: 'Admin', email: 'admin@zawadisupermarket.co.ke', pw: 'admin123', pin: '0000' },
    { label: 'Manager', email: 'manager@zawadisupermarket.co.ke', pw: 'demo123', pin: '1234' },
    { label: 'Cashier', email: 'cashier@zawadisupermarket.co.ke', pw: 'demo123', pin: '5678' },
  ];

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12 relative overflow-hidden"
        style={{ background: '#1F2A44' }}>
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #2F7F79 0%, transparent 50%), radial-gradient(circle at 80% 20%, #D9C7A3 0%, transparent 40%)' }} />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(47,127,121,0.3)', border: '1px solid rgba(47,127,121,0.5)' }}>
              <Wheat size={26} color="#5CC4BC" />
            </div>
            <div>
              <div className="text-xl font-bold text-white" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Zawadi POS</div>
              <div className="text-xs" style={{ color: '#64748B' }}>Retail Management System</div>
            </div>
          </div>
        </div>

        <div className="relative space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Manage your retail<br />business with ease
            </h2>
            <p style={{ color: '#94A3B8' }} className="text-sm leading-relaxed">
              Complete POS and inventory management for Kenyan businesses. M-Pesa integrated, KRA eTIMS ready, offline-capable.
            </p>
          </div>
          <div className="space-y-3">
            {['KRA eTIMS compliant receipts', 'M-Pesa STK Push & Paybill', 'Works offline — syncs automatically', 'Role-based stock control'].map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(47,127,121,0.3)' }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: '#5CC4BC' }} />
                </div>
                <span className="text-sm" style={{ color: '#94A3B8' }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="text-xs" style={{ color: '#475569' }}>
            © 2024 Zawadi Retail Ltd • Nairobi, Kenya
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: '#1F2A44' }}>
              <Wheat size={22} color="#5CC4BC" />
            </div>
            <div className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Zawadi POS
            </div>
          </div>

          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Welcome back
          </h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Sign in to your account to continue
          </p>

          {/* Tab switcher */}
          <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--bg-surface)' }}>
            {(['email', 'pin'] as LoginTab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setPin(''); }}
                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                style={{
                  background: tab === t ? 'var(--bg-card)' : 'transparent',
                  color: tab === t ? 'var(--text-primary)' : 'var(--text-muted)',
                  boxShadow: tab === t ? 'var(--shadow-sm)' : 'none',
                }}>
                {t === 'email' ? 'Email Login' : 'PIN Login'}
              </button>
            ))}
          </div>

          {/* Email login */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email Address</label>
                <input className="input-base" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@business.co.ke" required />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Password</label>
                <div className="relative">
                  <input className="input-base pr-10" type={showPw ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password" required />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(181,87,75,0.1)', color: '#B5574B' }}>
                  <AlertCircle size={14} />{error}
                </div>
              )}
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5">
                {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* PIN login */}
          {tab === 'pin' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-xs font-semibold mb-3" style={{ color: 'var(--text-secondary)' }}>Enter your 4–6 digit PIN</div>
                <div className="flex justify-center gap-2 mb-4">
                  {[0,1,2,3,4,5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                      style={{
                        background: i < pin.length ? '#1F2A44' : 'var(--bg-surface)',
                        color: 'white',
                        border: '1px solid var(--border-color)',
                      }}>
                      {i < pin.length ? '●' : ''}
                    </div>
                  ))}
                </div>
              </div>
              {/* Numpad */}
              <div className="grid grid-cols-3 gap-2">
                {['1','2','3','4','5','6','7','8','9','','0','⌫'].map(d => (
                  <button key={d} disabled={d === ''}
                    onClick={() => d === '⌫' ? setPin(p => p.slice(0,-1)) : handlePinPress(d)}
                    className="h-12 rounded-xl font-semibold text-base transition-all active:scale-95"
                    style={{
                      background: d === '⌫' ? 'rgba(181,87,75,0.1)' : 'var(--bg-surface)',
                      color: d === '⌫' ? '#B5574B' : 'var(--text-primary)',
                      border: '1px solid var(--border-color)',
                      opacity: d === '' ? 0 : 1,
                    }}>
                    {d}
                  </button>
                ))}
              </div>
              {error && (
                <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" style={{ background: 'rgba(181,87,75,0.1)', color: '#B5574B' }}>
                  <AlertCircle size={14} />{error}
                </div>
              )}
            </div>
          )}

          {/* Demo access */}
          <div className="mt-6 p-4 rounded-xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
            <div className="text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
              🎮 Demo Access
            </div>
            <div className="space-y-1">
              {demoUsers.map(u => (
                <button key={u.label}
                  onClick={() => {
                    if (tab === 'pin') { setPin(''); login(u.pin); }
                    else { setEmail(u.email); setPassword(u.pw); }
                  }}
                  className="flex items-center justify-between w-full text-xs px-2 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium">{u.label}</span>
                  <span style={{ color: 'var(--text-muted)' }}>PIN: {u.pin} | {u.email.split('@')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
