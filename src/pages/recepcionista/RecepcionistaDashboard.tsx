import { useEffect, useState } from 'react';
import { recepcionistaService } from '../../services/api';

interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  doctorId: number;
  doctorNombre: string;
  fecha: string;
  horaInicio: string;
  motivoConsulta: string;
  estado: string;
  precioConsulta: number;
}

interface Doctor {
  id: number;
  nombre: string;
  especialidad: string;
}

function RecepcionistaDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Estados para el buscador ───────────────────────────────
  const [documentoBusqueda, setDocumentoBusqueda] = useState('');
  const [pacienteEncontrado, setPacienteEncontrado] = useState<any>(null);
  const [buscandoPaciente, setBuscandoPaciente] = useState(false);

  // ── Estados para nueva cita ────────────────────────────────
  const [mostrarModalCita, setMostrarModalCita] = useState(false);
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [nuevaCita, setNuevaCita] = useState({
    doctorId: 0,
    fecha: '',
    horaInicio: '',
    motivoConsulta: '',
  });
  const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);

  // ── Estados para cambiar estado ──────────────────────────
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  // Cargar horarios cuando cambie doctor o fecha (y el modal esté abierto)
  useEffect(() => {
    if (mostrarModalCita) {
      cargarHorariosDisponibles();
    }
  }, [nuevaCita.doctorId, nuevaCita.fecha, mostrarModalCita]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [dashboardData, citasData, doctoresData] = await Promise.all([
        recepcionistaService.getDashboard(),
        recepcionistaService.getCitasHoy(),
        recepcionistaService.getDoctores(),
      ]);
      setDashboard(dashboardData);
      setCitasHoy(citasData);
      setDoctores(doctoresData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Buscar paciente ──────────────────────────────────────
  const buscarPaciente = async () => {
    if (!documentoBusqueda.trim()) {
      alert('Ingresa un número de documento.');
      return;
    }
    setBuscandoPaciente(true);
    try {
      const data = await recepcionistaService.buscarPacientePorDocumento(documentoBusqueda);
      setPacienteEncontrado(data);
      if (data) {
        setMostrarModalCita(true);
      } else {
        alert('Paciente no encontrado.');
      }
    } catch (error) {
      console.error('Error al buscar paciente:', error);
      alert('Error al buscar paciente.');
    } finally {
      setBuscandoPaciente(false);
    }
  };

  // ─── Cargar horarios disponibles ──────────────────────────
  const cargarHorariosDisponibles = async () => {
    if (!nuevaCita.doctorId || !nuevaCita.fecha) {
      setHorariosDisponibles([]);
      return;
    }
    setCargandoHorarios(true);
    try {
      const horarios = await recepcionistaService.getHorariosDisponibles(
        nuevaCita.doctorId,
        nuevaCita.fecha
      );
      setHorariosDisponibles(horarios);
      // Si el horario seleccionado ya no está disponible, resetear
      if (nuevaCita.horaInicio && !horarios.includes(nuevaCita.horaInicio)) {
        setNuevaCita(prev => ({ ...prev, horaInicio: '' }));
      }
    } catch (error) {
      console.error('Error al cargar horarios:', error);
      setHorariosDisponibles([]);
    } finally {
      setCargandoHorarios(false);
    }
  };

  // ─── Crear cita ──────────────────────────────────────────
  const crearCita = async () => {
    if (!pacienteEncontrado) return;
    if (!nuevaCita.doctorId || !nuevaCita.fecha || !nuevaCita.horaInicio) {
      alert('Completa todos los campos de la cita.');
      return;
    }
    try {
      await recepcionistaService.crearCita({
        pacienteId: pacienteEncontrado.id,
        doctorId: nuevaCita.doctorId,
        fecha: nuevaCita.fecha,
        horaInicio: nuevaCita.horaInicio,
        motivoConsulta: nuevaCita.motivoConsulta || 'Consulta general',
      });
      alert('✅ Cita creada exitosamente');
      setMostrarModalCita(false);
      setPacienteEncontrado(null);
      setDocumentoBusqueda('');
      setNuevaCita({ doctorId: 0, fecha: '', horaInicio: '', motivoConsulta: '' });
      cargarDatos();
    } catch (error: any) {
      console.error('Error al crear cita:', error);
      alert(error?.response?.data?.mensaje || 'Error al crear la cita.');
    }
  };

  // ─── Cambiar estado ─────────────────────────────────────────
  const cambiarEstado = async (nuevoEstado: string) => {
    if (!citaSeleccionada) return;
    try {
      await recepcionistaService.cambiarEstadoCita(citaSeleccionada.id, nuevoEstado);
      alert(`✅ Cita ${nuevoEstado} correctamente`);
      setMostrarModalEstado(false);
      setCitaSeleccionada(null);
      cargarDatos();
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      alert(error?.response?.data?.mensaje || 'Error al cambiar estado.');
    }
  };

  // ─── Registrar pago ──────────────────────────────────────
  const registrarPago = async (citaId: number) => {
    if (!window.confirm('¿Marcar esta cita como pagada?')) return;
    try {
      await recepcionistaService.registrarPago({
        citaId,
        metodoPago: 'EFECTIVO',
      });
      alert('✅ Pago registrado');
      cargarDatos();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      alert(error?.response?.data?.mensaje || 'Error al registrar pago.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando datos...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      {/* ─── Resumen ─── */}
      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h6 className="card-title">Citas Hoy</h6>
              <h3>{dashboard?.citasHoy || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning text-dark">
            <div className="card-body">
              <h6 className="card-title">Pendientes Hoy</h6>
              <h3>{dashboard?.citasPendientesHoy || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h6 className="card-title">Total Pacientes</h6>
              <h3>{dashboard?.totalPacientes || 0}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h6 className="card-title">Citas Semana</h6>
              <h3>{dashboard?.citasSemana || 0}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Buscador de paciente ─── */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="mb-3">🔍 Buscar Paciente</h5>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              placeholder="Número de documento"
              value={documentoBusqueda}
              onChange={(e) => setDocumentoBusqueda(e.target.value)}
            />
            <button
              className="btn btn-primary"
              onClick={buscarPaciente}
              disabled={buscandoPaciente}
            >
              {buscandoPaciente ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {pacienteEncontrado && (
            <div className="mt-2 alert alert-success">
              <strong>Paciente encontrado:</strong> {pacienteEncontrado.nombres} {pacienteEncontrado.apellidos} - HC: {pacienteEncontrado.historiaClinica}
            </div>
          )}
        </div>
      </div>

      {/* ─── Lista de citas de hoy ─── */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">📋 Citas de hoy</h5>
          {citasHoy.length === 0 ? (
            <div className="alert alert-info">No hay citas programadas para hoy.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Doctor</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citasHoy.map((cita) => (
                    <tr key={cita.id}>
                      <td>{cita.pacienteNombre}</td>
                      <td>{cita.doctorNombre}</td>
                      <td>{cita.horaInicio}</td>
                      <td>{cita.motivoConsulta}</td>
                      <td>
                        <span className={`badge bg-${cita.estado === 'PENDIENTE' ? 'warning' : cita.estado === 'CONFIRMADA' ? 'info' : cita.estado === 'ATENDIDA' ? 'success' : 'danger'}`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                              setCitaSeleccionada(cita);
                              setMostrarModalEstado(true);
                            }}
                          >
                            Cambiar Estado
                          </button>
                          {cita.estado !== 'PAGADO' && (
                            <button
                              className="btn btn-outline-success"
                              onClick={() => registrarPago(cita.id)}
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal para cambiar estado ─── */}
      {mostrarModalEstado && citaSeleccionada && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambiar estado de cita</h5>
                <button className="btn-close" onClick={() => setMostrarModalEstado(false)} />
              </div>
              <div className="modal-body">
                <p><strong>Paciente:</strong> {citaSeleccionada.pacienteNombre}</p>
                <p><strong>Doctor:</strong> {citaSeleccionada.doctorNombre}</p>
                <p><strong>Estado actual:</strong> {citaSeleccionada.estado}</p>
                <div className="d-flex gap-2 flex-wrap">
                  {['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIO'].map((est) => (
                    <button
                      key={est}
                      className={`btn btn-${est === citaSeleccionada.estado ? 'secondary' : 'outline-primary'}`}
                      onClick={() => cambiarEstado(est)}
                    >
                      {est}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal para crear cita ─── */}
      {mostrarModalCita && pacienteEncontrado && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nueva cita para {pacienteEncontrado.nombres}</h5>
                <button
                  className="btn-close"
                  onClick={() => {
                    setMostrarModalCita(false);
                    setPacienteEncontrado(null);
                    setHorariosDisponibles([]);
                  }}
                />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Doctor</label>
                  <select
                    className="form-select"
                    value={nuevaCita.doctorId}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, doctorId: Number(e.target.value), horaInicio: '' })}
                  >
                    <option value="">Seleccionar...</option>
                    {doctores.map((d) => (
                      <option key={d.id} value={d.id}>{d.nombre} - {d.especialidad}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Fecha</label>
                  <input
                    type="date"
                    className="form-control"
                    value={nuevaCita.fecha}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, fecha: e.target.value, horaInicio: '' })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Hora</label>
                  <select
                    className="form-select"
                    value={nuevaCita.horaInicio}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, horaInicio: e.target.value })}
                    disabled={cargandoHorarios || horariosDisponibles.length === 0}
                  >
                    <option value="">Seleccionar hora</option>
                    {horariosDisponibles.map((hora) => (
                      <option key={hora} value={hora}>
                        {hora}
                      </option>
                    ))}
                  </select>
                  {cargandoHorarios && (
                    <div className="text-muted small mt-1">Cargando horarios...</div>
                  )}
                  {!cargandoHorarios && horariosDisponibles.length === 0 && nuevaCita.doctorId && nuevaCita.fecha && (
                    <div className="text-danger small mt-1">No hay horarios disponibles para esta fecha y doctor.</div>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Motivo</label>
                  <input
                    type="text"
                    className="form-control"
                    value={nuevaCita.motivoConsulta}
                    onChange={(e) => setNuevaCita({ ...nuevaCita, motivoConsulta: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setMostrarModalCita(false);
                    setPacienteEncontrado(null);
                    setHorariosDisponibles([]);
                  }}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-success"
                  onClick={crearCita}
                  disabled={!nuevaCita.horaInicio || horariosDisponibles.length === 0}
                >
                  Crear Cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecepcionistaDashboard;