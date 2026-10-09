import React from 'react';
import { AppProvider, useApp } from './store/AppContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import InventoryPage from './pages/InventoryPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import AuditPage from './pages/AuditPage';
import SettingsPage from './pages/SettingsPage';
import ExpensesPage from './pages/ExpensesPage';

function AppRoutes() {
  const { state } = useApp();
  const { isAuthenticated, currentPage, currentUser } = state;

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Permission guard for pages
  const requireRole = (page: string): boolean => {
    if (!currentUser) return false;
    const role = currentUser.role;
    const restrictions: Record<string, string[]> = {
      inventory: ['ADMIN', 'MANAGER'],
      expenses: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
      reports: ['ADMIN', 'MANAGER', 'ACCOUNTANT'],
      audit: ['ADMIN'],
      settings: ['ADMIN'],
    };
    if (restrictions[page] && !restrictions[page].includes(role)) return false;
    return true;
  };

  const renderPage = () => {
    if (!requireRole(currentPage)) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Access Denied
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Your role ({currentUser?.role}) does not have access to this section.
          </p>
        </div>
      );
    }

    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'pos': return <POSPage />;
      case 'inventory': return <InventoryPage />;
      case 'customers': return <CustomersPage />;
      case 'expenses': return <ExpensesPage />;
      case 'reports': return <ReportsPage />;
      case 'audit': return <AuditPage />;
      case 'settings': return <SettingsPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
}
