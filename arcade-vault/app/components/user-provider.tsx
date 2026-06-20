"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SavedScore, User } from "@/app/data";

interface UserContextValue {
  user: User | null;
  scores: SavedScore[];
  login: (user: User) => void;
  signOut: () => void;
  saveScore: (entry: Omit<SavedScore, "at">) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage deshabilitado (modo privado): seguimos sin persistir.
  }
}

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Estado neutro en el render del servidor; se hidrata tras montar.
  const [user, setUser] = useState<User | null>(null);
  const [scores, setScores] = useState<SavedScore[]>([]);
  const hydrated = useRef(false);

  useEffect(() => {
    // Hidratación post-montaje: leemos localStorage tras montar (no en el
    // render del servidor) para evitar desajustes de hidratación, tal como
    // exige el spec. La regla set-state-in-effect no aplica a este caso de
    // sincronización con un sistema externo en el primer montaje.
    /* eslint-disable react-hooks/set-state-in-effect */
    setUser(read<User | null>("av_user", null));
    setScores(read<SavedScore[]>("av_scores", []));
    /* eslint-enable react-hooks/set-state-in-effect */
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (hydrated.current) write("av_user", user);
  }, [user]);

  useEffect(() => {
    if (hydrated.current) write("av_scores", scores);
  }, [scores]);

  const login = useCallback((u: User) => setUser(u), []);
  const signOut = useCallback(() => setUser(null), []);
  const saveScore = useCallback((entry: Omit<SavedScore, "at">) => {
    setScores((prev) => [...prev, { ...entry, at: Date.now() }]);
  }, []);

  return (
    <UserContext.Provider value={{ user, scores, login, signOut, saveScore }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser debe usarse dentro de <UserProvider>");
  return ctx;
}
