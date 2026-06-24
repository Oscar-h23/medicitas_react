import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Rol } from '../types';

const ROL_LABELS: Record<Rol, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Doctor',
  RECEPCIONISTA: 'Recepcionista',
  PACIENTE: 'Paciente',
};

const ROL_COLORS: Record<Rol, string> = {
  ADMIN: '#e53e3e',
  DOCTOR: '#38a169',
  RECEPCIONISTA: '#d69e2e',
  PACIENTE: '#3182ce',
};

interface Props {
  children: ReactNode;
  title: string;
}

export default function DashboardLayout({ children, title }: Props) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!usuario) return null;

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg viewBox="0 0 32 32" fill="none" width="28" height="28">
            <rect width="32" height="32" rx="8" fill="#0ea5e9" />
            <path d="M16 7v18M7 16h18" stroke="white" strokeWidth="3" strokeLinecap="round" />
          </svg>
          <span>MediCitas</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menú</div>
          <a href="#" className="nav-item active">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Dashboard
          </a>
          {(usuario.rol === 'ADMIN' || usuario.rol === 'RECEPCIONISTA') && (
            <a href="#" className="nav-item">
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Pacientes
            </a>
          )}
          {(usuario.rol === 'ADMIN' || usuario.rol === 'RECEPCIONISTA' || usuario.rol === 'DOCTOR') && (
            <a href="#" className="nav-item">
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Citas
            </a>
          )}
          {usuario.rol === 'ADMIN' && (
            <a href="#" className="nav-item">
              <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
              Configuración
            </a>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div
              className="user-avatar"
              style={{ background: ROL_COLORS[usuario.rol] }}
            >
              {usuario.nombres[0]}{usuario.apellidos[0]}
            </div>
            <div className="user-info">
              <span className="user-name">{usuario.nombres} {usuario.apellidos}</span>
              <span className="user-role">{ROL_LABELS[usuario.rol]}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        <header className="dash-header">
          <h1 className="dash-title">{title}</h1>
          <div
            className="role-badge"
            style={{ background: ROL_COLORS[usuario.rol] + '22', color: ROL_COLORS[usuario.rol] }}
          >
            {ROL_LABELS[usuario.rol]}
          </div>
        </header>
        <div className="dash-content">{children}</div>
      </main>
    </div>
  );
}
