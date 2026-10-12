'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authLogin, getMe, User } from './api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: async () => {
    throw new Error('AuthProvider missing');
  },
  logout: () => {},
  refresh: async () => {},
});

function readStored(): { token: string | null; user: User | null } {
  try {
    const token = localStorage.getItem('zerdeli_token');
    const raw = localStorage.getItem('zerdeli_user');
    return { token, user: raw ? (JSON.parse(raw) as User) : null };
  } catch {
    return { token: null, user: null };
  }
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const persist = useCallback((t: string | null, u: User | null) => {
    setToken(t);
    setUser(u);
    try {
      if (t) localStorage.setItem('zerdeli_token', t);
      else localStorage.removeItem('zerdeli_token');
      if (u) localStorage.setItem('zerdeli_user', JSON.stringify(u));
      else localStorage.removeItem('zerdeli_user');
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(() => persist(null, null), [persist]);

  const refresh = useCallback(async () => {
    try {
      const me = await getMe();
      setUser((current) => {
        // Don't overwrite an existing logged-in user with a different user
        if (current && current.id !== me.id) return current;
        try {
          localStorage.setItem('zerdeli_user', JSON.stringify(me));
        } catch {
          /* ignore */
        }
        return me;
      });
    } catch {
      persist(null, null);
    }
  }, [persist]);

  useEffect(() => {
    const { token: t, user: u } = readStored();
    if (t) {
      setToken(t);
      setUser(u);
      // Validate/refresh in the background.
      getMe()
        .then((me) => {
          setUser((current) => {
            // If there is already a user stored and it refers to a different id,
            // don't replace it as a result of a background validation call.
            if (current && current.id !== me.id) return current;
            try {
              localStorage.setItem('zerdeli_user', JSON.stringify(me));
            } catch {
              /* ignore */
            }
            return me;
          });
        })
        .catch(() => persist(null, null))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authLogin(email, password);
      persist(res.access_token, res.user);
      return res.user;
    },
    [persist],
  );

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
