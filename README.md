# Sistema de Gerenciamento de Projetos de Iniciação Científica (Frontend)

Aplicação Angular responsável por todo o fluxo de inscrições, avaliação e acompanhamento dos projetos de Iniciação Científica da USCS. O frontend é 100% standalone (componentes independentes, sem módulos) e já vem preparado para operar atrás de um proxy apontando para a API FastAPI.

## ✨ Principais recursos
- **Perfis separados**: aluno, orientador e secretaria com navegação e permissões específicas.
- **Gestão de projetos**: criação, listagem, filtros por status e paginação responsiva.
- **Avaliações e relatórios**: envio de PDFs para avaliadores, coleta de relatórios mensais e download em XLSX.
- **Comunicações**: painel de notificações, envio de e-mails/certificados e modais de confirmação.
- **Autenticação**: login por perfil, recuperação de senha e armazenamento seguro de tokens via serviços dedicados.

## 🛠️ Stack e arquitetura
- **Angular 19** com componentes standalone, `signals` e `Router` moderno.
- **Angular Material**, **FontAwesome**, **Swiper** e **ng2-charts/Chart.js** para UI e visualizações.
- **RxJS** para fluxos reativos (carregamento de listas, polling de notificações, debounces de filtros).
- **Proxy local** (veja `proxy.conf.json`) para direcionar `/api` para o backend FastAPI sem lidar com CORS.
- **Ambientes**: configurações em `src/environments/` (URLs resolvidas dinamicamente via `resolveUrl`).

Estrutura de pastas relevante:
- `src/app/components`: componentes reutilizáveis (home, footer etc.).
- `src/app/shared`: formulários de autenticação, dialog/side-nav e outros utilitários.
- `src/app/features`: fluxos por domínio (secretaria, orientador).
- `src/app/services`: comunicação HTTP e regras de sessão.

## ✅ Pré-requisitos
- **Node.js 20 LTS**
- **npm 10+**
- **Docker** e **Docker Compose** (opcional para produção ou testes integrados)

## ▶️ Configuração e desenvolvimento local
1. Instale dependências:
   ```bash
   npm install
   ```
2. (Opcional) ajuste o proxy/backend em `proxy.conf.json` ou diretamente em `src/environments/*.ts`.
3. Suba o frontend com proxy para a API FastAPI:
   ```bash
   npm start
   ```
   - Servidor padrão em `http://localhost:4200`.
   - Chamadas para `/api/**` são redirecionadas ao backend configurado no proxy.

## 🧪 Testes
- Executar a suíte de unit tests (Karma + Jasmine):
  ```bash
  npm test
  ```
  Use esta rotina para validar componentes/serviços e garantir a compatibilidade dos mocks utilizados nos testes.

## 📦 Build de produção
```bash
npm run build
```
Gera o bundle otimizado em `dist/` usando as configurações de produção do Angular.

## 🐳 Deploy com Docker
### Compose (recomendado)
```bash
docker compose up --build
docker compose up -d --build
```
Aplicação disponível em `http://localhost:8080`.

### Build/exec manual
```bash
docker build -t sgpic-frontend:latest .
docker run --rm -p 8080:80 --name sgpic sgpic-frontend:latest
```

### Integração com backend no Nginx
O `nginx.conf` faz proxy de `/api/` para o backend. Ajuste o host se necessário:
```nginx
location /api/ {
  proxy_pass http://host.docker.internal:8001; # ou o IP do host/Linux
}
```

## ℹ️ Dicas operacionais
- Ajuste o `emailApiBaseUrl` em `src/environments` se o serviço de e-mail estiver fora do proxy padrão.
- O `start` usa `--disable-host-check` para facilitar desenvolvimento em redes locais; remova em ambientes restritos.
- Prefira rodar os testes sempre que alterar componentes/serviços para manter a cobertura funcional.
