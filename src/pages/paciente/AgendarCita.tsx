// src/pages/paciente/AgendarCita.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { pacienteService } from '../../services/api';

interface Doctor {
  id: number;
  cmp: string;
  nombre: string;
  especialidad: string;
  precioConsulta: number;
  foto: string | null;
}

function AgendarCita() {
  const { doctorId } = useParams();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [fecha, setFecha] = useState('');
  const [horarios, setHorarios] = useState<string[]>([]);
  const [selectedHora, setSelectedHora] = useState('');
  const [motivo, setMotivo] = useState('');
  const [cargandoDoctor, setCargandoDoctor] = useState(true);
  const [cargandoHorarios, setCargandoHorarios] = useState(false);
  const [errorHorarios, setErrorHorarios] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ── Cargar doctor desde la lista (campo "nombre" ya viene combinado) ──
  useEffect(() => {
    const cargar = async () => {
      try {
        const doctores = await pacienteService.getDoctores();
        const encontrado = doctores.find((d: Doctor) => d.id === parseInt(doctorId!));
        if (!encontrado) throw new Error('Doctor no encontrado');
        setDoctor(encontrado);
      } catch {
        alert('No se pudo cargar el doctor.');
        navigate('/dashboard/paciente/doctores');
      } finally {
        setCargandoDoctor(false);
      }
    };
    if (doctorId) cargar();
  }, [doctorId]);

  // ── Cargar horarios cuando cambia la fecha ──
  useEffect(() => {
    if (!fecha || !doctorId) return;
    const cargar = async () => {
      setCargandoHorarios(true);
      setErrorHorarios('');
      setSelectedHora('');
      try {
        const res = await pacienteService.getHorariosDisponibles(parseInt(doctorId!), fecha);
        const disponibles = res.horariosDisponibles || [];
        setHorarios(disponibles);
        if (disponibles.length === 0) {
          setErrorHorarios('No hay horarios disponibles para esta fecha. Prueba con otro día.');
        }
      } catch {
        setErrorHorarios('Error al cargar horarios. Intenta nuevamente.');
      } finally {
        setCargandoHorarios(false);
      }
    };
    cargar();
  }, [fecha, doctorId]);

  // ── Confirmar cita desde el modal ──
  const confirmarCita = async () => {
    setLoading(true);
    try {
      // Obtener pacienteId desde localStorage
      const pacienteData = JSON.parse(localStorage.getItem('pacienteData') || '{}');
      if (!pacienteData.id) throw new Error('No se encontró el ID del paciente');

      await pacienteService.crearCita({
        pacienteId: pacienteData.id,
        doctorId: parseInt(doctorId!),
        fecha,
        horaInicio: selectedHora,
        motivoConsulta: motivo.trim(),
      });

      setShowModal(false);
      alert('✅ Cita agendada exitosamente');
      navigate('/dashboard/paciente/mis-citas');
    } catch (err: any) {
      const msg = err?.response?.data?.mensaje || err?.message || 'Error al agendar la cita.';
      alert(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const hoy = new Date().toISOString().split('T')[0];
  const maxFecha = new Date();
  maxFecha.setDate(maxFecha.getDate() + 30);

  const formatearFecha = (f: string) =>
    new Date(f + 'T00:00:00').toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

  if (cargandoDoctor) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Cargando...</p>
      </div>
    );
  }

  if (!doctor) return null;

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">

        {/* Botón volver */}
        <button
          className="btn btn-link ps-0 mb-3 text-decoration-none"
          onClick={() => navigate('/dashboard/paciente/doctores')}
        >
          ← Volver a doctores
        </button>

        {/* Info del doctor */}
        <div className="card border-0 shadow-sm mb-3">
          <div className="card-body d-flex align-items-center gap-3">
            <img
              src={doctor.foto || 'https://via.placeholder.com/64x64?text=Dr'}
              alt={doctor.nombre}
              className="rounded-circle"
              style={{ width: 64, height: 64, objectFit: 'cover', flexShrink: 0 }}
            />
            <div>
              <h5 className="mb-0 fw-bold">{doctor.nombre}</h5>
              <span className="badge bg-info me-2">{doctor.especialidad}</span>
              <div className="text-success fw-semibold mt-1">
                S/. {doctor.precioConsulta.toFixed(2)} <span className="text-muted fw-normal small">/ consulta</span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="card border-0 shadow">
          <div className="card-header bg-primary text-white">
            <h5 className="mb-0">📅 Nueva cita</h5>
          </div>
          <div className="card-body">

            {/* Paso 1: Fecha */}
            <div className="mb-4">
              <label className="form-label fw-semibold">1. Selecciona una fecha</label>
              <input
                type="date"
                className="form-control"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                min={hoy}
                max={maxFecha.toISOString().split('T')[0]}
              />
            </div>

            {/* Paso 2: Horario */}
            {fecha && (
              <div className="mb-4">
                <label className="form-label fw-semibold">2. Elige un horario</label>
                {cargandoHorarios ? (
                  <div className="text-center py-3">
                    <div className="spinner-border spinner-border-sm text-primary" />
                    <p className="text-muted small mt-1 mb-0">Buscando horarios disponibles...</p>
                  </div>
                ) : errorHorarios ? (
                  <div className="alert alert-warning py-2 mb-0">{errorHorarios}</div>
                ) : (
                  <div className="d-flex flex-wrap gap-2">
                    {horarios.map(hora => (
                      <button
                        key={hora}
                        type="button"
                        className={`btn btn-sm ${selectedHora === hora ? 'btn-primary' : 'btn-outline-primary'}`}
                        onClick={() => setSelectedHora(hora)}
                      >
                        {hora}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Paso 3: Motivo */}
            {selectedHora && (
              <div className="mb-4">
                <label className="form-label fw-semibold">3. Motivo de la consulta</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={motivo}
                  onChange={e => setMotivo(e.target.value)}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                />
              </div>
            )}

            {/* Botón para abrir modal */}
            <div className="d-flex gap-2">
              <button
                className="btn btn-primary flex-grow-1"
                disabled={!fecha || !selectedHora || !motivo.trim()}
                onClick={() => setShowModal(true)}
              >
                Revisar y confirmar →
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate('/dashboard/paciente/doctores')}
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* ── MODAL DE CONFIRMACIÓN ── */}
      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex={-1} role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow-lg">

                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">✅ Confirmar cita</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  />
                </div>

                <div className="modal-body">
                  <p className="text-muted mb-3">Revisa los datos antes de confirmar:</p>

                  <div className="list-group list-group-flush">
                    <div className="list-group-item d-flex justify-content-between px-0">
                      <span className="text-muted">Doctor</span>
                      <span className="fw-semibold">{doctor.nombre}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between px-0">
                      <span className="text-muted">Especialidad</span>
                      <span>{doctor.especialidad}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between px-0">
                      <span className="text-muted">Fecha</span>
                      <span className="fw-semibold">{formatearFecha(fecha)}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between px-0">
                      <span className="text-muted">Hora</span>
                      <span className="fw-semibold">{selectedHora}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between px-0">
                      <span className="text-muted">Motivo</span>
                      <span style={{ maxWidth: 200, textAlign: 'right' }}>{motivo}</span>
                    </div>
                    <div className="list-group-item d-flex justify-content-between px-0">
                      <span className="text-muted">Precio</span>
                      <span className="fw-bold text-success fs-5">
                        S/. {doctor.precioConsulta.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setShowModal(false)}
                    disabled={loading}
                  >
                    Editar datos
                  </button>
                  <button
                    className="btn btn-primary px-4"
                    onClick={confirmarCita}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2" />Agendando...</>
                    ) : (
                      '✅ Confirmar cita'
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => !loading && setShowModal(false)} />
        </>
      )}

    </div>
  );
}

export default AgendarCita;