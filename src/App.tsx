import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LicenseScreen from '@/screens/LicenseScreen';
import SetupScreen from '@/screens/SetupScreen';
import LoginScreen from '@/screens/LoginScreen';
import AppShell from '@/screens/AppShell';

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
  <AuthProvider>
    <AppRouter />
  </AuthProvider>
);

export default App;
