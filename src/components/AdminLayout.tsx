// src/components/AdminLayout.tsx
import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: '/dashboard/admin', icon: 'bi bi-speedometer2', label: 'Dashboard' },
    { path: '/dashboard/admin/usuarios', icon: 'bi bi-people', label: 'Usuarios' },
    { path: '/dashboard/admin/doctores', icon: 'bi bi-person-badge', label: 'Doctores' },
    { path: '/dashboard/admin/pacientes', icon: 'bi bi-person-heart', label: 'Pacientes' },
    { path: '/dashboard/admin/auditoria', icon: 'bi bi-list-ul', label: 'Auditoría' },
    { path: '/dashboard/admin/mi-perfil', icon: 'bi bi-person', label: 'Mi Perfil' },
  ];

  const getPageTitle = () => {
    const current = menuItems.find((item) => item.path === location.pathname);
    return current ? current.label : 'Panel Administrador';
  };

  const cerrarSesion = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
    logout();
    navigate('/login');
  };

  const userName = usuario ? `${usuario.nombres} ${usuario.apellidos}` : 'Administrador';

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* SIDEBAR */}
      <aside
        className="bg-dark text-white d-flex flex-column position-sticky top-0"
        style={{
          width: sidebarOpen ? '280px' : '85px',
          minHeight: '100vh',
          transition: 'width 0.3s ease',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <div className="p-3 d-flex flex-column h-100">
          <div className="d-flex justify-content-between align-items-center mb-3">
            {sidebarOpen && (
              <h5 className="text-white mb-0 fw-bold">
                <i className="bi bi-heart-pulse-fill text-primary me-2"></i>
                MediCitas
              </h5>
            )}
            <button
              className={`btn btn-sm ${sidebarOpen ? 'btn-outline-light' : 'btn-outline-light w-100'}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ borderRadius: '8px' }}
            >
              <i className={`bi ${sidebarOpen ? 'bi-chevron-left' : 'bi-chevron-right'}`}></i>
            </button>
          </div>

          <hr className="border-secondary opacity-25" />

          {sidebarOpen && (
            <div className="mb-4">
              <div className="d-flex align-items-center gap-2 mb-2">
                <div
                  className="bg-primary bg-gradient rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                  style={{ width: '40px', height: '40px', fontSize: '0.9rem' }}
                >
                  {userName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <div className="text-white fw-semibold small">{userName}</div>
                  <div className="text-secondary small">
                    <i className="bi bi-person-badge me-1"></i>Administrador
                  </div>
                </div>
              </div>
            </div>
          )}

          <nav className="nav flex-column flex-grow-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link text-white d-flex align-items-center ${
                  location.pathname === item.path ? 'bg-primary active' : ''
                }`}
                style={{
                  borderRadius: '10px',
                  marginBottom: '4px',
                  padding: sidebarOpen ? '10px 14px' : '10px',
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  transition: 'all 0.2s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <i
                  className={`${item.icon} ${sidebarOpen ? 'me-2' : ''}`}
                  style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}
                ></i>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          <div className="mt-auto">
            <hr className="border-secondary opacity-25" />
            <button
              className={`btn ${sidebarOpen ? 'btn-outline-danger w-100' : 'btn-outline-danger w-100'}`}
              onClick={cerrarSesion}
              style={{ borderRadius: '10px', padding: '10px' }}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: '1.2rem' }}></i>
              {sidebarOpen && 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-grid-fill text-primary"></i>
              {getPageTitle()}
            </h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 mt-1">
                <li className="breadcrumb-item">
                  <Link to="/dashboard/admin" className="text-decoration-none text-secondary">
                    <i className="bi bi-house-door"></i>
                  </Link>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  {getPageTitle()}
                </li>
              </ol>
            </nav>
          </div>
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary btn-sm rounded-circle" style={{ width: '36px', height: '36px' }}>
              <i className="bi bi-bell"></i>
            </button>
            <button className="btn btn-outline-secondary btn-sm rounded-circle" style={{ width: '36px', height: '36px' }}>
              <i className="bi bi-question-circle"></i>
            </button>
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;