// src/pages/paciente/Doctores.tsx - Añadir funcionalidades
import { useEffect, useState } from 'react';
import { pacienteService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Doctor {
  id: number;
  cmp: string;
  nombre: string;
  especialidad: string;
  especialidadId: number;
  precioConsulta: number;
  foto: string | null;
  activo: boolean;
}

function Doctores() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFiltros, setShowFiltros] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    cargarDoctores();
  }, []);

  const cargarDoctores = async () => {
    try {
      const data = await pacienteService.getDoctores();
      setDoctores(data.filter((d: Doctor) => d.activo));
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cargar los doctores. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar doctores
  const especialidades = [...new Set(doctores.map(d => d.especialidad))];

  const doctoresFiltrados = doctores.filter(d => {
    const matchesEspecialidad = selectedEspecialidad === 'all' || d.especialidad === selectedEspecialidad;
    const matchesSearch = d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         d.especialidad.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEspecialidad && matchesSearch;
  });

  // Funcionalidad: Ver perfil del doctor
  const verPerfilDoctor = (doctorId: number) => {
  navigate(`/dashboard/paciente/doctor-perfil/${doctorId}`);
};

const agendarCita = (doctorId: number) => {
  navigate(`/dashboard/paciente/agendar-cita/${doctorId}`);
};

  // Funcionalidad: Filtrar por especialidad
  const filtrarPorEspecialidad = (especialidad: string) => {
    setSelectedEspecialidad(especialidad);
    setShowFiltros(false);
  };

  // Funcionalidad: Limpiar filtros
  const limpiarFiltros = () => {
    setSelectedEspecialidad('all');
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando doctores...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Barra de búsqueda y filtros */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text">🔍</span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar doctor o especialidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-6">
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-primary"
                  onClick={() => setShowFiltros(!showFiltros)}
                >
                  🏷️ Filtros {selectedEspecialidad !== 'all' && `(${selectedEspecialidad})`}
                </button>
                {selectedEspecialidad !== 'all' && (
                  <button
                    className="btn btn-outline-danger"
                    onClick={limpiarFiltros}
                  >
                    Limpiar filtros
                  </button>
                )}
                <button
                  className="btn btn-primary ms-auto"
                  onClick={() => navigate('/dashboard/paciente/mis-citas')}
                >
                  📅 Mis Citas
                </button>
              </div>
            </div>
          </div>

          {/* Filtros expandibles */}
          {showFiltros && (
            <div className="mt-3 pt-3 border-top">
              <div className="d-flex flex-wrap gap-2">
                <button
                  className={`btn ${selectedEspecialidad === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => filtrarPorEspecialidad('all')}
                >
                  Todas
                </button>
                {especialidades.map(esp => (
                  <button
                    key={esp}
                    className={`btn ${selectedEspecialidad === esp ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => filtrarPorEspecialidad(esp)}
                  >
                    {esp}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      {doctoresFiltrados.length === 0 ? (
        <div className="card shadow-sm border-0">
          <div className="card-body text-center py-5">
            <div className="display-1 mb-3">🔍</div>
            <h4>No se encontraron doctores</h4>
            <p className="text-muted">
              {searchTerm || selectedEspecialidad !== 'all' 
                ? 'Intenta con otros criterios de búsqueda o elimina los filtros.'
                : 'No hay doctores disponibles en este momento.'
              }
            </p>
            {(searchTerm || selectedEspecialidad !== 'all') && (
              <button
                className="btn btn-primary"
                onClick={limpiarFiltros}
              >
                Ver todos los doctores
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="row g-4">
          {doctoresFiltrados.map(doctor => (
            <div key={doctor.id} className="col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm hover-shadow">
                <img
                  src={doctor.foto || 'https://via.placeholder.com/150x150?text=Doctor'}
                  className="card-img-top"
                  alt={doctor.nombre}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="card-body">
                  <h5 className="card-title">{doctor.nombre}</h5>
                  <p className="card-text">
                    <span className="badge bg-info me-2">{doctor.especialidad}</span>
                    <span className="badge bg-success">CMP: {doctor.cmp}</span>
                  </p>
                  <p className="card-text text-muted small">
                    💰 S/. {doctor.precioConsulta.toFixed(2)}
                  </p>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => agendarCita(doctor.id)}
                    >
                      📅 Agendar Cita
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm"
                      onClick={() => verPerfilDoctor(doctor.id)}
                    >
                      👤 Ver Perfil
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contador de resultados */}
      {doctoresFiltrados.length > 0 && (
        <div className="mt-4 text-muted text-center">
          Mostrando {doctoresFiltrados.length} de {doctores.length} doctores
        </div>
      )}
    </div>
  );
}

export default Doctores;