// src/pages/admin/AdminDoctores.tsx
import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';

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

interface Especialidad {
  id: number;
  nombre: string;
}

function AdminDoctores() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [editando, setEditando] = useState<Doctor | null>(null);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    cmp: '',
    especialidadId: 0,
    precioConsulta: 0,
    telefono: '',
    foto: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [doctoresData, especialidadesData] = await Promise.all([
        adminService.getDoctores(),
        adminService.getEspecialidades(),
      ]);
      setDoctores(doctoresData);
      setEspecialidades(especialidadesData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editando) {
        await adminService.actualizarDoctor(editando.id, {
          precioConsulta: formData.precioConsulta,
          especialidadId: formData.especialidadId,
          foto: formData.foto,
        });
        alert('✅ Doctor actualizado');
      } else {
        await adminService.crearDoctor(formData);
        alert('✅ Doctor creado');
      }
      setMostrarModal(false);
      setEditando(null);
      setFormData({ nombres: '', apellidos: '', email: '', cmp: '', especialidadId: 0, precioConsulta: 0, telefono: '', foto: '' });
      cargarDatos();
    } catch (err: any) {
      alert(err?.response?.data?.mensaje || 'Error al guardar doctor.');
    }
  };

  const toggleActivo = async (doctor: Doctor) => {
    if (!window.confirm(`¿${doctor.activo ? 'Desactivar' : 'Activar'} a ${doctor.nombre}?`)) return;
    try {
      await adminService.actualizarDoctor(doctor.id, { activo: !doctor.activo });
      cargarDatos();
    } catch (err: any) {
      alert(err?.response?.data?.mensaje || 'Error al actualizar doctor.');
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0">👨‍⚕️ Doctores</h5>
            <button className="btn btn-primary btn-sm" onClick={() => { setEditando(null); setMostrarModal(true); }}>
              <i className="bi bi-plus-circle me-1"></i> Nuevo Doctor
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>CMP</th>
                  <th>Nombre</th>
                  <th>Especialidad</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {doctores.map((d) => (
                  <tr key={d.id}>
                    <td>{d.id}</td>
                    <td>{d.cmp}</td>
                    <td>{d.nombre}</td>
                    <td>{d.especialidad}</td>
                    <td>S/ {d.precioConsulta.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${d.activo ? 'bg-success' : 'bg-danger'}`}>
                        {d.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary me-1"
                        onClick={() => {
                          setEditando(d);
                          setFormData({
                            nombres: d.nombre.split(' ')[0] || '',
                            apellidos: d.nombre.split(' ').slice(1).join(' ') || '',
                            email: '',
                            cmp: d.cmp,
                            especialidadId: d.especialidadId,
                            precioConsulta: d.precioConsulta,
                            telefono: '',
                            foto: d.foto || '',
                          });
                          setMostrarModal(true);
                        }}
                      >
                        Editar
                      </button>
                      <button
                        className={`btn btn-sm ${d.activo ? 'btn-outline-danger' : 'btn-outline-success'}`}
                        onClick={() => toggleActivo(d)}
                      >
                        {d.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {mostrarModal && (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,.5)' }}>
          <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editando ? 'Editar Doctor' : 'Nuevo Doctor'}</h5>
                <button className="btn-close" onClick={() => setMostrarModal(false)} />
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Nombres *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.nombres}
                        onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Apellidos *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.apellidos}
                        onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
                        required
                      />
                    </div>
                    {!editando && (
                      <>
                        <div className="col-md-6">
                          <label className="form-label">Email *</label>
                          <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">CMP *</label>
                          <input
                            type="text"
                            className="form-control"
                            value={formData.cmp}
                            onChange={(e) => setFormData({ ...formData, cmp: e.target.value })}
                            required
                          />
                        </div>
                      </>
                    )}
                    <div className="col-md-6">
                      <label className="form-label">Especialidad *</label>
                      <select
                        className="form-select"
                        value={formData.especialidadId}
                        onChange={(e) => setFormData({ ...formData, especialidadId: Number(e.target.value) })}
                        required
                      >
                        <option value="">Seleccionar</option>
                        {especialidades.map((e) => (
                          <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Precio Consulta (S/) *</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.precioConsulta}
                        onChange={(e) => setFormData({ ...formData, precioConsulta: Number(e.target.value) })}
                        min="1"
                        step="0.01"
                        required
                      />
                    </div>
                    {!editando && (
                      <div className="col-md-12">
                        <label className="form-label">Teléfono</label>
                        <input
                          type="tel"
                          className="form-control"
                          value={formData.telefono}
                          onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                        />
                      </div>
                    )}
                    <div className="col-md-12">
                      <label className="form-label">Foto (URL)</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.foto}
                        onChange={(e) => setFormData({ ...formData, foto: e.target.value })}
                        placeholder="https://ejemplo.com/foto.jpg"
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setMostrarModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary">Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDoctores;