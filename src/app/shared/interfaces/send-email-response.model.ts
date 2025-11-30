export interface SendEmailResponse {
  success: boolean;
  message: string;
  data: {
    quantidade_enviada: number;
  };
}
