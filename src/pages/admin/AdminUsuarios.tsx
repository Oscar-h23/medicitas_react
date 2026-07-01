// src/pages/admin/AdminUsuarios.tsx
import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';

interface Usuario {
  id: number;
  email: string;
  rol: string;
  activo: boolean;
  nombres: string;
  apellidos: string;
  telefono?: string;
  ultimo_login?: string;
}

function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsuarios();
      setUsuarios(data);
    } catch (err) {
      setError('No se pudieron cargar los usuarios.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleActivo = async (usuarioId: number, activoActual: boolean) => {
    if (!window.confirm(`¿${activoActual ? 'Desactivar' : 'Activar'} este usuario?`)) return;
    try {
      await adminService.actualizarUsuario(usuarioId, { activo: !activoActual });
      await cargarUsuarios();
    } catch (err: any) {
      alert(err?.response?.data?.mensaje || 'Error al actualizar usuario.');
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">👥 Usuarios del Sistema</h5>
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Nombre</th>
                  <th>Teléfono</th>
                  <th>Último Login</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td>{u.email}</td>
                    <td><span className="badge bg-info">{u.rol}</span></td>
                    <td>{u.nombres} {u.apellidos}</td>
                    <td>{u.telefono || '-'}</td>
                    <td>{u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('es-PE') : '-'}</td>
                    <td>
                      <span className={`badge ${u.activo ? 'bg-success' : 'bg-danger'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.activo ? 'btn-danger' : 'btn-success'}`}
                        onClick={() => toggleActivo(u.id, u.activo)}
                      >
                        {u.activo ? 'Desactivar' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted small mt-2">Total: {usuarios.length} usuarios</p>
        </div>
      </div>
    </div>
  );
}

export default AdminUsuarios;