// src/pages/admin/AdminPerfil.tsx
import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';


/* ======================================================
   TIPOS
   ====================================================== */

interface PerfilData {
  id: number;
  email: string;
  rol: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
  numeroDocumento: string;
  sexo: string;
  direccion: string;
  distrito: string;
  grupoSanguineo: string;
  alergias: string;
  contactoEmergencia: string;
  telefonoEmergencia: string;
}

// Valores por defecto
const DEFAULT_PERFIL: PerfilData = {
  id: 0,
  email: '',
  rol: '',
  nombres: '',
  apellidos: '',
  telefono: '',
  fechaNacimiento: '',
  numeroDocumento: '',
  sexo: '',
  direccion: '',
  distrito: '',
  grupoSanguineo: '',
  alergias: '',
  contactoEmergencia: '',
  telefonoEmergencia: '',
};

/* ======================================================
   COMPONENTE
   ====================================================== */

function AdminPerfil() {
  // Eliminamos 'usuario' porque no se usa
  // const { usuario } = useAuth(); ← ELIMINADO

  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState<PerfilData | null>(null);

  // Estados para la contraseña
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    cargarPerfil();
  }, []);

  /* ────────────────────────────────────────────────────
     1. CARGAR perfil (todo desde el backend)
     ──────────────────────────────────────────────────── */
  const cargarPerfil = async () => {
    setLoading(true);
    setError(null);
    try {
      // ✅ Usamos adminService.getPerfil() que debe existir
      const data = await adminService.getPerfil();
      const perfilCompleto: PerfilData = {
        ...DEFAULT_PERFIL,
        ...data,
      };
      setPerfil(perfilCompleto);
      setFormData(perfilCompleto);
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Error al cargar perfil:', err);
      setError('No se pudo cargar el perfil. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  /* ────────────────────────────────────────────────────
     2. GUARDAR (todo al backend)
     ──────────────────────────────────────────────────── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!perfil || !formData) return;

    // Validar contraseña si se proporcionó
    if (password || confirmPassword) {
      if (password.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }
    }

    setGuardando(true);

    try {
      const payload: any = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        telefono: formData.telefono,
        fechaNacimiento: formData.fechaNacimiento,
        numeroDocumento: formData.numeroDocumento,
        sexo: formData.sexo,
        direccion: formData.direccion,
        distrito: formData.distrito,
        grupoSanguineo: formData.grupoSanguineo,
        alergias: formData.alergias,
        contactoEmergencia: formData.contactoEmergencia,
        telefonoEmergencia: formData.telefonoEmergencia,
      };

      if (password) {
        payload.password = password;
        payload.confirmPassword = confirmPassword;
      }

      // ✅ Usamos adminService.actualizarPerfil() que debe existir
      const respuesta = await adminService.actualizarPerfil(payload);

      const perfilActualizado: PerfilData = {
        ...DEFAULT_PERFIL,
        ...respuesta.usuario,
      };

      setPerfil(perfilActualizado);
      setFormData(perfilActualizado);
      setEditando(false);
      setPassword('');
      setConfirmPassword('');
      alert('✅ Perfil actualizado correctamente.');
    } catch (err: any) {
      console.error(err);
      alert(err?.response?.data?.mensaje || '❌ Error al guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setFormData(perfil);
    setPassword('');
    setConfirmPassword('');
  };

  /* ────────────────────────────────────────────────────
     RENDER
     ──────────────────────────────────────────────────── */

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Cargando perfil...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger d-flex align-items-center gap-2">
        <span>⚠️ {error}</span>
        <button className="btn btn-sm btn-outline-danger ms-auto" onClick={cargarPerfil}>
          Reintentar
        </button>
      </div>
    );
  }

  if (!perfil || !formData) return null;

  const camposVista = [
    { label: 'Nombres', value: perfil.nombres },
    { label: 'Apellidos', value: perfil.apellidos },
    { label: 'Email', value: perfil.email },
    { label: 'Rol', value: perfil.rol },
    { label: 'Teléfono', value: perfil.telefono || 'No registrado' },
    { label: 'Fecha de nacimiento', value: perfil.fechaNacimiento || 'No registrada' },
    { label: 'DNI', value: perfil.numeroDocumento || 'No registrado' },
    {
      label: 'Sexo',
      value:
        perfil.sexo === 'M'
          ? 'Masculino'
          : perfil.sexo === 'F'
          ? 'Femenino'
          : 'No registrado',
    },
    { label: 'Dirección', value: perfil.direccion || 'No registrada' },
    { label: 'Distrito', value: perfil.distrito || 'No registrado' },
    { label: 'Grupo sanguíneo', value: perfil.grupoSanguineo || 'No registrado' },
    { label: 'Alergias', value: perfil.alergias || 'Ninguna' },
    { label: 'Contacto emergencia', value: perfil.contactoEmergencia || 'No registrado' },
    { label: 'Teléfono emergencia', value: perfil.telefonoEmergencia || 'No registrado' },
  ];

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        {/* ── Tarjeta principal ─────────────────────── */}
        <div className="card shadow border-0 mb-4">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">👤 Mi perfil</h5>
            {!editando && (
              <button className="btn btn-light btn-sm" onClick={() => setEditando(true)}>
                ✏️ Editar
              </button>
            )}
          </div>

          <div className="card-body">
            {editando ? (
              /* ── Formulario de edición ─────────────── */
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  {/* Sección: datos personales */}
                  <div className="col-12">
                    <span className="badge bg-primary-subtle text-primary-emphasis">
                      📡 Datos personales
                    </span>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Nombres *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="nombres"
                      value={formData.nombres || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Apellidos *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="apellidos"
                      value={formData.apellidos || ''}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={formData.email || ''}
                      disabled
                    />
                    <div className="form-text text-muted">El email no se puede modificar.</div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="telefono"
                      value={formData.telefono || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Fecha de nacimiento</label>
                    <input
                      type="date"
                      className="form-control"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">DNI</label>
                    <input
                      type="text"
                      className="form-control"
                      name="numeroDocumento"
                      value={formData.numeroDocumento || ''}
                      onChange={handleChange}
                      maxLength={8}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Sexo</label>
                    <select
                      className="form-select"
                      name="sexo"
                      value={formData.sexo || ''}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar</option>
                      <option value="M">Masculino</option>
                      <option value="F">Femenino</option>
                    </select>
                  </div>

                  {/* 🔥 SECCIÓN: Cambiar Contraseña */}
                  <div className="col-12 mt-3">
                    <hr />
                    <span className="badge bg-warning text-dark">
                      🔑 Cambiar Contraseña
                    </span>
                    <p className="text-muted small mt-1">
                      Deja los campos vacíos si no deseas cambiar tu contraseña.
                    </p>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Nueva Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      minLength={6}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Confirmar Contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      minLength={6}
                    />
                  </div>

                  {/* Sección: información adicional */}
                  <div className="col-12 mt-2">
                    <hr />
                    <span className="badge bg-secondary-subtle text-secondary-emphasis">
                      📋 Información adicional
                    </span>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Dirección</label>
                    <input
                      type="text"
                      className="form-control"
                      name="direccion"
                      value={formData.direccion || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Distrito</label>
                    <input
                      type="text"
                      className="form-control"
                      name="distrito"
                      value={formData.distrito || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Grupo sanguíneo</label>
                    <select
                      className="form-select"
                      name="grupoSanguineo"
                      value={formData.grupoSanguineo || ''}
                      onChange={handleChange}
                    >
                      <option value="">Seleccionar</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="form-label">Alergias</label>
                    <input
                      type="text"
                      className="form-control"
                      name="alergias"
                      value={formData.alergias || ''}
                      onChange={handleChange}
                      placeholder="Ej: Penicilina, Polen..."
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Contacto de emergencia</label>
                    <input
                      type="text"
                      className="form-control"
                      name="contactoEmergencia"
                      value={formData.contactoEmergencia || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Teléfono de emergencia</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="telefonoEmergencia"
                      value={formData.telefonoEmergencia || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary" disabled={guardando}>
                    {guardando ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Guardando...
                      </>
                    ) : (
                      '💾 Guardar cambios'
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={cancelarEdicion}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              /* ── Vista de solo lectura ─────────────── */
              <div className="row g-3">
                {camposVista.map(({ label, value }) => (
                  <div className="col-md-6" key={label}>
                    <div className="text-muted small">{label}</div>
                    <div className="fw-semibold">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPerfil;