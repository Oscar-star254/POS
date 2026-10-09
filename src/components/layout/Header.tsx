import React, { useState, useRef, useEffect } from 'react';
import {
  Bell, Moon, Sun, LogOut, Globe, Wifi, WifiOff, RefreshCw,
  ChevronDown, User, Settings, Lock
} from 'lucide-react';
import { useApp } from '../../store/AppContext';
import { timeAgo, clsx } from '../../lib/utils';
import InstallButton from '../InstallButton';

const pageLabels: Record<string, { en: string; sw: string }> = {
  dashboard: { en: 'Dashboard', sw: 'Dashibodi' },
  pos: { en: 'Point of Sale', sw: 'Duka la Mauzo' },
  inventory: { en: 'Inventory', sw: 'Hesabu ya Stoo' },
  customers: { en: 'Customers', sw: 'Wateja' },
  expenses: { en: 'Expenses', sw: 'Matumizi' },
  reports: { en: 'Reports', sw: 'Ripoti' },
  audit: { en: 'Audit Trail', sw: 'Rekodi ya Hatua' },
  settings: { en: 'Settings', sw: 'Mipangilio' },
};

export default function Header() {
  const { state, dispatch, logout, navigate, unreadCount } = useApp();
  const { currentUser, language, darkMode, onlineStatus, currentPage, notifications } = state;
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const title = pageLabels[currentPage];
  const pageTitle = language === 'sw' ? title?.sw : title?.en;

  const unread = notifications.filter(n => !n.read).slice(0, 8);

  const onlineColor = onlineStatus === 'online' ? '#6B8F71' : onlineStatus === 'syncing' ? '#C9A227' : '#B5574B';
  const OnlineIcon = onlineStatus === 'online' ? Wifi : onlineStatus === 'syncing' ? RefreshCw : WifiOff;

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b"
      style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', minHeight: 64 }}>
      {/* Page title */}
      <div>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          {pageTitle}
        </h1>
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {new Date().toLocaleDateString('en-KE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric', timeZone: 'Africa/Nairobi' })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <InstallButton compact />

        {/* Online status */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium"
          style={{ background: 'var(--bg-surface)', color: onlineColor }}>
          <OnlineIcon size={13} className={onlineStatus === 'syncing' ? 'animate-spin' : ''} />
          <span className="hidden sm:inline capitalize">{onlineStatus}</span>
        </div>

        {/* Language toggle */}
        <button
          onClick={() => dispatch({ type: 'SET_LANGUAGE', lang: language === 'en' ? 'sw' : 'en' })}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
          title="Toggle language"
        >
          <Globe size={13} />
          {language === 'en' ? 'SW' : 'EN'}
        </button>

        {/* Dark mode */}
        <button
          onClick={() => dispatch({ type: 'TOGGLE_DARK' })}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-105"
          style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
        >
          {darkMode ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="w-8 h-8 rounded-lg flex items-center justify-center relative transition-all hover:scale-105"
            style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}
          >
            <Bell size={15} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ background: '#B5574B' }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-10 w-80 rounded-xl shadow-xl z-50 overflow-hidden"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={() => dispatch({ type: 'MARK_ALL_READ' })} className="text-xs" style={{ color: '#2F7F79' }}>
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.slice(0, 8).map(n => (
                  <div key={n.id}
                    onClick={() => dispatch({ type: 'MARK_NOTIFICATION_READ', id: n.id })}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:opacity-80"
                    style={{ background: n.read ? 'transparent' : 'rgba(47,127,121,0.04)', borderBottom: '1px solid var(--border-color)' }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                      style={{ background: n.read ? 'var(--border-color)' : '#2F7F79' }} />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{n.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{n.message}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{timeAgo(n.createdAt)}</div>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="px-4 py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
                    No notifications
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* User menu */}
        {currentUser && (
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserOpen(!userOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg transition-all"
              style={{ background: 'var(--bg-surface)' }}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: 'rgba(47,127,121,0.2)', color: '#2F7F79' }}>
                {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{currentUser.name.split(' ')[0]}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentUser.role}</div>
              </div>
              <ChevronDown size={13} style={{ color: 'var(--text-muted)' }} />
            </button>

            {userOpen && (
              <div className="absolute right-0 top-11 w-48 rounded-xl shadow-xl z-50 overflow-hidden py-1"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <div className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{currentUser.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{currentUser.email}</div>
                </div>
                {currentUser.role === 'ADMIN' && (
                  <button onClick={() => { navigate('settings'); setUserOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors hover:opacity-80"
                    style={{ color: 'var(--text-secondary)' }}>
                    <Settings size={14} /> Settings
                  </button>
                )}
                <button onClick={() => { logout(); setUserOpen(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors hover:opacity-80"
                  style={{ color: '#B5574B' }}>
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
