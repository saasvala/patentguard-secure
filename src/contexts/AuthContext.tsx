import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { type User, type Role } from '@/types';
import * as store from '@/lib/store';

type AppState = 'license' | 'setup' | 'login' | 'app';

interface AuthContextType {
  appState: AppState;
  currentUser: User | null;
  currentRole: Role | undefined;
  activateLicense: (key: string) => boolean;
  setupSuperAdmin: (username: string, password: string) => void;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  refreshUsers: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>(() => {
    const license = store.getLicense();
    if (!license) return 'license';
    if (store.isFirstRun()) return 'setup';
    const user = store.getCurrentUser();
    return user ? 'app' : 'login';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => store.getCurrentUser());
  const [, setRefresh] = useState(0);

  const currentRole = currentUser ? store.getUserRole(currentUser) : undefined;

  const activateLicense = useCallback((key: string) => {
    if (!store.validateLicenseKey(key)) return false;
    store.activateLicense(key);
    setAppState('setup');
    return true;
  }, []);

  const setupSuperAdmin = useCallback((username: string, password: string) => {
    const user = store.createUser({
      role_id: 'r1',
      username,
      password,
      status: 'active',
    });
    store.setFirstRunComplete();
    store.setCurrentUser(user);
    setCurrentUser(user);
    setAppState('app');
  }, []);

  const login = useCallback((username: string, password: string) => {
    const user = store.login(username, password);
    if (user) {
      setCurrentUser(user);
      setAppState('app');
      return true;
    }
    return false;
  }, []);

  const logoutFn = useCallback(() => {
    store.logout();
    setCurrentUser(null);
    setAppState('login');
  }, []);

  const refreshUsers = useCallback(() => {
    setRefresh(v => v + 1);
  }, []);

  return (
    <AuthContext.Provider value={{
      appState,
      currentUser,
      currentRole,
      activateLicense,
      setupSuperAdmin,
      login,
      logout: logoutFn,
      refreshUsers,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
