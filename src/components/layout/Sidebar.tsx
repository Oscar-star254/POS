import React from 'react';
import {
  LayoutDashboard, ShoppingCart, Package, Users, FileBarChart2,
  Settings, ClipboardList, Shield, Building2, Receipt, ChevronLeft, ChevronRight,
  Wheat, DollarSign
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { clsx } from '../../lib/utils';

const navItems = [
  { id: 'dashboard', labelEn: 'Dashboard', labelSw: 'Dashibodi', icon: LayoutDashboard, roles: ['ADMIN', 'MANAGER', 'CASHIER', 'ACCOUNTANT'] },
  { id: 'pos', labelEn: 'Point of Sale', labelSw: 'Duka la Mauzo', icon: ShoppingCart, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { id: 'inventory', labelEn: 'Inventory', labelSw: 'Hesabu ya Stoo', icon: Package, roles: ['ADMIN', 'MANAGER'] },
  { id: 'customers', labelEn: 'Customers', labelSw: 'Wateja', icon: Users, roles: ['ADMIN', 'MANAGER', 'CASHIER'] },
  { id: 'expenses', labelEn: 'Expenses', labelSw: 'Matumizi', icon: DollarSign, roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { id: 'reports', labelEn: 'Reports', labelSw: 'Ripoti', icon: FileBarChart2, roles: ['ADMIN', 'MANAGER', 'ACCOUNTANT'] },
  { id: 'audit', labelEn: 'Audit Trail', labelSw: 'Rekodi ya Hatua', icon: Shield, roles: ['ADMIN'] },
  { id: 'settings', labelEn: 'Settings', labelSw: 'Mipangilio', icon: Settings, roles: ['ADMIN'] },
];

export default function Sidebar() {
  const { state, navigate, dispatch } = useApp();
  const { currentUser, currentPage, language, sidebarOpen, darkMode } = state;

  const label = (en: string, sw: string) => language === 'sw' ? sw : en;

  const allowedItems = navItems.filter(item =>
    currentUser && item.roles.includes(currentUser.role)
  );

  return (
    <aside
      className={clsx(
        'flex flex-col h-full transition-all duration-300 relative',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
      style={{ background: '#1F2A44', flexShrink: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10 min-h-[72px]">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(47,127,121,0.3)', border: '1px solid rgba(47,127,121,0.5)' }}>
          <Wheat size={20} color="#5CC4BC" />
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <div className="font-bold text-white text-sm leading-tight" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Zawadi
            </div>
            <div className="text-xs" style={{ color: '#64748B' }}>Point of Sale</div>
          </div>
        )}
      </div>

      {/* Branch indicator */}
      {sidebarOpen && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg flex items-center gap-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Building2 size={13} color="#64748B" />
          <span className="text-xs" style={{ color: '#94A3B8' }}>Zawadi CBD</span>
          <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#6B8F71]" />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {allowedItems.map(item => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              title={!sidebarOpen ? label(item.labelEn, item.labelSw) : undefined}
              className={clsx('sidebar-item w-full text-left', isActive && 'active')}
              style={isActive ? {} : {}}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && (
                <span className="truncate">{label(item.labelEn, item.labelSw)}</span>
              )}
              {!sidebarOpen && isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r bg-[#5CC4BC]" />
              )}
            </button>
          );
        })}
      </nav>

      {/* User info */}
      {currentUser && sidebarOpen && (
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: 'rgba(47,127,121,0.3)', color: '#5CC4BC' }}>
              {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-xs" style={{ color: '#64748B' }}>{currentUser.role}</div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer z-10 transition-all hover:scale-110"
        style={{ background: '#2A3A5C', border: '1px solid rgba(255,255,255,0.15)', color: '#94A3B8' }}
      >
        {sidebarOpen ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
      </button>
    </aside>
  );
}
