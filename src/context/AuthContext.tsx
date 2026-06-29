// src/context/AuthContext.tsx
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
        localStorage.removeItem('userId');
        localStorage.removeItem('userData');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    const user: Usuario = data.usuario;

    // Obtener datos existentes del perfil (si los hay)
    const cacheKey = `perfil_${user.id}`;
    const cachedPerfil = localStorage.getItem(cacheKey);
    let perfilExistente = {};
    
    if (cachedPerfil) {
      try {
        perfilExistente = JSON.parse(cachedPerfil);
        console.log('📦 Datos de perfil existentes encontrados:', perfilExistente);
      } catch (e) {
        console.warn('Error al parsear perfil existente');
      }
    }

    // IMPORTANTE: Fusionar datos del backend con datos de caché
    const userDataFusionado = {
      id: user.id,
      email: user.email,
      rol: user.rol,
      // Datos del backend (prioridad)
      nombres: user.nombres || '',
      apellidos: user.apellidos || '',
      // Si hay caché, mantener esos datos también
      ...perfilExistente,
    };

    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('userData', JSON.stringify(userDataFusionado));
    setUsuario(userDataFusionado as Usuario);

    // Si no había caché, crear una inicial
    if (!cachedPerfil) {
      const nuevoPerfil = {
        id: user.id,
        email: user.email,
        rol: user.rol,
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        telefono: '',
        fechaNacimiento: '',
        dni: '',
        sexo: '',
        direccion: '',
        distrito: '',
        grupoSanguineo: '',
        alergias: '',
        contactoEmergencia: '',
        telefonoEmergencia: '',
      };
      localStorage.setItem(cacheKey, JSON.stringify(nuevoPerfil));
    }

    if (user.rol === 'PACIENTE') {
      try {
        const res = await fetch('http://localhost:3000/api/citas', {
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': String(user.id),
          },
        });
        const citas = await res.json();

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
    // SOLO BORRAR DATOS DE SESIÓN
    localStorage.removeItem('userId');
    localStorage.removeItem('userData');
    localStorage.removeItem('pacienteData');
    // NO BORRAMOS perfil_* 
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