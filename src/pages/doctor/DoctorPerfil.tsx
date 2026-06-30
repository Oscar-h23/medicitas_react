import { useEffect, useState } from 'react';
import { doctorService, especialidadService } from '../../services/api';

interface PerfilDoctor {
  usuario: {
    id: number;
    email: string;
    rol: string;
    activo: boolean;
  };
  persona: {
    id: number;
    nombres: string;
    apellidos: string;
    tipoDocumento: string;
    numeroDocumento: string;
    telefono: string;
    fechaNacimiento: string | null;
    sexo: string | null;
  };
  doctor: {
    id: number;
    cmp: string;
    especialidadId: number;
    especialidadNombre: string;
    precioConsulta: number;
    foto: string | null;
    activo: boolean;
  };
}

function DoctorPerfil() {
  const [perfil, setPerfil] = useState<PerfilDoctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    especialidadId: 0,
    precioConsulta: 0,
    foto: '',
    password: '',
    confirmPassword: '',
  });

  const [especialidades, setEspecialidades] = useState<{ id: number; nombre: string }[]>([]);

  useEffect(() => {
    cargarPerfil();
    cargarEspecialidades();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await doctorService.getPerfilCompleto();

      // Validar que la respuesta tenga la estructura esperada
      if (!data || !data.persona || !data.doctor || !data.usuario) {
        throw new Error('La respuesta del servidor no tiene la estructura esperada');
      }

      setPerfil(data);

      // Rellenar formulario con datos del perfil
      setFormData({
        nombres: data.persona.nombres || '',
        apellidos: data.persona.apellidos || '',
        email: data.usuario.email || '',
        telefono: data.persona.telefono || '',
        especialidadId: data.doctor.especialidadId || 0,
        precioConsulta: data.doctor.precioConsulta || 0,
        foto: data.doctor.foto || '',
        password: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      console.error('Error al cargar perfil:', err);
      setError(err.message || 'No se pudo cargar el perfil del doctor. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  const cargarEspecialidades = async () => {
    try {
      const data = await especialidadService.getAll();
      setEspecialidades(data);
    } catch (err) {
      console.error('Error al cargar especialidades:', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'precioConsulta' || name === 'especialidadId' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombres.trim() || !formData.apellidos.trim()) {
      alert('Nombres y apellidos son obligatorios.');
      return;
    }
    if (!formData.email.trim()) {
      alert('El email es obligatorio.');
      return;
    }
    if (!formData.especialidadId) {
      alert('Debes seleccionar una especialidad.');
      return;
    }
    if (formData.precioConsulta <= 0) {
      alert('El precio de consulta debe ser mayor a 0.');
      return;
    }
    if (formData.password && formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden.');
      return;
    }
    if (formData.password && formData.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setGuardando(true);

    try {
      const datosEnviar: {
        nombres: string;
        apellidos: string;
        email: string;
        telefono: string;
        especialidadId: number;
        precioConsulta: number;
        foto?: string;
        password?: string;
        confirmPassword?: string;
      } = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
        especialidadId: formData.especialidadId,
        precioConsulta: formData.precioConsulta,
        foto: formData.foto || undefined,
      };

      if (formData.password.trim()) {
        datosEnviar.password = formData.password;
        datosEnviar.confirmPassword = formData.confirmPassword;
      }

      await doctorService.actualizarPerfil(datosEnviar);

      alert('✅ Perfil actualizado correctamente');
      setEditando(false);
      await cargarPerfil(); // Recargar datos frescos
    } catch (err: any) {
      console.error('Error al guardar perfil:', err);
      const mensaje = err?.response?.data?.mensaje || 'Error al actualizar el perfil.';
      alert(`❌ ${mensaje}`);
    } finally {
      setGuardando(false);
    }
  };

  const cancelarEdicion = () => {
    setEditando(false);
    if (perfil) {
      setFormData({
        nombres: perfil.persona.nombres || '',
        apellidos: perfil.persona.apellidos || '',
        email: perfil.usuario.email || '',
        telefono: perfil.persona.telefono || '',
        especialidadId: perfil.doctor.especialidadId || 0,
        precioConsulta: perfil.doctor.precioConsulta || 0,
        foto: perfil.doctor.foto || '',
        password: '',
        confirmPassword: '',
      });
    }
  };

  // ─── Render ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger m-4">
        <h5>❌ Error al cargar el perfil</h5>
        <p>{error}</p>
        <button className="btn btn-primary" onClick={cargarPerfil}>
          Reintentar
        </button>
      </div>
    );
  }

  // 🔥 Verificación de seguridad: si perfil es null, mostrar mensaje de error
  if (!perfil) {
    return (
      <div className="alert alert-warning m-4">
        No se pudieron cargar los datos del perfil. Por favor, intenta de nuevo más tarde.
      </div>
    );
  }

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">👨‍⚕️ Mi Perfil</h4>
            {!editando && (
              <button className="btn btn-primary" onClick={() => setEditando(true)}>
                <i className="bi bi-pencil me-2" />
                Editar Perfil
              </button>
            )}
          </div>

          {!editando ? (
            // ─── MODO VISUALIZACIÓN ───
            <div className="row">
              <div className="col-md-6">
                <p><strong>Nombres:</strong> {perfil.persona.nombres}</p>
                <p><strong>Apellidos:</strong> {perfil.persona.apellidos}</p>
                <p><strong>Email:</strong> {perfil.usuario.email}</p>
                <p><strong>Teléfono:</strong> {perfil.persona.telefono || 'No registrado'}</p>
                <p><strong>CMP:</strong> {perfil.doctor.cmp}</p>
                <p><strong>Especialidad:</strong> {perfil.doctor.especialidadNombre}</p>
                <p><strong>Precio Consulta:</strong> S/ {perfil.doctor.precioConsulta.toFixed(2)}</p>
                <p><strong>Estado:</strong> {perfil.doctor.activo ? 'Activo' : 'Inactivo'}</p>
                {perfil.persona.fechaNacimiento && (
                  <p><strong>Fecha Nacimiento:</strong> {new Date(perfil.persona.fechaNacimiento).toLocaleDateString('es-PE')}</p>
                )}
                {perfil.persona.sexo && (
                  <p><strong>Sexo:</strong> {perfil.persona.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
                )}
              </div>
              <div className="col-md-6 text-center">
  <div
    className="d-inline-block"
    style={{
      width: '200px',
      height: '200px',
      borderRadius: '50%',
      overflow: 'hidden',
      border: '3px solid #dee2e6',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      backgroundColor: '#f8f9fa',
    }}
  >
    {perfil.doctor.foto ? (
      <img
        src={perfil.doctor.foto}
        alt="Foto del doctor"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    ) : (
      <div
        className="d-flex align-items-center justify-content-center"
        style={{ width: '100%', height: '100%' }}
      >
        <span className="display-1 text-secondary" style={{ fontSize: '5rem' }}>
          👤
        </span>
      </div>
    )}
  </div>
</div>
            </div>
          ) : (
            // ─── MODO EDICIÓN ───
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Nombres</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombres"
                      value={formData.nombres}
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
                      value={formData.apellidos}
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
                      value={formData.email}
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
                      value={formData.telefono}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Especialidad</label>
                    <select
                      className="form-select"
                      name="especialidadId"
                      value={formData.especialidadId}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona una especialidad</option>
                      {especialidades.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Precio Consulta (S/)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="precioConsulta"
                      value={formData.precioConsulta}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Foto (URL)</label>
                    <input
                      type="text"
                      className="form-control"
                      name="foto"
                      value={formData.foto}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com/foto.jpg"
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="fw-bold">Cambiar Contraseña</h6>
                      <p className="text-muted small">
                        Deja vacío si no deseas cambiarla.
                      </p>

                      <div className="mb-3">
                        <label className="form-label">Nueva Contraseña</label>
                        <input
                          type="password"
                          className="form-control"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Mínimo 6 caracteres"
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Confirmar Contraseña</label>
                        <input
                          type="password"
                          className="form-control"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Repite la contraseña"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-muted small">
                    <p>
                      <strong>CMP:</strong> {perfil.doctor.cmp}
                    </p>
                    <p>
                      <strong>Documento:</strong> {perfil.persona.tipoDocumento} {perfil.persona.numeroDocumento}
                    </p>
                    <p>
                      <strong>Estado:</strong> {perfil.doctor.activo ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-success" disabled={guardando}>
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={cancelarEdicion}
                  disabled={guardando}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default DoctorPerfil;