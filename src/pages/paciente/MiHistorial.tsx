// src/pages/paciente/MiHistorial.tsx
import { useEffect, useState } from 'react';
import { pacienteService } from '../../services/api';

interface Consulta {
  id: number;
  fecha: string;
  motivo: string;
  diagnostico: string;
  tratamiento: string;
  doctor: string;
  signosVitales: {
    presion?: string;
    temperatura?: string;
    frecuenciaCardiaca?: string;
    peso?: string;
    talla?: string;
  } | null;
}

interface HistorialData {
  paciente: {
    id: number;
    historiaClinica: string;
  };
  consultas: Consulta[];
}

function MiHistorial() {
  const [historial, setHistorial] = useState<HistorialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const data = await pacienteService.getMiHistorial();
      setHistorial(data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const consultasFiltradas = historial?.consultas.filter(consulta =>
    consulta.motivo.toLowerCase().includes(filter.toLowerCase()) ||
    consulta.diagnostico?.toLowerCase().includes(filter.toLowerCase()) ||
    consulta.doctor.toLowerCase().includes(filter.toLowerCase())
  ) || [];

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando historial médico...</p>
      </div>
    );
  }

  if (!historial || historial.consultas.length === 0) {
    return (
      <div className="alert alert-info">
        <h5>📋 No tienes historial médico registrado</h5>
        <p className="mb-0">Tus consultas aparecerán aquí una vez que tengas citas atendidas.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Cabecera del historial */}
      <div className="card bg-primary text-white mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-1">📋 Historial Clínico</h4>
              <p className="mb-0 opacity-75">
                Historia Clínica: {historial.paciente.historiaClinica}
              </p>
            </div>
            <div className="text-end">
              <div className="display-6">{historial.consultas.length}</div>
              <small>Consultas totales</small>
            </div>
          </div>
        </div>
      </div>

      {/* Filtro de búsqueda */}
      <div className="mb-4">
        <div className="input-group">
          <span className="input-group-text">🔍</span>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por motivo, diagnóstico o doctor..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => setFilter('')}
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de consultas */}
      <div className="timeline">
        {consultasFiltradas.map((consulta) => (
          <div key={consulta.id} className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="mb-2">
                    <span className="badge bg-primary">
                      {new Date(consulta.fecha).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div className="text-muted small">
                    <div>👨‍⚕️ {consulta.doctor}</div>
                    <div>🆔 #{consulta.id}</div>
                  </div>
                </div>
                <div className="col-md-9">
                  <h6 className="mb-2">Motivo: {consulta.motivo}</h6>
                  
                  {consulta.diagnostico && (
                    <div className="mb-2">
                      <span className="badge bg-warning text-dark">Diagnóstico</span>
                      <p className="mt-1">{consulta.diagnostico}</p>
                    </div>
                  )}

                  {consulta.tratamiento && (
                    <div className="mb-2">
                      <span className="badge bg-success">Tratamiento</span>
                      <p className="mt-1">{consulta.tratamiento}</p>
                    </div>
                  )}

                  {consulta.signosVitales && (
                    <div className="mt-2">
                      <span className="badge bg-info">Signos Vitales</span>
                      <div className="row mt-1 small">
                        {consulta.signosVitales.presion && (
                          <div className="col-auto">
                            <span className="text-muted">Presión:</span> {consulta.signosVitales.presion}
                          </div>
                        )}
                        {consulta.signosVitales.temperatura && (
                          <div className="col-auto">
                            <span className="text-muted">Temp:</span> {consulta.signosVitales.temperatura}
                          </div>
                        )}
                        {consulta.signosVitales.frecuenciaCardiaca && (
                          <div className="col-auto">
                            <span className="text-muted">FC:</span> {consulta.signosVitales.frecuenciaCardiaca}
                          </div>
                        )}
                        {consulta.signosVitales.peso && (
                          <div className="col-auto">
                            <span className="text-muted">Peso:</span> {consulta.signosVitales.peso}
                          </div>
                        )}
                        {consulta.signosVitales.talla && (
                          <div className="col-auto">
                            <span className="text-muted">Talla:</span> {consulta.signosVitales.talla}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {consultasFiltradas.length === 0 && (
        <div className="alert alert-warning">
          No se encontraron consultas con el filtro aplicado.
        </div>
      )}
    </div>
  );
}

export default MiHistorial;