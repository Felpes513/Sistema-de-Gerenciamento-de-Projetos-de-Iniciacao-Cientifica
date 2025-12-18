export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: 'bearer' | string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface ResetPasswordDirectBody {
  perfil: 'aluno' | 'orientador' | 'secretaria';
  email: string;
  cpf: string; // só dígitos
  nova_senha: string;
}
