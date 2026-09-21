import React, { useEffect } from 'react';
import { useHomeOs } from './context/HomeOsContext';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import AppShell from './components/layout/AppShell';

// Core 6 Modules
import DashboardPage from './pages/modules/DashboardPage';
import FinancePage from './pages/modules/FinancePage';
import DocumentVaultPage from './pages/modules/DocumentVaultPage';
import ApplianceMaintenancePage from './pages/modules/ApplianceMaintenancePage';
import SmartAssistPage from './pages/modules/SmartAssistPage';
import SettingsAccountsPage from './pages/modules/SettingsAccountsPage';

export default function App() {
  const {
    currentRoute,
    isAuthenticated,
    navigate,
  } = useHomeOs();

  const protectedRoutes = [
    '/dashboard',
    '/finance',
    '/documents',
    '/appliances',
    '/smart-assist',
    '/settings',
  ];

  const isProtectedRoute = protectedRoutes.includes(currentRoute);

  // Redirect unauthenticated users away from protected pages
  useEffect(() => {
    if (isProtectedRoute && !isAuthenticated) {
      navigate('/login');
    }
  }, [isProtectedRoute, isAuthenticated]);

  // Public Landing Page
  if (currentRoute === '/') {
    return <LandingPage />;
  }

  // Public Login / Sign Up Page
  if (currentRoute === '/login') {
    return <AuthPage />;
  }

  // Protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return <AuthPage />;
  }

  // Core 6 Modules
  const renderModule = () => {
    switch (currentRoute) {
      case '/dashboard':
        return <DashboardPage />;

      case '/finance':
        return <FinancePage />;

      case '/documents':
        return <DocumentVaultPage />;

      case '/appliances':
        return <ApplianceMaintenancePage />;

      case '/smart-assist':
        return <SmartAssistPage />;

      case '/settings':
        return <SettingsAccountsPage />;

      default:
        return <DashboardPage />;
    }
  };

  return (
    <AppShell>
      {renderModule()}
    </AppShell>
  );
}