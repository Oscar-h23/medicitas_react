export type Rol = 'ADMIN' | 'DOCTOR' | 'RECEPCIONISTA' | 'PACIENTE';

export interface Usuario {
  id: number;
  email: string;
  rol: Rol;
  nombres: string;
  apellidos: string;
}

export interface AuthState {
  usuario: Usuario | null;
  loading: boolean;
}
