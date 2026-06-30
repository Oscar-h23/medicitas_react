import { useEffect, useState } from 'react';
import { doctorService } from '../../services/api';

interface Cita {
  id: number;
  pacienteId: number;
  pacienteNombre: string;
  fecha: string;
  horaInicio: string;
  motivoConsulta: string;
  estado: string;
}

function DoctorConsultas() {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [citaSeleccionada, setCitaSeleccionada] = useState<Cita | null>(null);
  const [detalleCita, setDetalleCita] = useState<any>(null);
  const [diagnostico, setDiagnostico] = useState('');
  const [tratamiento, setTratamiento] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargarCitas();
  }, []);

  const cargarCitas = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getCitasHoy();
      console.log('📅 Citas de hoy:', data);
      // Mostrar pendientes y confirmadas
      const pendientes = data.filter(
        (c: Cita) => c.estado === 'PENDIENTE' || c.estado === 'CONFIRMADA'
      );
      setCitas(pendientes);
    } catch (error) {
      console.error('Error al cargar citas:', error);
      alert('No se pudieron cargar las citas de hoy.');
    } finally {
      setLoading(false);
    }
  };

  const abrirConsulta = async (cita: Cita) => {
    try {
      const detalle = await doctorService.getDetalleCita(cita.id);
      if (!detalle?.paciente) {
        throw new Error('La cita no tiene información del paciente');
      }
      setDetalleCita(detalle);
      setCitaSeleccionada(cita);
      setDiagnostico('');
      setTratamiento('');
      setObservaciones('');
      setMostrarModal(true);
    } catch (error) {
      console.error('Error al cargar detalle:', error);
      alert('No se pudo cargar la información del paciente.');
    }
  };

  const guardarConsulta = async () => {
    if (!citaSeleccionada) {
      alert('No hay cita seleccionada');
      return;
    }
    if (!diagnostico.trim() || !tratamiento.trim()) {
      alert('El diagnóstico y el tratamiento son obligatorios.');
      return;
    }
    setGuardando(true);
    try {
      await doctorService.atenderPaciente(citaSeleccionada.id, {
        diagnostico,
        tratamiento,
        observaciones,
        sintomas: '',
        signosVitales: null,
      });
      alert('✅ Consulta registrada correctamente');
      setMostrarModal(false);
      setDetalleCita(null);
      setCitaSeleccionada(null);
      await cargarCitas();
    } catch (error: any) {
      console.error('Error al guardar consulta:', error);
      const mensaje = error?.response?.data?.mensaje || 'Error al registrar la consulta.';
      alert(`❌ ${mensaje}`);
    } finally {
      setGuardando(false);
    }
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setDetalleCita(null);
    setCitaSeleccionada(null);
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
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h4 className="mb-4">👨‍⚕️ Atender Pacientes</h4>
          {citas.length === 0 ? (
            <div className="alert alert-info">No hay pacientes pendientes para hoy.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>Hora</th>
                    <th>Motivo</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map((cita) => (
                    <tr key={cita.id}>
                      <td>{cita.pacienteNombre}</td>
                      <td>{cita.horaInicio}</td>
                      <td>{cita.motivoConsulta}</td>
                      <td>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => abrirConsulta(cita)}
                        >
                          Atender
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

      {mostrarModal && detalleCita && (
        <div
          className="modal d-block"
          style={{ background: 'rgba(0,0,0,.5)' }}
          onClick={cerrarModal}
        >
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Consulta Médica</h5>
                <button
                  className="btn-close"
                  onClick={cerrarModal}
                  disabled={guardando}
                />
              </div>
              <div className="modal-body">
                {detalleCita && (
                  <div className="card bg-light mb-4">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Información del paciente</h6>
                      <div className="row">
                        <div className="col-md-6">
                          <p><strong>Paciente:</strong><br />{detalleCita.paciente.nombres} {detalleCita.paciente.apellidos}</p>
                          <p><strong>Documento:</strong><br />{detalleCita.paciente.documento}</p>
                          <p><strong>Historia Clínica:</strong><br />{detalleCita.paciente.historiaClinica}</p>
                          <p><strong>Seguro:</strong><br />{detalleCita.paciente.seguro || 'No registra'}</p>
                        </div>
                        <div className="col-md-6">
                          <p><strong>Teléfono:</strong><br />{detalleCita.paciente.telefono}</p>
                          <p><strong>Email:</strong><br />{detalleCita.paciente.email}</p>
                          <p><strong>Alergias:</strong><br />{detalleCita.paciente.alergias || 'Ninguna'}</p>
                          <p><strong>Motivo de consulta:</strong><br />{detalleCita.motivoConsulta}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Diagnóstico</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={diagnostico}
                    onChange={(e) => setDiagnostico(e.target.value)}
                    disabled={guardando}
                    placeholder="Escribe el diagnóstico..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Tratamiento</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={tratamiento}
                    onChange={(e) => setTratamiento(e.target.value)}
                    disabled={guardando}
                    placeholder="Indica el tratamiento..."
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Observaciones</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    disabled={guardando}
                    placeholder="Observaciones adicionales (opcional)"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={cerrarModal}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-success"
                  onClick={guardarConsulta}
                  disabled={guardando}
                >
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Guardando...
                    </>
                  ) : (
                    'Finalizar Consulta'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorConsultas;