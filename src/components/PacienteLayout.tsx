// src/components/PacienteLayout.tsx

import { useState, useEffect } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';

function PacienteLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [userName, setUserName] = useState('Paciente');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('userData');

    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUserName(`${parsed.nombres} ${parsed.apellidos}`);
      } catch {
        setUserName('Paciente');
      }
    }
  }, []);

  const menuItems = [
    {
      path: '/dashboard/paciente',
      icon: 'bi bi-speedometer2',
      label: 'Dashboard',
    },
    {
      path: '/dashboard/paciente/doctores',
      icon: 'bi bi-people',
      label: 'Ver Doctores',
    },
    {
      path: '/dashboard/paciente/mis-citas',
      icon: 'bi bi-calendar',
      label: 'Mis Citas',
    },
    {
      path: '/dashboard/paciente/mi-historial',
      icon: 'bi bi-file-earmark-medical',
      label: 'Mi Historial',
    },
    {
      path: '/dashboard/paciente/mi-perfil',
      icon: 'bi bi-person',
      label: 'Mi Perfil',
    },
  ];

  const getPageTitle = () => {
    const current = menuItems.find((item) => item.path === location.pathname);
    return current ? current.label : 'Mi Área de Salud';
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="d-flex" style={{ minHeight: '100vh' }}>
      {/* ===== SIDEBAR ===== */}
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
          {/* CABECERA */}
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

          {/* INFORMACIÓN DEL PACIENTE */}
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
                    <i className="bi bi-person-badge me-1"></i>Paciente
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MENÚ */}
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
                  style={{
                    fontSize: '1.2rem',
                    minWidth: '24px',
                    textAlign: 'center',
                  }}
                ></i>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>

          {/* LOGOUT */}
          <div className="mt-auto">
            <hr className="border-secondary opacity-25" />
            <button
              className={`btn ${sidebarOpen ? 'btn-outline-danger w-100' : 'btn-outline-danger w-100'}`}
              onClick={cerrarSesion}
              style={{
                borderRadius: '10px',
                padding: sidebarOpen ? '10px' : '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: sidebarOpen ? 'center' : 'center',
                gap: sidebarOpen ? '8px' : '0',
              }}
            >
              <i className="bi bi-box-arrow-right" style={{ fontSize: '1.2rem' }}></i>
              {sidebarOpen && 'Cerrar Sesión'}
            </button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-grow-1 p-4" style={{ backgroundColor: '#f8f9fa' }}>
        {/* HEADER */}
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <div>
            <h2 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <i className="bi bi-grid-fill text-primary"></i>
              {getPageTitle()}
            </h2>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0 mt-1">
                <li className="breadcrumb-item">
                  <Link to="/dashboard/paciente" className="text-decoration-none text-secondary">
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

        {/* CONTENIDO DINÁMICO */}
        <Outlet />
      </main>
    </div>
  );
}

export default PacienteLayout;