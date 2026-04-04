import React from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LicenseScreen from '@/screens/LicenseScreen';
import SetupScreen from '@/screens/SetupScreen';
import LoginScreen from '@/screens/LoginScreen';
import AppShell from '@/screens/AppShell';

// Global Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-8">
          <div className="max-w-md text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-destructive/10 flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">System Error</h1>
            <p className="text-sm text-muted-foreground">
              An unexpected error occurred. Your data is safe.
            </p>
            <pre className="text-xs text-destructive bg-destructive/5 p-3 rounded-lg overflow-auto max-h-32 text-left">
              {this.state.error?.message}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-6 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium"
            >
              Reload Application
            </button>
            <p className="text-[9px] text-muted-foreground/50">
              Powered by <span className="font-semibold">Software Vala™</span>
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppRouter() {
  const { appState } = useAuth();

  switch (appState) {
    case 'license': return <LicenseScreen />;
    case 'setup': return <SetupScreen />;
    case 'login': return <LoginScreen />;
    case 'app': return <AppShell />;
  }
}

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </ErrorBoundary>
);

export default App;
