// src/pages/paciente/MiPerfil.tsx
import { useEffect, useState } from 'react';
import { pacienteService } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PerfilData {
  id: number;
  email: string;
  rol: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  fechaNacimiento: string;
}

function MiPerfil() {
  // Estados principales
  const [perfil, setPerfil] = useState<PerfilData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [formData, setFormData] = useState<Partial<PerfilData>>({});

  // Cargar perfil al montar el componente
  useEffect(() => {
    cargarPerfil();
  }, []);

  /**
   * Carga los datos del perfil desde localStorage
   */
  const cargarPerfil = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      
      // Mapear datos del localStorage al estado
      const perfilActualizado: PerfilData = {
        id: userData.id || 0,
        email: userData.email || '',
        rol: userData.rol || 'paciente',
        nombres: userData.nombres || '',
        apellidos: userData.apellidos || '',
        telefono: userData.telefono || '',
        fechaNacimiento: userData.fechaNacimiento || '',
      };

      setPerfil(perfilActualizado);
      setFormData(perfilActualizado);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      alert('Error al cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Maneja los cambios en los campos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  /**
   * Guarda los cambios del perfil en localStorage
   * Nota: El backend no tiene PUT /auth/perfil, por eso se guarda localmente
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    
    try {
      // Actualizar estado local
      const actualizado = { ...perfil, ...formData } as PerfilData;
      setPerfil(actualizado);

      // Persistir en localStorage
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({
        ...userData,
        nombres: actualizado.nombres,
        apellidos: actualizado.apellidos,
        email: actualizado.email,
        telefono: actualizado.telefono,
        fechaNacimiento: actualizado.fechaNacimiento,
      }));

      alert('✅ Perfil actualizado correctamente.');
      setEditando(false);
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert('Error al guardar los cambios.');
    } finally {
      setGuardando(false);
    }
  };

  /**
   * Genera y descarga un PDF con los datos del paciente
   * Incluye: información personal, citas y historial médico
   */
  const descargarDatos = async () => {
    try {
      // Obtener datos del paciente
      const perfilData = JSON.parse(localStorage.getItem('userData') || '{}');

      // Obtener citas e historial médico
      const [citas, historial] = await Promise.all([
        pacienteService.getMisCitas(),
        pacienteService.getMiHistorial().catch(() => ({ consultas: [] })),
      ]);

      // Crear documento PDF
      const doc = new jsPDF();

      // Título principal
      doc.setFontSize(20);
      doc.text('MEDICITAS', 14, 20);
      doc.setFontSize(14);
      doc.text('Resumen del Paciente', 14, 30);

      // Sección: Información Personal
      doc.setFontSize(12);
      doc.text('Información Personal', 14, 45);

      autoTable(doc, {
        startY: 50,
        body: [
          ['Nombres', perfilData.nombres || ''],
          ['Apellidos', perfilData.apellidos || ''],
          ['Email', perfilData.email || ''],
          ['Teléfono', perfilData.telefono || '-'],
          ['Fecha nacimiento', perfilData.fechaNacimiento || '-'],
        ],
        theme: 'grid',
      });

      // Sección: Citas
      const citasY = (doc as any).lastAutoTable.finalY + 15;
      doc.text('Historial de Citas', 14, citasY);

      autoTable(doc, {
        startY: citasY + 5,
        head: [['Fecha', 'Hora', 'Doctor', 'Estado']],
        body: citas.map((c: any) => [
          c.fecha || '-',
          c.horaInicio || '-',
          c.doctorNombre || '-',
          c.estado || '-',
        ]),
        theme: 'striped',
      });

      // Sección: Historial Médico
      const historialY = (doc as any).lastAutoTable.finalY + 15;
      doc.text('Historial Médico', 14, historialY);

      autoTable(doc, {
        startY: historialY + 5,
        head: [['Fecha', 'Doctor', 'Diagnóstico']],
        body: (historial.consultas || []).map((c: any) => [
          c.fecha || '-',
          c.doctor || '-',
          c.diagnostico || '-',
        ]),
        theme: 'striped',
      });

      // Pie de página con fecha de generación
      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.text(
        `Generado: ${new Date().toLocaleString('es-PE')}`,
        14,
        finalY
      );

      // Guardar PDF
      doc.save(`MediCitas_${perfilData.nombres || 'paciente'}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF.');
    }
  };

  // Estados de carga y error
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status" />
        <p className="mt-2 text-muted">Cargando perfil...</p>
      </div>
    );
  }

  if (!perfil) {
    return <div className="alert alert-danger">No se pudo cargar el perfil.</div>;
  }

  // Renderizado principal
  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">

        {/* Tarjeta de perfil */}
        <div className="card shadow border-0 mb-4">
          <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 className="mb-0">👤 Mi perfil</h5>
            {!editando && (
              <button 
                className="btn btn-light btn-sm" 
                onClick={() => setEditando(true)}
              >
                ✏️ Editar
              </button>
            )}
          </div>

          <div className="card-body">
            {editando ? (
              // Modo edición
              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label">Nombres</label>
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
                    <label className="form-label">Apellidos</label>
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
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                    />
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
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={guardando}
                  >
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
                    onClick={() => {
                      setEditando(false);
                      setFormData(perfil);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              // Modo visualización
              <div className="row g-3">
                {[
                  { label: 'Nombres', value: perfil.nombres },
                  { label: 'Apellidos', value: perfil.apellidos },
                  { label: 'Email', value: perfil.email },
                  { label: 'Teléfono', value: perfil.telefono || 'No registrado' },
                  { label: 'Fecha de nacimiento', value: perfil.fechaNacimiento || 'No registrada' },
                  { label: 'Rol', value: perfil.rol },
                ].map(({ label, value }) => (
                  <div className="col-md-6" key={label}>
                    <div className="text-muted small">{label}</div>
                    <div className="fw-semibold">{value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tarjeta de exportación de datos */}
        <div className="card shadow-sm border-0">
          <div className="card-body d-flex align-items-center justify-content-between">
            <div>
              <h6 className="mb-0">
                <i className="bi bi-file-earmark-pdf me-2 text-danger" />
                Exportar mis datos
              </h6>
              <p className="text-muted small mb-0">
                Descarga tu información médica en formato PDF.
              </p>
            </div>
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={descargarDatos}
            >
              Descargar datos
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default MiPerfil;