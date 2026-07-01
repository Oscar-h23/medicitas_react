// src/pages/admin/AdminPacientes.tsx
import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';

interface Paciente {
  id: number;
  historiaClinica: string;
  nombres: string;
  apellidos: string;
  documento: string;
  telefono: string;
  email: string;
  seguro: string;
  alergias?: string;
}

function AdminPacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setLoading(true);
      const data = await adminService.getPacientes();
      setPacientes(data);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      alert('No se pudieron cargar los pacientes.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">🧑‍⚕️ Pacientes</h5>
          <div className="table-responsive">
            <table className="table table-hover table-striped">
              <thead>
                <tr>
                  <th>HC</th>
                  <th>Nombre</th>
                  <th>Documento</th>
                  <th>Teléfono</th>
                  <th>Email</th>
                  <th>Seguro</th>
                  <th>Alergias</th>
                </tr>
              </thead>
              <tbody>
                {pacientes.map((p) => (
                  <tr key={p.id}>
                    <td>{p.historiaClinica}</td>
                    <td>{p.nombres} {p.apellidos}</td>
                    <td>{p.documento}</td>
                    <td>{p.telefono || '-'}</td>
                    <td>{p.email || '-'}</td>
                    <td>{p.seguro}</td>
                    <td>{p.alergias || 'Ninguna'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted small mt-2">Total: {pacientes.length} pacientes</p>
        </div>
      </div>
    </div>
  );
}

export default AdminPacientes;