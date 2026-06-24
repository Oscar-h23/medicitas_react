// src/pages/paciente/MisCitas.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pacienteService } from '../../services/api';

interface Cita {
  id: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  doctorNombre: string;
  doctorId: number;
  motivoConsulta: string;
  estado: string;
  precioConsulta: number;
  consultorioNumero?: string;
  sedeNombre?: string;
}

function MisCitas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todas');
  const [showModal, setShowModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    setLoading(true);
    try {
      const data = await pacienteService.getMisCitas();
      setCitas(data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      alert('Error al cargar tus citas. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const cancelarCita = async (citaId: number) => {
    if (!confirm('¿Estás seguro de cancelar esta cita?')) return;

    try {
      await pacienteService.cancelarCita(citaId);
      alert('✅ Cita cancelada exitosamente');
      cargarCitas(); // Recargar la lista
    } catch (error) {
      alert('❌ Error al cancelar la cita');
      console.error(error);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const clases = {
      'ATENDIDA': 'bg-success',
      'CANCELADA': 'bg-danger',
      'CONFIRMADA': 'bg-primary',
      'PENDIENTE': 'bg-warning text-dark',
      'NO_ASISTIO': 'bg-secondary'
    };
    return clases[estado as keyof typeof clases] || 'bg-secondary';
  };

  const getEstadoIcon = (estado: string) => {
    const iconos = {
      'ATENDIDA': '✅',
      'CANCELADA': '❌',
      'CONFIRMADA': '✔️',
      'PENDIENTE': '⏳',
      'NO_ASISTIO': '🚫'
    };
    return iconos[estado as keyof typeof iconos] || '📌';
  };

  const formatearFecha = (fecha: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(fecha).toLocaleDateString('es-ES', options);
  };

  const esCitaFutura = (fecha: string, hora: string) => {
    const ahora = new Date();
    const fechaCita = new Date(`${fecha}T${hora}`);
    return fechaCita > ahora;
  };

  const esCitaHoy = (fecha: string) => {
    const hoy = new Date().toISOString().split('T')[0];
    return fecha === hoy;
  };

  // Filtrar citas
  const getCitasFiltradas = () => {
    switch(filter) {
      case 'pendientes':
        return citas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA');
      case 'confirmadas':
        return citas.filter(c => c.estado === 'CONFIRMADA');
      case 'atendidas':
        return citas.filter(c => c.estado === 'ATENDIDA');
      case 'canceladas':
        return citas.filter(c => c.estado === 'CANCELADA');
      default:
        return citas;
    }
  };

  const citasFiltradas = getCitasFiltradas();
  const citasPendientes = citas.filter(c => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA');
  const citasAtendidas = citas.filter(c => c.estado === 'ATENDIDA');

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Cargando tus citas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* Resumen de citas */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card bg-primary bg-opacity-10 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Total citas</h6>
                <h2 className="mb-0 text-primary">{citas.length}</h2>
              </div>
              <div className="display-6">📋</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-warning bg-opacity-10 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Pendientes</h6>
                <h2 className="mb-0 text-warning">{citasPendientes.length}</h2>
              </div>
              <div className="display-6">⏳</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-success bg-opacity-10 border-0 shadow-sm">
            <div className="card-body d-flex align-items-center justify-content-between">
              <div>
                <h6 className="text-muted mb-1">Atendidas</h6>
                <h2 className="mb-0 text-success">{citasAtendidas.length}</h2>
              </div>
              <div className="display-6">✅</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y acciones */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="d-flex flex-wrap gap-2 align-items-center">
            <div className="me-2">
              <span className="text-muted">Filtrar:</span>
            </div>
            <button
              className={`btn ${filter === 'todas' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('todas')}
            >
              Todas
            </button>
            <button
              className={`btn ${filter === 'pendientes' ? 'btn-warning' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('pendientes')}
            >
              ⏳ Pendientes
            </button>
            <button
              className={`btn ${filter === 'confirmadas' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('confirmadas')}
            >
              ✔️ Confirmadas
            </button>
            <button
              className={`btn ${filter === 'atendidas' ? 'btn-success' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('atendidas')}
            >
              ✅ Atendidas
            </button>
            <button
              className={`btn ${filter === 'canceladas' ? 'btn-danger' : 'btn-outline-secondary'}`}
              onClick={() => setFilter('canceladas')}
            >
              ❌ Canceladas
            </button>
            <div className="ms-auto">
              <button
                className="btn btn-primary"
                onClick={() => navigate('/paciente/doctores')}
              >
                📅 Nueva Cita
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      {citasFiltradas.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="display-1 mb-3">📭</div>
            <h4>No hay citas {filter !== 'todas' ? 'con este filtro' : 'registradas'}</h4>
            <p className="text-muted">
              {filter !== 'todas' 
                ? 'Intenta con otro filtro o elimina el filtro actual.'
                : 'Agenda tu primera cita médica haciendo clic en "Nueva Cita".'
              }
            </p>
            {filter !== 'todas' ? (
              <button
                className="btn btn-outline-primary"
                onClick={() => setFilter('todas')}
              >
                Ver todas las citas
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => navigate('/paciente/doctores')}
              >
                📅 Agendar Cita
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card shadow-sm border-0">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ minWidth: '120px' }}>Fecha</th>
                    <th style={{ minWidth: '100px' }}>Hora</th>
                    <th style={{ minWidth: '150px' }}>Doctor</th>
                    <th style={{ minWidth: '150px' }}>Motivo</th>
                    <th style={{ minWidth: '120px' }}>Estado</th>
                    <th style={{ minWidth: '150px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citasFiltradas.map((cita) => (
                    <tr key={cita.id} className={esCitaHoy(cita.fecha) ? 'table-warning' : ''}>
                      <td>
                        <div>
                          {formatearFecha(cita.fecha)}
                          {esCitaHoy(cita.fecha) && (
                            <span className="badge bg-warning text-dark ms-2">Hoy</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <strong>{cita.horaInicio}</strong>
                        {cita.horaFin && <span className="text-muted text-sm"> - {cita.horaFin}</span>}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <div>
                            <div className="fw-bold">{cita.doctorNombre}</div>
                            {cita.consultorioNumero && (
                              <small className="text-muted">Consultorio: {cita.consultorioNumero}</small>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-truncate" style={{ maxWidth: '150px' }} title={cita.motivoConsulta}>
                          {cita.motivoConsulta || 'Sin motivo especificado'}
                        </div>
                        <small className="text-muted">
                          S/. {cita.precioConsulta.toFixed(2)}
                        </small>
                      </td>
                      <td>
                        <span className={`badge ${getEstadoBadge(cita.estado)}`}>
                          {getEstadoIcon(cita.estado)} {cita.estado}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {cita.estado !== 'ATENDIDA' && cita.estado !== 'CANCELADA' && (
                            <>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => cancelarCita(cita.id)}
                                title="Cancelar cita"
                              >
                                ❌ Cancelar
                              </button>
                              {esCitaFutura(cita.fecha, cita.horaInicio) && (
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    setCitaSeleccionada(cita);
                                    setShowModal(true);
                                  }}
                                  title="Ver detalles"
                                >
                                  📋 Detalles
                                </button>
                              )}
                            </>
                          )}
                          {cita.estado === 'ATENDIDA' && (
                            <button
                              className="btn btn-sm btn-outline-success"
                              onClick={() => navigate('/paciente/mi-historial')}
                            >
                              📋 Ver Consulta
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de la Cita */}
      {showModal && citaSeleccionada && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">📋 Detalles de la Cita</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <h6 className="text-muted">Doctor</h6>
                        <p className="fw-bold">{citaSeleccionada.doctorNombre}</p>
                      </div>
                      <span className={`badge ${getEstadoBadge(citaSeleccionada.estado)}`}>
                        {citaSeleccionada.estado}
                      </span>
                    </div>
                  </div>
                  <div className="col-6">
                    <h6 className="text-muted">Fecha</h6>
                    <p>{formatearFecha(citaSeleccionada.fecha)}</p>
                  </div>
                  <div className="col-6">
                    <h6 className="text-muted">Hora</h6>
                    <p>{citaSeleccionada.horaInicio} {citaSeleccionada.horaFin && `- ${citaSeleccionada.horaFin}`}</p>
                  </div>
                  <div className="col-12">
                    <h6 className="text-muted">Motivo de Consulta</h6>
                    <p>{citaSeleccionada.motivoConsulta || 'No especificado'}</p>
                  </div>
                  <div className="col-6">
                    <h6 className="text-muted">Precio</h6>
                    <p className="fw-bold text-primary">S/. {citaSeleccionada.precioConsulta.toFixed(2)}</p>
                  </div>
                  {citaSeleccionada.consultorioNumero && (
                    <div className="col-6">
                      <h6 className="text-muted">Consultorio</h6>
                      <p>{citaSeleccionada.consultorioNumero}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                {citaSeleccionada.estado !== 'ATENDIDA' && citaSeleccionada.estado !== 'CANCELADA' && (
                  <button
                    className="btn btn-danger"
                    onClick={() => {
                      setShowModal(false);
                      cancelarCita(citaSeleccionada.id);
                    }}
                  >
                    ❌ Cancelar Cita
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal-backdrop fade show" onClick={() => setShowModal(false)} />
      )}
    </div>
  );
}

export default MisCitas;