import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/api';
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
  const location = useLocation();
  const redirect = new URLSearchParams(location.search).get('redirect');

  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [sexo, setSexo] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    if (isRegistering) {
      // Validaciones de registro
      if (!nombres || !apellidos || !email || !password || !numeroDocumento) {
        setError('Todos los campos obligatorios deben estar completos.');
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        setLoading(false);
        return;
      }

      try {
        await authService.register({
          email,
          password,
          nombres,
          apellidos,
          numeroDocumento,
          telefono: telefono || undefined,
          fechaNacimiento: fechaNacimiento || undefined,
          sexo: sexo || undefined,
        });
        setSuccessMessage('✅ Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
        // Limpiar campos y cambiar a login
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setNombres('');
        setApellidos('');
        setNumeroDocumento('');
        setTelefono('');
        setFechaNacimiento('');
        setSexo('');
        setIsRegistering(false);
        setError('');
      } catch (err: any) {
        const msg = err?.response?.data?.mensaje || 'Error al registrar usuario';
        setError(msg);
      } finally {
        setLoading(false);
      }
    } else {
      // Login
      try {
        await login(email, password);
        const stored = localStorage.getItem('userData');
        if (stored) {
          const user = JSON.parse(stored);
          // Si venimos de "Agendar Cita", redirigir al dashboard del paciente
          if (redirect === 'agendar') {
            navigate('/dashboard/paciente');
          } else {
            navigate(ROLE_REDIRECT[user.rol as Rol] || '/dashboard');
          }
        }
      } catch (err: any) {
        const msg = err?.response?.data?.mensaje || 'Error al iniciar sesión';
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
  };

  const fillCredentials = (testEmail: string, testPassword: string) => {
    setEmail(testEmail);
    setPassword(testPassword);
    setError('');
    setSuccessMessage('');
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setSuccessMessage('');
    // Limpiar campos al cambiar
    setPassword('');
    setConfirmPassword('');
    setNombres('');
    setApellidos('');
    setNumeroDocumento('');
    setTelefono('');
    setFechaNacimiento('');
    setSexo('');
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
        <h2 className="login-title">{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h2>
        <p className="login-hint">
          {isRegistering
            ? 'Regístrate como paciente para acceder a todos los servicios'
            : 'Accede con tus credenciales'}
        </p>

        {error && (
          <div className="alert-error">
            <svg viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {successMessage && (
          <div className="alert-success" style={{ background: '#d4edda', color: '#155724', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {isRegistering && (
            <>
              <div className="field">
                <label htmlFor="nombres">Nombres *</label>
                <input
                  id="nombres"
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ej: Juan Carlos"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="apellidos">Apellidos *</label>
                <input
                  id="apellidos"
                  type="text"
                  value={apellidos}
                  onChange={(e) => setApellidos(e.target.value)}
                  placeholder="Ej: Pérez Gómez"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="numeroDocumento">N° Documento (DNI) *</label>
                <input
                  id="numeroDocumento"
                  type="text"
                  value={numeroDocumento}
                  onChange={(e) => setNumeroDocumento(e.target.value)}
                  placeholder="Ej: 12345678"
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej: 987654321"
                />
              </div>
              <div className="field">
                <label htmlFor="fechaNacimiento">Fecha de nacimiento</label>
                <input
                  id="fechaNacimiento"
                  type="date"
                  value={fechaNacimiento}
                  onChange={(e) => setFechaNacimiento(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="sexo">Sexo</label>
                <select
                  id="sexo"
                  value={sexo}
                  onChange={(e) => setSexo(e.target.value)}
                >
                  <option value="">Seleccionar</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                </select>
              </div>
            </>
          )}

          <div className="field">
            <label htmlFor="email">Correo electrónico *</label>
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
            <label htmlFor="password">Contraseña *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
          </div>

          {isRegistering && (
            <div className="field">
              <label htmlFor="confirmPassword">Confirmar contraseña *</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? (
              <span className="btn-spinner" />
            ) : (
              isRegistering ? 'Registrarse' : 'Entrar'
            )}
          </button>
        </form>

        <div className="toggle-link" style={{ textAlign: 'center', margin: '1rem 0' }}>
          {isRegistering ? (
            <p>
              ¿Ya tienes cuenta?{' '}
              <button type="button" className="toggle-btn" onClick={toggleMode} style={{ background: 'none', border: 'none', color: '#0ea5e9', textDecoration: 'underline', cursor: 'pointer' }}>
                Inicia sesión aquí
              </button>
            </p>
          ) : (
            <p>
              ¿No tienes cuenta?{' '}
              <button type="button" className="toggle-btn" onClick={toggleMode} style={{ background: 'none', border: 'none', color: '#0ea5e9', textDecoration: 'underline', cursor: 'pointer' }}>
                Regístrate aquí
              </button>
            </p>
          )}
        </div>

        {!isRegistering && (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}