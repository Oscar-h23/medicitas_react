// src/pages/admin/AdminAuditoria.tsx
import { useEffect, useState } from 'react';
import { adminService } from '../../services/api';

interface Auditoria {
  id: number;
  usuarioId: number;
  accion: string;
  tablaAfectada: string;
  registroId: number;
  ipAddress: string;
  detalle: string | null;
  created_at: string;
}

function AdminAuditoria() {
  const [logs, setLogs] = useState<Auditoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [limite, setLimite] = useState(100);
  // Ya no usamos setDesde, solo el valor fijo 0
  const desde = 0;

  useEffect(() => {
    cargarLogs();
  }, [limite]);

  const cargarLogs = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAuditoria({ limite, desde });
      setLogs(data);
    } catch (error) {
      console.error('Error al cargar auditoría:', error);
      alert('No se pudieron cargar los logs.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary" /></div>;

  return (
    <div className="container-fluid px-0">
      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <h5 className="mb-0">📋 Auditoría</h5>
            <div className="d-flex gap-2">
              <select
                className="form-select form-select-sm"
                value={limite}
                onChange={(e) => setLimite(Number(e.target.value))}
                style={{ width: '100px' }}
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value={200}>200</option>
              </select>
              <button className="btn btn-sm btn-outline-secondary" onClick={cargarLogs}>
                <i className="bi bi-arrow-clockwise"></i>
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-hover table-striped table-sm">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Usuario</th>
                  <th>Acción</th>
                  <th>Tabla</th>
                  <th>Registro</th>
                  <th>IP</th>
                  <th>Fecha</th>
                  <th>Detalle</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>{log.usuarioId}</td>
                    <td><span className="badge bg-primary">{log.accion}</span></td>
                    <td>{log.tablaAfectada}</td>
                    <td>{log.registroId}</td>
                    <td>{log.ipAddress}</td>
                    <td>{new Date(log.created_at).toLocaleString('es-PE')}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {log.detalle || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-muted small mt-2">Mostrando {logs.length} registros</p>
        </div>
      </div>
    </div>
  );
}

export default AdminAuditoria;