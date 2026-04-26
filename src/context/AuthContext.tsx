import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface User {
  email: string;
  name: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_USERS: { email: string; password: string; name: string }[] = [
  { email: 'demo@example.com', password: 'demo1234', name: 'Demo User' },
];

const STORAGE_KEY = 'auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((email: string, password: string): boolean => {
    const match = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!match) return false;
    const loggedIn: User = { email: match.email, name: match.name };
    setUser(loggedIn);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedIn));
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
