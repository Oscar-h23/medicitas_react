import { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout"; // Ajusta la ruta según tu estructura

type Cita = {
  id: string;
  fecha: string;
  horaInicio: string;
  doctorNombre: string;
  motivoConsulta: string;
  estado: string;
};

type PacienteData = {
  totalCitas: number;
  pendientes: number;
  atendidas: number;
  citas: Cita[];
};

function PacienteDashboard() {
  const [data, setData] = useState<PacienteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [citas, setCitas] = useState<Cita[]>([]);

  useEffect(() => {
    obtenerCitas();
  }, []);

  const obtenerCitas = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/citas",
        {
          headers: {
            "x-user-id": "5"
          }
        }
      );

      const citasData = await response.json();
      setCitas(citasData);

      // Calcular estadísticas
      const pendientes = citasData.filter(
        (c: Cita) => c.estado === "PENDIENTE" || c.estado === "CONFIRMADA"
      );
      const atendidas = citasData.filter(
        (c: Cita) => c.estado === "ATENDIDA"
      );

      setData({
        totalCitas: citasData.length,
        pendientes: pendientes.length,
        atendidas: atendidas.length,
        citas: citasData
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadgeClass = (estado: string) => {
    switch(estado) {
      case "ATENDIDA": return "badge bg-success";
      case "CANCELADA": return "badge bg-danger";
      case "CONFIRMADA": return "badge bg-primary";
      default: return "badge bg-warning text-dark";
    }
  };

  return (
    <DashboardLayout title="Mi Área de Salud">
      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : data ? (
        <>
          {/* Tarjetas de estadísticas */}
          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="stat-icon me-3" style={{ background: '#3182ce18', padding: '10px', borderRadius: '10px' }}>
                    📅
                  </div>
                  <div>
                    <h3 className="mb-0" style={{ color: '#3182ce' }}>{data.totalCitas}</h3>
                    <small className="text-muted">Total de citas</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="stat-icon me-3" style={{ background: '#d69e2e18', padding: '10px', borderRadius: '10px' }}>
                    ⏳
                  </div>
                  <div>
                    <h3 className="mb-0" style={{ color: '#d69e2e' }}>{data.pendientes}</h3>
                    <small className="text-muted">Pendientes</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="stat-icon me-3" style={{ background: '#38a16918', padding: '10px', borderRadius: '10px' }}>
                    ✅
                  </div>
                  <div>
                    <h3 className="mb-0" style={{ color: '#38a169' }}>{data.atendidas}</h3>
                    <small className="text-muted">Atendidas</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-md-3">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex align-items-center">
                  <div className="stat-icon me-3" style={{ background: '#805ad518', padding: '10px', borderRadius: '10px' }}>
                    🏥
                  </div>
                  <div>
                    <h3 className="mb-0" style={{ color: '#805ad5' }}>{data.citas.length}</h3>
                    <small className="text-muted">Próximas citas</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de bienvenida */}
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-body">
              <div className="d-flex align-items-start">
                <div className="welcome-icon me-3" style={{ fontSize: '2.5rem' }}>🏥</div>
                <div>
                  <h2 className="h4 mb-2">Bienvenido a MediCitas</h2>
                  <p className="text-muted mb-0">Desde aquí puedes gestionar tus citas médicas y revisar tu historial clínico.</p>
                </div>
              </div>
              <div className="d-flex flex-wrap gap-3 mt-3">
                <button className="btn btn-primary">📅 Agendar Cita</button>
                <button className="btn btn-outline-primary">📋 Mi Historial</button>
                <button className="btn btn-outline-secondary">👨‍⚕️ Ver Doctores</button>
              </div>
            </div>
          </div>

          {/* Tabla de citas */}
          <div className="card shadow-sm border-0">
            <div className="card-header bg-transparent border-0 pt-3">
              <h5 className="mb-0">Mis Citas</h5>
            </div>
            <div className="card-body">
              {citas.length === 0 ? (
                <div className="alert alert-info">
                  No tienes citas registradas.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
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
                      {citas.map(cita => (
                        <tr key={cita.id}>
                          <td>{cita.fecha}</td>
                          <td>{cita.horaInicio}</td>
                          <td>{cita.doctorNombre}</td>
                          <td>{cita.motivoConsulta}</td>
                          <td>
                            <span className={getEstadoBadgeClass(cita.estado)}>
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
        </>
      ) : (
        <div className="alert alert-danger">
          No se pudo cargar la información.
        </div>
      )}
    </DashboardLayout>
  );
}

export default PacienteDashboard;