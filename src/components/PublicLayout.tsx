// src/components/PublicLayout.tsx
import { Outlet, Link } from 'react-router-dom';

function PublicLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header público */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary" to="/">
            <i className="bi bi-heart-pulse-fill me-2"></i>
            MediCitas
          </Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarPublic">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarPublic">
            <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-center">
              <li className="nav-item">
                <Link className="nav-link" to="/">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/#servicios">Servicios</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/#doctores">Doctores</Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/#contacto">Contacto</Link>
              </li>
              <li className="nav-item ms-2">
                <Link className="btn btn-outline-primary btn-sm me-2" to="/login">Iniciar Sesión</Link>
              </li>
              <li className="nav-item">
                <Link className="btn btn-primary btn-sm" to="/register">Registrarse</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Contenido principal */}
      <main className="flex-grow-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-dark text-white py-4 mt-5">
        <div className="container">
          <div className="row">
            <div className="col-md-4">
              <h6 className="fw-bold">MediCitas</h6>
              <p className="small">Tu salud en nuestras manos. Agenda tu cita médica de forma rápida y segura.</p>
            </div>
            <div className="col-md-4">
              <h6 className="fw-bold">Contacto</h6>
              <p className="small mb-1"><i className="bi bi-geo-alt me-2"></i>Av. Principal 123, Lima</p>
              <p className="small mb-1"><i className="bi bi-telephone me-2"></i>(01) 999-999-999</p>
              <p className="small"><i className="bi bi-envelope me-2"></i>info@medicitas.com</p>
            </div>
            <div className="col-md-4">
              <h6 className="fw-bold">Horario</h6>
              <p className="small mb-1">Lunes a Viernes: 8:00 am - 8:00 pm</p>
              <p className="small mb-1">Sábados: 9:00 am - 2:00 pm</p>
              <p className="small">Domingos: Cerrado</p>
            </div>
          </div>
          <hr className="border-secondary" />
          <p className="text-center small mb-0">© 2026 MediCitas. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}

export default PublicLayout;