// src/pages/public/HomePage.tsx
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div className="container-fluid p-0">

      {/* ─── NAVBAR ───────────────────────────────────────────── */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm fixed-top">
        <div className="container">
          <Link className="navbar-brand fw-bold text-primary fs-4" to="/">
            🏥 MediCitas
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-2">
              <li className="nav-item">
                <a href="#features" className="nav-link">Características</a>
              </li>
              <li className="nav-item">
                <a href="#contact" className="nav-link">Contacto</a>
              </li>
              <li className="nav-item">
                <Link to="/login" className="btn btn-outline-primary btn-sm px-3">
                  Iniciar Sesión
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/login?redirect=agendar" className="btn btn-primary btn-sm px-3">
                  📅 Agendar Cita
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────────── */}
      <section
        className="text-white text-center d-flex align-items-center"
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 50%, #084298 100%)',
          paddingTop: '80px',
        }}
      >
        <div className="container py-5">
          <div className="row align-items-center">
            <div className="col-lg-7 mx-auto">
              <h1 className="display-2 fw-bold mb-3">
                Tu salud, <br className="d-none d-sm-block" />
                <span className="text-warning">nuestra prioridad</span>
              </h1>
              <p className="lead fs-4 mb-4 opacity-75">
                Agenda citas médicas en segundos, revisa tu historial clínico y recibe atención personalizada desde cualquier dispositivo.
              </p>
              <div className="d-flex justify-content-center gap-3 flex-wrap">
                <Link
                  to="/login?redirect=agendar"
                  className="btn btn-warning btn-lg px-5 fw-semibold"
                >
                  📅 Agendar Cita
                </Link>
                <Link to="/login" className="btn btn-outline-light btn-lg px-5">
                  Iniciar Sesión
                </Link>
              </div>
              <div className="mt-4 d-flex justify-content-center gap-5 flex-wrap text-white-50">
                <span><i className="bi bi-check-circle-fill text-success me-1" /> Sin comisiones</span>
                <span><i className="bi bi-check-circle-fill text-success me-1" /> Atención 24/7</span>
                <span><i className="bi bi-check-circle-fill text-success me-1" /> Seguro y confiable</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CARACTERÍSTICAS ──────────────────────────────────── */}
      <section id="features" className="py-5 bg-light">
        <div className="container py-4">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">¿Por qué elegir MediCitas?</h2>
            <p className="text-muted fs-5">Todo lo que necesitas para cuidar tu salud en un solo lugar</p>
          </div>
          <div className="row g-4">
            {[
              {
                icon: 'bi-calendar-check',
                title: 'Citas Rápidas',
                desc: 'Agenda tu cita en menos de 2 minutos. Recibe recordatorios automáticos por correo y SMS.',
              },
              {
                icon: 'bi-heart-pulse',
                title: 'Especialistas Calificados',
                desc: 'Contamos con médicos de diversas especialidades con años de experiencia y excelente reputación.',
              },
              {
                icon: 'bi-shield-check',
                title: 'Datos Seguros',
                desc: 'Tu información médica está protegida con los más altos estándares de seguridad y privacidad.',
              },
              {
                icon: 'bi-clock-history',
                title: 'Historial Clínico',
                desc: 'Accede a tu historial médico completo desde cualquier dispositivo, en cualquier momento.',
              },
              {
                icon: 'bi-credit-card',
                title: 'Pagos Fáciles',
                desc: 'Paga tus consultas de forma segura con tarjeta, Yape, Plin o efectivo en la clínica.',
              },
              {
                icon: 'bi-headset',
                title: 'Atención Personalizada',
                desc: 'Nuestro equipo de soporte está disponible para ayudarte con cualquier duda o inconveniente.',
              },
            ].map((feature, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card h-100 shadow-sm border-0 text-center p-4">
                  <div className="display-3 text-primary mb-3">
                    <i className={`bi ${feature.icon}`} />
                  </div>
                  <h5 className="card-title fw-bold">{feature.title}</h5>
                  <p className="card-text text-muted">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ESTADÍSTICAS ──────────────────────────────────────── */}
      <section className="py-5 bg-primary text-white">
        <div className="container py-3">
          <div className="row text-center g-4">
            {[
              { number: '10K+', label: 'Pacientes atendidos' },
              { number: '50+', label: 'Especialistas' },
              { number: '15+', label: 'Años de experiencia' },
              { number: '98%', label: 'Satisfacción' },
            ].map((stat, idx) => (
              <div className="col-6 col-md-3" key={idx}>
                <h3 className="display-4 fw-bold">{stat.number}</h3>
                <p className="opacity-75">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIOS ───────────────────────────────────────── */}
      <section className="py-5 bg-light">
        <div className="container py-3">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold">Lo que dicen nuestros pacientes</h2>
            <p className="text-muted fs-5">Historias reales de personas que confían en MediCitas</p>
          </div>
          <div className="row g-4">
            {[
              {
                name: 'María Gómez',
                text: 'Excelente atención, pude agendar mi cita en minutos y el doctor fue muy profesional. Totalmente recomendado.',
                rating: 5,
              },
              {
                name: 'Carlos Ruiz',
                text: 'La plataforma es muy fácil de usar y el historial clínico me ha ayudado a llevar un mejor control de mi salud.',
                rating: 5,
              },
              {
                name: 'Ana Martínez',
                text: 'Desde que uso MediCitas nunca he tenido problemas para conseguir cita con mi especialista. Muy satisfecha.',
                rating: 5,
              },
            ].map((testimonial, idx) => (
              <div className="col-md-4" key={idx}>
                <div className="card h-100 shadow-sm border-0 p-4">
                  <div className="mb-2 text-warning">
                    {'★'.repeat(testimonial.rating)}
                    {'☆'.repeat(5 - testimonial.rating)}
                  </div>
                  <p className="card-text fst-italic">"{testimonial.text}"</p>
                  <h6 className="fw-bold mt-2">— {testimonial.name}</h6>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACTO ──────────────────────────────────────────── */}
      <section id="contact" className="py-5 bg-white">
        <div className="container py-3">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <h2 className="display-5 fw-bold">¿Necesitas ayuda?</h2>
              <p className="fs-5 text-muted">
                Nuestro equipo está listo para atenderte. Contáctanos por cualquiera de estos medios:
              </p>
              <ul className="list-unstyled fs-5">
                <li className="mb-2">
                  <i className="bi bi-telephone-fill text-primary me-3" />
                  <strong>(01) 999-999-999</strong>
                </li>
                <li className="mb-2">
                  <i className="bi bi-envelope-fill text-primary me-3" />
                  <strong>info@medicitas.com</strong>
                </li>
                <li className="mb-2">
                  <i className="bi bi-geo-alt-fill text-primary me-3" />
                  <strong>Av. Principal 123, Lima, Perú</strong>
                </li>
              </ul>
              <div className="mt-3">
                <span className="badge bg-primary me-2">Lun–Vie: 8:00 – 20:00</span>
                <span className="badge bg-secondary">Sáb: 9:00 – 14:00</span>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div
                className="bg-light rounded-4 p-5"
                style={{ border: '1px solid #dee2e6' }}
              >
                <h4 className="mb-3">💬 ¿Listo para agendar tu cita?</h4>
                <p className="text-muted">
                  Regístrate o inicia sesión y agenda tu cita en menos de 2 minutos.
                </p>
                <Link
                  to="/login"
                  className="btn btn-primary btn-lg px-4"
                >
                  Comenzar ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-dark text-white py-4">
        <div className="container text-center">
          <p className="mb-0">
            &copy; {new Date().getFullYear()} MediCitas – Todos los derechos reservados.
          </p>
          <p className="small text-muted mt-1">
            Desarrollado con ❤️ para cuidar tu salud.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;