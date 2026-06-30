// src/pages/recepcionista/RecepcionistaPagos.tsx

import { useEffect, useState } from 'react';
import { recepcionistaService } from '../../services/api';

interface PagoCita {
  id: number;
  pacienteNombre: string;
  pacienteDocumento?: string; // DNI del paciente
  doctorNombre: string;
  fecha: string;
  horaInicio: string;
  precioConsulta: number;
  estado: string;           // Estado de la cita (PENDIENTE, ATENDIDA, etc.)
  pagoEstado?: string;      // PENDIENTE, PAGADO, ANULADO, NO_REGISTRADO
  pagoId?: number;          // ID del pago asociado (necesario para anular)
}

function RecepcionistaPagos() {
  const [citas, setCitas] = useState<PagoCita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroPago, setFiltroPago] = useState('PENDIENTE');
  const [dniFiltro, setDniFiltro] = useState('');
  const [citaSeleccionada, setCitaSeleccionada] = useState<PagoCita | null>(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [modalAccion, setModalAccion] = useState<'pagar' | 'anular'>('pagar');

  // Recargar cuando cambie el filtro de pago o el DNI
  useEffect(() => {
    cargarCitas();
  }, [filtroPago, dniFiltro]);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      // 1. Obtener TODAS las citas (sin filtro de estado)
      const data = await recepcionistaService.getCitas();

      // 2. Filtrar solo las que tienen pago asociado (pagoEstado no sea NO_REGISTRADO ni null)
      const conPago = data.filter(
        (c: PagoCita) => c.pagoEstado && c.pagoEstado !== 'NO_REGISTRADO'
      );

      // 3. Filtrar por estado de pago seleccionado
      let filtradas = conPago.filter(
        (c: PagoCita) => c.pagoEstado === filtroPago
      );

      // 4. Filtrar por DNI si se ingresó algo
      if (dniFiltro.trim()) {
        filtradas = filtradas.filter((c: PagoCita) =>
          c.pacienteDocumento?.includes(dniFiltro.trim())
        );
      }

      setCitas(filtradas);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      alert('No se pudieron cargar las citas.');
    } finally {
      setLoading(false);
    }
  };

  const registrarPago = async () => {
    if (!citaSeleccionada) return;
    try {
      await recepcionistaService.registrarPago({
        citaId: citaSeleccionada.id,
        metodoPago,
      });
      alert('✅ Pago registrado exitosamente');
      setCitaSeleccionada(null);
      cargarCitas();
    } catch (error: any) {
      console.error('Error al registrar pago:', error);
      const mensaje = error?.response?.data?.mensaje || 'Error al registrar pago.';
      alert(`❌ ${mensaje}`);
    }
  };

  const anularPago = async () => {
    if (!citaSeleccionada) return;
    if (!citaSeleccionada.pagoId) {
      alert('No se encontró el ID del pago para anular.');
      return;
    }
    try {
      await recepcionistaService.anularPago(citaSeleccionada.pagoId);
      alert('✅ Pago anulado exitosamente. Ahora está pendiente.');
      setCitaSeleccionada(null);
      cargarCitas(); // Recargar para que aparezca en pendientes
    } catch (error: any) {
      console.error('Error al anular pago:', error);
      const mensaje = error?.response?.data?.mensaje || 'Error al anular el pago.';
      alert(`❌ ${mensaje}`);
    }
  };

  const getBadgeColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'bg-warning';
      case 'CONFIRMADA': return 'bg-info';
      case 'ATENDIDA': return 'bg-success';
      case 'CANCELADA': return 'bg-danger';
      case 'NO_ASISTIO': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getPagoBadge = (pagoEstado?: string) => {
    switch (pagoEstado) {
      case 'PENDIENTE': return <span className="badge bg-warning">Pendiente</span>;
      case 'PAGADO': return <span className="badge bg-success">Pagado</span>;
      case 'ANULADO': return <span className="badge bg-danger">Anulado</span>;
      default: return <span className="badge bg-secondary">—</span>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando pagos...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
            <h5 className="mb-0">💰 Pagos</h5>
            <div className="d-flex gap-2 flex-wrap">
              {/* Input para filtrar por DNI */}
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Buscar por DNI"
                value={dniFiltro}
                onChange={(e) => setDniFiltro(e.target.value)}
                style={{ width: '150px' }}
                autoFocus
              />
              <select
                className="form-select form-select-sm"
                style={{ width: '150px' }}
                value={filtroPago}
                onChange={(e) => setFiltroPago(e.target.value)}
              >
                <option value="PENDIENTE">Pendientes</option>
                <option value="PAGADO">Pagados</option>
                <option value="ANULADO">Anulados</option>
              </select>
            </div>
          </div>

          {citas.length === 0 ? (
            <div className="alert alert-info">No hay pagos con el filtro seleccionado.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Doctor</th>
                    <th>Fecha</th>
                    <th>Hora</th>
                    <th>Monto</th>
                    <th>Estado Cita</th>
                    <th>Estado Pago</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita) => (
                    <tr key={cita.id}>
                      <td>
                        {cita.pacienteNombre}
                        {cita.pacienteDocumento && (
                          <span className="text-muted d-block small">
                            DNI: {cita.pacienteDocumento}
                          </span>
                        )}
                      </td>
                      <td>{cita.doctorNombre}</td>
                      <td>{new Date(cita.fecha).toLocaleDateString('es-PE')}</td>
                      <td>{cita.horaInicio}</td>
                      <td>S/ {cita.precioConsulta.toFixed(2)}</td>
                      <td>
                        <span className={`badge ${getBadgeColor(cita.estado)}`}>
                          {cita.estado}
                        </span>
                      </td>
                      <td>{getPagoBadge(cita.pagoEstado)}</td>
                      <td>
                        {cita.pagoEstado === 'PENDIENTE' && (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => {
                              setCitaSeleccionada(cita);
                              setModalAccion('pagar');
                            }}
                          >
                            Pagar
                          </button>
                        )}
                        {cita.pagoEstado === 'PAGADO' && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setCitaSeleccionada(cita);
                              setModalAccion('anular');
                            }}
                          >
                            Anular
                          </button>
                        )}
                        {cita.pagoEstado === 'ANULADO' && (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal Registrar Pago ─── */}
      {citaSeleccionada && modalAccion === 'pagar' && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,.5)' }}
          onClick={() => setCitaSeleccionada(null)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registrar Pago</h5>
                <button
                  className="btn-close"
                  onClick={() => setCitaSeleccionada(null)}
                />
              </div>
              <div className="modal-body">
                <p>
                  <strong>Paciente:</strong> {citaSeleccionada.pacienteNombre}
                </p>
                <p>
                  <strong>Doctor:</strong> {citaSeleccionada.doctorNombre}
                </p>
                <p>
                  <strong>Monto:</strong> S/ {citaSeleccionada.precioConsulta.toFixed(2)}
                </p>
                <div className="mb-3">
                  <label className="form-label">Método de Pago</label>
                  <select
                    className="form-select"
                    value={metodoPago}
                    onChange={(e) => setMetodoPago(e.target.value)}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA">Tarjeta</option>
                    <option value="YAPE">Yape</option>
                    <option value="PLIN">Plin</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCitaSeleccionada(null)}
                >
                  Cancelar
                </button>
                <button className="btn btn-success" onClick={registrarPago}>
                  Confirmar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal Confirmar Anulación ─── */}
      {citaSeleccionada && modalAccion === 'anular' && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,.5)' }}
          onClick={() => setCitaSeleccionada(null)}
        >
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Anular Pago</h5>
                <button
                  className="btn-close"
                  onClick={() => setCitaSeleccionada(null)}
                />
              </div>
              <div className="modal-body">
                <p>
                  <strong>Paciente:</strong> {citaSeleccionada.pacienteNombre}
                </p>
                <p>
                  <strong>Doctor:</strong> {citaSeleccionada.doctorNombre}
                </p>
                <p>
                  <strong>Monto:</strong> S/ {citaSeleccionada.precioConsulta.toFixed(2)}
                </p>
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2" />
                  ¿Estás seguro de que deseas anular este pago? El pago pasará a estado{' '}
                  <strong>PENDIENTE</strong> y podrá ser pagado nuevamente.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCitaSeleccionada(null)}
                >
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={anularPago}>
                  Confirmar Anulación
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecepcionistaPagos;