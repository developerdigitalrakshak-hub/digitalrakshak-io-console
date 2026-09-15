import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';

import { AppShell } from '@/components/common';
import { LandingPage } from '@/pages/LandingPage';
import { AuthPage } from '@/pages/AuthPage';
import { OverviewPage } from '@/pages/OverviewPage';
import { KeysPage } from '@/pages/KeysPage';
import { ServicesPage } from '@/pages/ServicesPage';
import { WalletPage } from '@/pages/WalletPage';
import { UsagePage } from '@/pages/UsagePage';
import { RequestsPage } from '@/pages/RequestsPage';
import { WebhooksPage } from '@/pages/WebhooksPage';
import { DocsPage } from '@/pages/DocsPage';
import { AdminPage } from '@/pages/AdminPage';
import NotFound from '@/pages/not-found';
import './index.css';

const queryClient = new QueryClient();

function DashboardRoute({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}

function Router() {
  const [location, setLocation] = useLocation();
  // Check auth state (localStorage or token check)
  const isAuthenticated = Boolean(localStorage.getItem('auth_token') || localStorage.getItem('user_session'));

  return (
    <ErrorBoundary resetKey={location}>
      <Switch>
        <Route path="/">
          {isAuthenticated ? <DashboardRoute><OverviewPage /></DashboardRoute> : <AuthPage />}
        </Route>
        <Route path="/login" component={() => <AuthPage />} />
        <Route path="/register" component={() => <AuthPage register />} />
        <Route path="/dashboard" component={() => <DashboardRoute><OverviewPage /></DashboardRoute>} />
        <Route path="/dashboard/keys" component={() => <DashboardRoute><KeysPage /></DashboardRoute>} />
        <Route path="/dashboard/services/:slug" component={() => <DashboardRoute><ServicesPage /></DashboardRoute>} />
        <Route path="/dashboard/services" component={() => <DashboardRoute><ServicesPage /></DashboardRoute>} />
        <Route path="/dashboard/wallet" component={() => <DashboardRoute><WalletPage /></DashboardRoute>} />
        <Route path="/dashboard/usage" component={() => <DashboardRoute><UsagePage /></DashboardRoute>} />
        <Route path="/dashboard/requests" component={() => <DashboardRoute><RequestsPage /></DashboardRoute>} />
        <Route path="/dashboard/webhooks" component={() => <DashboardRoute><WebhooksPage /></DashboardRoute>} />
        <Route path="/dashboard/docs" component={() => <DashboardRoute><DocsPage /></DashboardRoute>} />
        <Route path="/admin" component={AdminPage} />
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
        <Router />
      </WouterRouter>
      <Toaster />
    </QueryClientProvider>
  );
}