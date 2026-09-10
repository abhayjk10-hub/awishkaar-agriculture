'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type TokenStatus = 'waiting' | 'approaching' | 'now' | null;

export interface TokenData {
  tokenNumber: string;
  mandiName: string;
  currentToken: number;
  totalAhead: number;
  status: TokenStatus;
  estimatedWaitMinutes: number;
  slotTime: string;
}

interface TokenContextType {
  token: TokenData | null;
  setToken: (data: TokenData | null) => void;
  clearToken: () => void;
}

const TokenContext = createContext<TokenContextType>({
  token: null,
  setToken: () => {},
  clearToken: () => {},
});

const TOKEN_STORAGE_KEY = 'kisan_mitra_token';

export function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<TokenData | null>(null);

  // Restore token from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TokenData;
        setTokenState(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Simulate token queue movement (poll every 30s)
  useEffect(() => {
    if (!token) return;
    const interval = setInterval(() => {
      setTokenState((current) => {
        if (!current) return null;
        const newAhead = Math.max(0, current.totalAhead - Math.floor(Math.random() * 2));
        const newWait = Math.max(0, newAhead * 4);
        const newStatus: TokenStatus =
          newAhead === 0 ? 'now' : newAhead <= 3 ? 'approaching' : 'waiting';
        const updated: TokenData = {
          ...current,
          totalAhead: newAhead,
          estimatedWaitMinutes: newWait,
          status: newStatus,
        };
        try { localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(updated)); } catch { /* ignore */ }
        return updated;
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const setToken = useCallback((data: TokenData | null) => {
    setTokenState(data);
    try {
      if (data) {
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(data));
      } else {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
    } catch { /* ignore */ }
  }, []);

  const clearToken = useCallback(() => {
    setTokenState(null);
    try { localStorage.removeItem(TOKEN_STORAGE_KEY); } catch { /* ignore */ }
  }, []);

  return (
    <TokenContext.Provider value={{ token, setToken, clearToken }}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  return useContext(TokenContext);
}
