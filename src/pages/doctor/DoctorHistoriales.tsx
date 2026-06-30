import { useEffect, useState } from 'react';
import { doctorService } from '../../services/api';

// ============================================================
// INTERFACES
// ============================================================

interface Consulta {
  id: number;
  historiaClinicaId: number;
  citaId: number;
  doctorId: number;
  motivoConsulta: string;
  sintomas: string | null;
  diagnosticoGeneral: string;
  tratamiento: string;
  observaciones: string | null;
  signosVitales: any;
  fecha_consulta: string;
  doctorNombre: string;
  doctorCmp: string;
}

interface PacienteHistorial {
  paciente: {
    id: number;
    historiaClinica: string;
    nombres: string;
    apellidos: string;
    documento: string;
    telefono: string;
  };
  totalConsultas: number;
  consultas: Consulta[];
}

function DoctorHistoriales() {
  const [historiales, setHistoriales] = useState<PacienteHistorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [pacienteExpandido, setPacienteExpandido] = useState<number | null>(null);

  useEffect(() => {
    cargarHistoriales();
  }, []);

  const cargarHistoriales = async () => {
    try {
      setLoading(true);
      const data = await doctorService.getHistoriales();
      setHistoriales(data);
    } catch (error) {
      console.error('Error al cargar historiales:', error);
      alert('No se pudieron cargar los historiales clínicos.');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandir = (pacienteId: number) => {
    setPacienteExpandido(pacienteExpandido === pacienteId ? null : pacienteId);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando historiales...</p>
      </div>
    );
  }

  if (historiales.length === 0) {
    return (
      <div className="alert alert-info">
        No tienes pacientes con historial clínico registrado.
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm">
        <div className="card-body">
          <h4 className="mb-4">📋 Historial Clínico de Pacientes</h4>

          <div className="row">
            {historiales.map((item) => (
              <div key={item.paciente.id} className="col-12 mb-3">
                <div className="card">
                  <div
                    className="card-header bg-light d-flex justify-content-between align-items-center"
                    style={{ cursor: 'pointer' }}
                    onClick={() => toggleExpandir(item.paciente.id)}
                  >
                    <div>
                      <strong>
                        {item.paciente.nombres} {item.paciente.apellidos}
                      </strong>
                      <span className="ms-3 text-muted">
                        HC: {item.paciente.historiaClinica}
                      </span>
                      <span className="ms-3 text-muted">
                        📄 {item.totalConsultas} consultas
                      </span>
                    </div>
                    <span>
                      {pacienteExpandido === item.paciente.id ? '▲' : '▼'}
                    </span>
                  </div>

                  {pacienteExpandido === item.paciente.id && (
                    <div className="card-body">
                      <div className="row mb-3">
                        <div className="col-md-6">
                          <p><strong>Documento:</strong> {item.paciente.documento}</p>
                          <p><strong>Teléfono:</strong> {item.paciente.telefono}</p>
                        </div>
                      </div>

                      {item.consultas.length === 0 ? (
                        <div className="alert alert-warning">
                          Este paciente no tiene consultas registradas.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-hover table-sm">
                            <thead>
                              <tr>
                                <th>Fecha</th>
                                <th>Doctor</th>
                                <th>Motivo</th>
                                <th>Diagnóstico</th>
                                <th>Tratamiento</th>
                                <th>Observaciones</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.consultas.map((consulta) => (
                                <tr key={consulta.id}>
                                  <td>{formatearFecha(consulta.fecha_consulta)}</td>
                                  <td>{consulta.doctorNombre}</td>
                                  <td>{consulta.motivoConsulta}</td>
                                  <td>{consulta.diagnosticoGeneral}</td>
                                  <td>{consulta.tratamiento}</td>
                                  <td>{consulta.observaciones || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorHistoriales;