import { useEffect, useState } from 'react';
import { recepcionistaService } from '../../services/api';

interface Paciente {
  id: number;
  historiaClinica: string;
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string;
  email: string;
  seguro: string;
}

function RecepcionistaPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  // Estado para nuevo paciente
  const [nuevoPaciente, setNuevoPaciente] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    numeroDocumento: '',
    telefono: '',
    fechaNacimiento: '',
    password: '123456',
  });

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const data = await recepcionistaService.listarPacientes();
      setPacientes(data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      alert('No se pudieron cargar los pacientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNuevoPaciente((prev) => ({ ...prev, [name]: value }));
  };

  const crearPaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recepcionistaService.crearPaciente(nuevoPaciente);
      alert('✅ Paciente creado exitosamente');
      setMostrarModal(false);
      setNuevoPaciente({
        nombres: '',
        apellidos: '',
        email: '',
        numeroDocumento: '',
        telefono: '',
        fechaNacimiento: '',
        password: '123456',
      });
      cargarPacientes();
    } catch (error: any) {
      console.error('Error al crear paciente:', error);
      alert(error?.response?.data?.mensaje || 'Error al crear paciente.');
    }
  };

  const pacientesFiltrados = pacientes.filter((p) =>
    p.documento.includes(busqueda) ||
    p.nombres.toLowerCase().includes(busqueda.toLowerCase()) ||
    p.apellidos.toLowerCase().includes(busqueda.toLowerCase())
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando pacientes...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">👥 Pacientes</h5>
            <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>
              <i className="bi bi-plus-circle me-2" />Nuevo Paciente
            </button>
          </div>

          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por documento, nombre o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>HC</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Seguro</th>
                </tr>
              </thead>
              <tbody>
                {pacientesFiltrados.map((p) => (
                  <tr key={p.id}>
                    <td>{p.historiaClinica}</td>
                    <td>{p.nombres}</td>
                    <td>{p.apellidos}</td>
                    <td>{p.documento}</td>
                    <td>{p.telefono}</td>
                    <td>{p.email}</td>
                    <td>{p.seguro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal para crear paciente */}
      {mostrarModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Nuevo Paciente</h5>
                <button className="btn-close" onClick={() => setMostrarModal(false)} />
              </div>
              <form onSubmit={crearPaciente}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nombres</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombres"
                      value={nuevoPaciente.nombres}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Apellidos</label>
                    <input
                      type="text"
                      className="form-control"
                      name="apellidos"
                      value={nuevoPaciente.apellidos}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={nuevoPaciente.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Documento</label>
                    <input
                      type="text"
                      className="form-control"
                      name="numeroDocumento"
                      value={nuevoPaciente.numeroDocumento}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      className="form-control"
                      name="telefono"
                      value={nuevoPaciente.telefono}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Fecha Nacimiento</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fechaNacimiento"
                      value={nuevoPaciente.fechaNacimiento}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Contraseña (por defecto 123456)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="password"
                      value={nuevoPaciente.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-success">
                    Crear Paciente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RecepcionistaPacientes;