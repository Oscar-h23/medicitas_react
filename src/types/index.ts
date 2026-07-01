export type Rol = 'ADMIN' | 'DOCTOR' | 'RECEPCIONISTA' | 'PACIENTE';

export interface Usuario {
  id: number;
  email: string;
  rol: Rol;
  nombres: string;
  apellidos: string;
  telefono?: string;
  fechaNacimiento?: string;
  numeroDocumento?: string;
  sexo?: string;
  direccion?: string;
  distrito?: string;
  grupoSanguineo?: string;
  alergias?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  pacienteId?: number | null; 
}

export interface AuthState {
  usuario: Usuario | null;
  loading: boolean;
}
