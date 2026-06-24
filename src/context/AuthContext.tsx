import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Usuario } from '../types';
import { authService } from '../services/api';

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const userData = localStorage.getItem('userData');
    if (userId && userData) {
      try {
        setUsuario(JSON.parse(userData));
      } catch {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    const user: Usuario = data.usuario;

    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('userData', JSON.stringify(user));
    setUsuario(user);

    // Para pacientes: obtener su pacienteId buscando sus citas
    // (el backend filtra automáticamente por usuario autenticado)
    if (user.rol === 'PACIENTE') {
      try {
        const res = await fetch('http://localhost:3000/api/citas', {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(user.id),
          },
        });
        const citas = await res.json();

        // Si ya tiene citas, tomamos el pacienteId de la primera
        const pacienteId = Array.isArray(citas) && citas.length > 0
          ? citas[0].pacienteId
          : null;

        localStorage.setItem(
          'pacienteData',
          JSON.stringify({ id: pacienteId, userId: user.id })
        );
      } catch {
        localStorage.setItem(
          'pacienteData',
          JSON.stringify({ id: null, userId: user.id })
        );
      }
    }
  };

  const logout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('pacienteData');
    setUsuario(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}