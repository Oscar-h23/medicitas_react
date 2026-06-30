// src/pages/recepcionista/RecepcionistaCitas.tsx

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
  horaFin?: string;
  motivoConsulta: string;
  estado: string;
  precioConsulta: number; // ← corregido: antes era precioCita
}

function RecepcionistaCitas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');

  const [mostrarModalEstado, setMostrarModalEstado] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);

  useEffect(() => {
    cargarCitas();
  }, [filtroEstado, filtroFecha]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroEstado) params.estado = filtroEstado;
      if (filtroFecha) params.fechaInicio = filtroFecha;
      const data = await recepcionistaService.getCitas(params);
      setCitas(data);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      alert('No se pudieron cargar las citas.');
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = async (nuevoEstado: string) => {
    if (!citaSeleccionada) return;
    try {
      await recepcionistaService.cambiarEstadoCita(citaSeleccionada.id, nuevoEstado);
      alert(`✅ Cita ${nuevoEstado} correctamente`);
      setMostrarModalEstado(false);
      setCitaSeleccionada(null);
      cargarCitas();
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      alert(error?.response?.data?.mensaje || 'Error al cambiar estado.');
    }
  };

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE':   return 'bg-warning';
      case 'CONFIRMADA':  return 'bg-info';
      case 'ATENDIDA':    return 'bg-success';
      case 'CANCELADA':   return 'bg-danger';
      case 'NO_ASISTIO':  return 'bg-secondary';
      default:            return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando citas...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h5 className="mb-0">📋 Todas las Citas</h5>
            <div className="d-flex gap-2 flex-wrap">
              <select
                className="form-select form-select-sm"
                style={{ width: '150px' }}
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendiente</option>
                <option value="CONFIRMADA">Confirmada</option>
                <option value="ATENDIDA">Atendida</option>
                <option value="CANCELADA">Cancelada</option>
                <option value="NO_ASISTIO">No Asistió</option>
              </select>
              <input
                type="date"
                className="form-control form-control-sm"
                style={{ width: '180px' }}
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
              <button className="btn btn-sm btn-secondary" onClick={() => { setFiltroEstado(''); setFiltroFecha(''); }}>
                Limpiar
              </button>
            </div>
          </div>

          {citas.length === 0 ? (
            <div className="alert alert-info">No hay citas que coincidan con los filtros.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover table-striped">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Doctor</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita) => (
                    <tr key={cita.id}>
                      <td>{cita.pacienteNombre}</td>
                      <td>{cita.doctorNombre}</td>
                      <td>{new Date(cita.fecha).toLocaleDateString('es-PE')}</td>
                      <td>{cita.horaInicio}</td>
                      <td>{cita.motivoConsulta}</td>
                      <td>S/ {cita.precioConsulta.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${getBadgeColor(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => {
                            setCitaSeleccionada(cita);
                            setMostrarModalEstado(true);
                          }}
                        >
                          Cambiar Estado
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal Cambiar Estado ─── */}
      {mostrarModalEstado && citaSeleccionada && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)' }} onClick={() => setMostrarModalEstado(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Cambiar Estado</h5>
                <button className="btn-close" onClick={() => setMostrarModalEstado(false)} />
              </div>
              <div className="modal-body">
                <p><strong>Paciente:</strong> {citaSeleccionada.pacienteNombre}</p>
                <p><strong>Doctor:</strong> {citaSeleccionada.doctorNombre}</p>
                <p><strong>Fecha:</strong> {citaSeleccionada.fecha} - {citaSeleccionada.horaInicio}</p>
                <p><strong>Estado actual:</strong> {citaSeleccionada.estado}</p>
                <div className="d-flex flex-wrap gap-2 mt-3">
                  {['PENDIENTE', 'CONFIRMADA', 'ATENDIDA', 'CANCELADA', 'NO_ASISTIO'].map((est) => (
                    <button
                      key={est}
                      className={`btn btn-sm ${est === citaSeleccionada.estado ? 'btn-secondary' : 'btn-outline-primary'}`}
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
    </div>
  );
}

export default RecepcionistaCitas;