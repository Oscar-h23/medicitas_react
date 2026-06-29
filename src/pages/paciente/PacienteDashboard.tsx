// src/pages/paciente/PacienteDashboard.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pacienteService } from '../../services/api';

interface ProximaCita {
  id: number;
  fecha: string;
  horaInicio: string;
  doctorId: number;
  doctorNombre?: string;
  motivoConsulta?: string;
  estado: string;
}

interface DashboardData {
  totalCitas: number;
  citasPendientes: number;
  citasAtendidas: number;
  totalConsultas: number;
  proximaCita: ProximaCita | null;
}

interface Cita {
  id: string;
  fecha: string;
  horaInicio: string;
  doctorNombre: string;
  motivoConsulta: string;
  estado: string;
}

function PacienteDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [citasRecientes, setCitasRecientes] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  cargarDatos();
}, []);

  const cargarDatos = async () => {
  try {
    const [perfil, dashData, citas] = await Promise.all([
      pacienteService.getPerfil(),
      pacienteService.getDashboardData(),
      pacienteService.getMisCitas(),
    ]);

    setUserName(
      `${perfil.nombres} ${perfil.apellidos}`.trim()
    );

    if (dashData.proximaCita) {
      const citaCompleta = citas.find(
        (c: any) => c.id === dashData.proximaCita.id
      );

      if (citaCompleta) {
        dashData.proximaCita.doctorNombre =
          citaCompleta.doctorNombre;
      }
    }

    setDashboardData(dashData);

    const recientes = [...citas]
      .sort((a: Cita, b: Cita) =>
        `${b.fecha} ${b.horaInicio}`.localeCompare(
          `${a.fecha} ${a.horaInicio}`
        )
      )
      .slice(0, 5);

    setCitasRecientes(recientes);

  } catch (err) {
    console.error('Error al cargar dashboard:', err);
  } finally {
    setLoading(false);
  }
};
  

  const getEstadoBadgeClass = (estado: string) => {
    const mapa: Record<string, string> = {
      ATENDIDA: 'bg-success',
      CANCELADA: 'bg-danger',
      CONFIRMADA: 'bg-primary',
      PENDIENTE: 'bg-warning text-dark',
      NO_ASISTIO: 'bg-secondary',
    };
    return mapa[estado] ?? 'bg-secondary';
  };

  const formatearFecha = (fecha: string) =>
    new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" />
          <p className="mt-2 text-muted">Cargando tu información...</p>
        </div>
      </div>
    );
  }

  const stats = [
    { emoji: '📅', value: dashboardData?.totalCitas ?? 0, label: 'Total de citas', color: '#3182ce' },
    { emoji: '⏳', value: dashboardData?.citasPendientes ?? 0, label: 'Pendientes', color: '#d69e2e' },
    { emoji: '✅', value: dashboardData?.citasAtendidas ?? 0, label: 'Atendidas', color: '#38a169' },
    { emoji: '📋', value: dashboardData?.totalConsultas ?? 0, label: 'Consultas médicas', color: '#805ad5' },
  ];

  return (
    <div className="container-fluid px-0">

      {/* Bienvenida */}
      <div className="card shadow-sm border-0 mb-4 bg-primary text-white">
        <div className="card-body p-4 d-flex align-items-center gap-3">
          <div className="display-4">👋</div>
          <div>
            <h4 className="mb-1">¡Bienvenido, {userName || 'Paciente'}!</h4>
            <p className="mb-0 opacity-75 small">
              Aquí puedes ver un resumen de tu actividad médica.
            </p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="row g-3 mb-4">
        {stats.map(({ emoji, value, label, color }) => (
          <div className="col-6 col-md-3" key={label}>
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body d-flex align-items-center gap-3">
                <div style={{
                  background: `${color}18`,
                  padding: 12,
                  borderRadius: 12,
                  fontSize: '1.4rem',
                  lineHeight: 1,
                }}>
                  {emoji}
                </div>
                <div>
                  <h4 className="mb-0" style={{ color }}>{value}</h4>
                  <small className="text-muted">{label}</small>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Próxima cita */}
      {dashboardData?.proximaCita && (
        <div className="card shadow-sm border-0 border-start border-4 border-primary mb-4">
          <div className="card-body d-flex justify-content-between align-items-start gap-3">
            <div>
              <h6 className="text-primary mb-2">📌 Próxima cita</h6>
              <p className="mb-1">
                <strong>Fecha:</strong> {formatearFecha(dashboardData.proximaCita.fecha)}
              </p>
              <p className="mb-1">
                <strong>Hora:</strong> {dashboardData.proximaCita.horaInicio}
              </p>
              {dashboardData.proximaCita.doctorNombre && (
                <p className="mb-1">
                  <strong>Doctor:</strong> {dashboardData.proximaCita.doctorNombre}
                </p>
              )}
              {dashboardData.proximaCita.motivoConsulta && (
                <p className="mb-0">
                  <strong>Motivo:</strong> {dashboardData.proximaCita.motivoConsulta}
                </p>
              )}
            </div>
            <button
              className="btn btn-primary btn-sm flex-shrink-0"
              onClick={() => navigate('/dashboard/paciente/mis-citas')}
            >
              Ver mis citas
            </button>
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <h6 className="mb-3">⚡ Acciones rápidas</h6>
          <div className="d-flex flex-wrap gap-2">
            <button className="btn btn-primary" onClick={() => navigate('/dashboard/paciente/doctores')}>
              📅 Agendar cita
            </button>
            <button className="btn btn-outline-primary" onClick={() => navigate('/dashboard/paciente/mis-citas')}>
              🗂️ Mis citas
            </button>
            <button className="btn btn-outline-secondary" onClick={() => navigate('/dashboard/paciente/mi-historial')}>
              📋 Mi historial
            </button>
            <button className="btn btn-outline-info" onClick={() => navigate('/dashboard/paciente/mi-perfil')}>
              👤 Mi perfil
            </button>
          </div>
        </div>
      </div>

      {/* Últimas citas */}
      <div className="card shadow-sm border-0">
        <div className="card-header bg-transparent border-0 pt-3 d-flex justify-content-between align-items-center">
          <h6 className="mb-0">📋 Últimas citas</h6>
          <button
            className="btn btn-sm btn-link text-decoration-none"
            onClick={() => navigate('/paciente/mis-citas')}
          >
            Ver todas →
          </button>
        </div>
        <div className="card-body pt-0">
          {citasRecientes.length === 0 ? (
            <div className="alert alert-info mb-0">
              No tienes citas registradas aún. ¡Agenda tu primera cita!
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Doctor</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {citasRecientes.map(cita => (
                    <tr key={cita.id}>
                      <td>{formatearFecha(cita.fecha)}</td>
                      <td>{cita.horaInicio}</td>
                      <td>{cita.doctorNombre}</td>
                      <td>
                        <span
                          className="text-truncate d-inline-block"
                          style={{ maxWidth: 160 }}
                          title={cita.motivoConsulta}
                        >
                          {cita.motivoConsulta}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getEstadoBadgeClass(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default PacienteDashboard;