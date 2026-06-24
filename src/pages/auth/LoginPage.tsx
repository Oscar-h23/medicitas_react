import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Rol } from '../../types';

const ROLE_REDIRECT: Record<Rol, string> = {
  ADMIN: '/dashboard/admin',
  DOCTOR: '/dashboard/doctor',
  RECEPCIONISTA: '/dashboard/recepcionista',
  PACIENTE: '/dashboard/paciente',
};

// Credenciales rápidas para testing
const TEST_USERS = [
  { label: 'Admin', email: 'admin@medicitas.com', password: '123456', color: '#e53e3e' },
  { label: 'Recepcionista', email: 'recepcion@medicitas.com', password: '123456', color: '#d69e2e' },
  { label: 'Doctor', email: 'dr.juan.perez@medicitas.com', password: '123456', color: '#38a169' },
  { label: 'Paciente', email: 'oscar.herrera@test.com', password: '123456', color: '#3182ce' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const stored = localStorage.getItem('userData');
      if (stored) {
        const user = JSON.parse(stored);
        navigate(ROLE_REDIRECT[user.rol as Rol] || '/dashboard');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje || 'Error al iniciar sesión';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError('');
  };

  return (
    <div className="login-page">
      <div className="login-brand">
        <div className="brand-icon">
          <svg viewBox="0 0 40 40" fill="none">
            <rect width="40" height="40" rx="10" fill="#0ea5e9" />
            <path d="M20 9v22M9 20h22" stroke="white" strokeWidth="3.5" strokeLinecap="round" />
          </svg>
        </div>
        <h1 className="brand-name">MediCitas</h1>
        <p className="brand-sub">Sistema de gestión clínica</p>
      </div>

      <div className="login-card">
        <h2 className="login-title">Iniciar sesión</h2>
        <p className="login-hint">Accede con tus credenciales</p>

        {error && (
          <div className="alert-error">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@medicitas.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        <div className="divider">
          <span>Acceso rápido (pruebas)</span>
        </div>

        <div className="quick-access">
          {TEST_USERS.map((u) => (
            <button
              key={u.email}
              className="quick-btn"
              style={{ '--role-color': u.color } as React.CSSProperties}
              onClick={() => fillCredentials(u.email, u.password)}
              type="button"
            >
              {u.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
