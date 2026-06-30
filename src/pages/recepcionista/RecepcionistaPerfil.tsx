import { useEffect, useState } from 'react';
import { recepcionistaService } from '../../services/api';

function RecepcionistaPerfil() {
  const [perfil, setPerfil] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const data = await recepcionistaService.getPerfilCompleto();
      setPerfil(data);
      setFormData({
        nombres: data.nombres || '',
        apellidos: data.apellidos || '',
        email: data.email || '',
        telefono: data.telefono || '',
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      alert('No se pudo cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const datosEnviar: any = {
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        email: formData.email,
        telefono: formData.telefono,
      };
      if (formData.password.trim()) {
        datosEnviar.password = formData.password;
        datosEnviar.confirmPassword = formData.confirmPassword;
      }
      await recepcionistaService.actualizarPerfil(datosEnviar);
      alert('✅ Perfil actualizado correctamente');
      setEditando(false);
      await cargarPerfil();
    } catch (error: any) {
      console.error('Error al guardar perfil:', error);
      alert(error?.response?.data?.mensaje || 'Error al actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  const cancelarEdicion = () => {
    setEditando(false);
    if (perfil) {
      setFormData({
        nombres: perfil.nombres || '',
        apellidos: perfil.apellidos || '',
        email: perfil.email || '',
        telefono: perfil.telefono || '',
        password: '',
        confirmPassword: '',
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" />
        <p className="mt-2">Cargando perfil...</p>
      </div>
    );
  }

  if (!perfil) {
    return <div className="alert alert-danger">No se pudo cargar el perfil.</div>;
  }

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">👩‍💼 Mi Perfil</h4>
            {!editando && (
              <button className="btn btn-primary" onClick={() => setEditando(true)}>
                <i className="bi bi-pencil me-2" />Editar Perfil
              </button>
            )}
          </div>

          {!editando ? (
            <div className="row">
              <div className="col-md-6">
                <p><strong>Nombres:</strong> {perfil.nombres}</p>
                <p><strong>Apellidos:</strong> {perfil.apellidos}</p>
                <p><strong>Email:</strong> {perfil.email}</p>
                <p><strong>Teléfono:</strong> {perfil.telefono || 'No registrado'}</p>
                <p><strong>Rol:</strong> {perfil.rol || 'Recepcionista'}</p>
              </div>
            </div>
          ) : (
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
                </div>
                <div className="col-md-6">
                  <div className="card bg-light">
                    <div className="card-body">
                      <h6 className="fw-bold">Cambiar Contraseña</h6>
                      <p className="text-muted small">Deja vacío si no deseas cambiarla.</p>
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
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-success" disabled={guardando}>
                  {guardando ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar Cambios'
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={cancelarEdicion} disabled={guardando}>
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

export default RecepcionistaPerfil;