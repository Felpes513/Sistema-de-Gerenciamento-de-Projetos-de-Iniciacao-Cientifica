# Changelog - FrontTCC

## [Data: 04/12/2025] - Implementação de Token nas Rotas e Refatoração de Serviços

### 🎯 Resumo Geral
- **6 arquivos modificados**
- **192 inserções**, **96 deleções**
- Implementação de token de autenticação nas rotas do backend
- Refatoração do serviço de avaliadores externos
- Melhorias no fluxo de envio de projetos para avaliadores
- Atualizações no componente de formulário de avaliador

---

### ✨ Implementações

#### 1. **Novo Serviço de Avaliadores Externos (AvaliadoresExternosService)**
- ✅ Criado serviço dedicado `avaliadores_externos.service.ts` (111 linhas)
- ✅ Implementado CRUD completo de avaliadores externos:
  - `criarAvaliador()` - Criação de novo avaliador
  - `atualizarAvaliador()` - Atualização de avaliador existente
  - `listarAvaliadoresExternos()` - Listagem de todos os avaliadores
  - `obterAvaliadorPorId()` - Busca de avaliador por ID
  - `deleteAvaliador()` - Exclusão de avaliador
- ✅ Implementado método `enviarProjetoParaAvaliadores()` para envio de projetos
- ✅ Suporte a autenticação via token Bearer com múltiplas fontes de token
- ✅ Tratamento de erros robusto com catchError

#### 2. **Refatoração do Componente de Formulário de Avaliador**
- ✅ Refatorado `FormularioAvaliadorComponent` para usar novo serviço
- ✅ Removida dependência direta de `ProjetoService` para operações de avaliadores
- ✅ Melhorada separação de responsabilidades

#### 3. **Melhorias no Modal de Envio de Avaliações**
- ✅ Refatorado `EnviarAvaliacoesModal` para usar novo serviço
- ✅ Melhorado tratamento de envio de projetos para avaliadores
- ✅ Suporte a múltiplos destinatários (1 a 5 avaliadores)

#### 4. **Melhorias no Serviço de Projetos**
- ✅ Removidas funcionalidades relacionadas a avaliadores (migradas para serviço dedicado)
- ✅ Simplificado `ProjetoService` focando apenas em operações de projetos

#### 5. **Melhorias no Componente de Cadastro**
- ✅ Atualizado `CadastroComponent` com ajustes no fluxo de cadastro

---

### 🐛 Correções

#### 1. **Autenticação e Tokens**
- ✅ Implementado suporte a múltiplas fontes de token no serviço de avaliadores
- ✅ Corrigido tratamento de autenticação em requisições

#### 2. **Organização de Serviços**
- ✅ Separadas responsabilidades entre `ProjetoService` e `AvaliadoresExternosService`
- ✅ Melhorada manutenibilidade do código

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (6 arquivos)
- `src/app/services/avaliadores_externos.service.ts` - 111 linhas (novo arquivo)
- `src/app/features/secretaria/formulario-avaliador/formulario-avaliador.component.ts` - 82 linhas alteradas
- `src/app/features/secretaria/listagem-avaliadores/enviar-avaliacoes.modal.ts` - 16 linhas alteradas
- `src/app/features/secretaria/listagem-avaliadores/listagem-avaliadores.component.ts` - 20 linhas alteradas
- `src/app/services/projeto.service.ts` - 42 linhas removidas
- `src/app/shared/cadastro/cadastro.component.ts` - 17 linhas alteradas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 04 de Dezembro de 2025  
**Commit:** `7c0a7ce`

---

## [Data: 02/12/2025] - Correção de Bugs de Notificações e Limpeza de Testes

### 🎯 Resumo Geral
- **14 arquivos modificados**
- **237 inserções**, **727 deleções**
- Correção de bug de listagem de notificações
- Resolução de problema de duplicação de dados
- Limpeza de arquivos de teste não utilizados
- Melhorias em componentes de notificações e relatórios

---

### ✨ Implementações

#### 1. **Melhorias no Componente de Notificações**
- ✅ Refatorado `NotificacoesComponent` com melhor lógica de listagem (110 linhas alteradas)
- ✅ Melhorado tratamento de dados e paginação
- ✅ Ajustes no CSS e HTML para melhor apresentação (16 e 10 linhas respectivamente)

#### 2. **Melhorias no Componente de Relatórios**
- ✅ Refatorado CSS do componente de relatórios (179 linhas alteradas)
- ✅ Melhorada interface HTML com novos elementos (39 linhas alteradas)
- ✅ Adicionada nova funcionalidade no TypeScript (22 linhas alteradas)

---

### 🐛 Correções

#### 1. **Bug de Duplicação**
- ✅ Corrigido bug de duplicagem que não estava ocorrendo mais
- ✅ Validado fluxo de dados para evitar duplicações

#### 2. **Bug de Listagem de Notificações**
- ✅ Corrigido bug na listagem de notificações
- ✅ Melhorado carregamento e exibição de notificações

---

### 🗑️ Remoções

#### 1. **Arquivos de Teste Removidos**
- ❌ Removidos arquivos `.spec.ts` não utilizados ou desatualizados:
  - `src/app/services/auth.service.spec.ts` - 63 linhas removidas
  - `src/app/services/cadastro.service.spec.ts` - 50 linhas removidas
  - `src/app/services/config.service.spec.ts` - 114 linhas removidas
  - `src/app/services/inscricoes.service.spec.ts` - 56 linhas removidas
  - `src/app/services/login.service.spec.ts` - 70 linhas removidas
  - `src/app/services/notificacao.service.spec.ts` - 75 linhas removidas
  - `src/app/services/projeto.service.spec.ts` - 109 linhas removidas
  - `src/app/services/relatorio.service.spec.ts` - 51 linhas removidas
- **Motivo**: Limpeza de testes desatualizados ou não utilizados
- **Total**: 588 linhas de testes removidas

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (14 arquivos)
- `src/app/features/secretaria/notificacoes/notificacoes.component.css` - 16 linhas alteradas
- `src/app/features/secretaria/notificacoes/notificacoes.component.html` - 10 linhas alteradas
- `src/app/features/secretaria/notificacoes/notificacoes.component.ts` - 110 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.css` - 179 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.html` - 39 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.ts` - 22 linhas alteradas
- `src/app/services/auth.service.spec.ts` - 63 linhas removidas
- `src/app/services/cadastro.service.spec.ts` - 50 linhas removidas
- `src/app/services/config.service.spec.ts` - 114 linhas removidas
- `src/app/services/inscricoes.service.spec.ts` - 56 linhas removidas
- `src/app/services/login.service.spec.ts` - 70 linhas removidas
- `src/app/services/notificacao.service.spec.ts` - 75 linhas removidas
- `src/app/services/projeto.service.spec.ts` - 109 linhas removidas
- `src/app/services/relatorio.service.spec.ts` - 51 linhas removidas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 02 de Dezembro de 2025  
**Commit:** `005f97a`

---

## [Data: 01/12/2025] - Correção de Duplicação de Inscrições e Cadastros

### 🎯 Resumo Geral
- **10 arquivos modificados**
- **269 inserções**, **104 deleções**
- Correção de bug de duplicação de inscrições e cadastros de alunos
- Melhorias no componente de listagem de alunos
- Atualizações no fluxo de inscrições
- Ajustes no componente de upload de certificados

---

### ✨ Implementações

#### 1. **Melhorias no Componente de Listagem de Alunos**
- ✅ Refatorado `ListagemAlunosComponent` com melhor tratamento de duplicações (106 linhas adicionadas)
- ✅ Implementada função de debug para identificação de duplicatas
- ✅ Melhorado sistema de seleção de alunos
- ✅ Aprimorado CSS com melhorias visuais (43 linhas alteradas)
- ✅ Atualizado HTML com nova estrutura (27 linhas alteradas)

#### 2. **Melhorias no Componente de Listagem de Projetos**
- ✅ Refatorado `ListagemProjetosComponent` com melhor organização (63 linhas alteradas)
- ✅ Otimizado carregamento de dados

#### 3. **Melhorias no Formulário de Projeto**
- ✅ Ajustes no CSS do formulário (11 linhas alteradas)
- ✅ Removidas linhas desnecessárias do HTML (8 linhas removidas)

#### 4. **Atualizações no Serviço de Projetos**
- ✅ Melhorado `ProjetoService` com novos métodos e validações (92 linhas alteradas)
- ✅ Adicionado suporte para tratamento de duplicações

#### 5. **Melhorias no Serviço de Upload**
- ✅ Atualizado `UploadService` com ajustes no envio de arquivos (6 linhas alteradas)

#### 6. **Melhorias no Componente de Upload de Certificados**
- ✅ Ajustes no componente de upload de certificados (6 linhas alteradas)

#### 7. **Atualizações nas Interfaces**
- ✅ Atualizada interface `Projeto` com novos campos (11 linhas alteradas)

---

### 🐛 Correções

#### 1. **Bug de Duplicação de Inscrições**
- ✅ Corrigido bug que causava duplicação de inscrições de alunos
- ✅ Implementada validação para evitar cadastros duplicados
- ✅ Adicionado sistema de debug para identificar duplicatas

#### 2. **Bug de Duplicação de Cadastros**
- ✅ Corrigido problema de cadastros duplicados de alunos
- ✅ Melhorada validação de dados antes do cadastro

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (10 arquivos)
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.css` - 11 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.html` - 8 linhas removidas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.css` - 43 linhas alteradas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.html` - 27 linhas alteradas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.ts` - 106 linhas adicionadas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.ts` - 63 linhas alteradas
- `src/app/features/secretaria/upload-certificados/upload-certificados.component.ts` - 6 linhas alteradas
- `src/app/services/projeto.service.ts` - 92 linhas alteradas
- `src/app/services/upload.service.ts` - 6 linhas alteradas
- `src/app/shared/interfaces/projeto.ts` - 11 linhas alteradas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 01 de Dezembro de 2025  
**Commit:** `0fed6d8`

---

## [Data: 30/11/2025] - Correção de Listagem de Alunos e Atribuição de Bolsas

### 🎯 Resumo Geral
- **3 arquivos modificados**
- **176 inserções**, **24 deleções**
- Correção de problemas na listagem de alunos
- Melhorias no sistema de atribuição de bolsas
- Aprimoramentos no componente de configurações

---

### ✨ Implementações

#### 1. **Melhorias no Componente de Configurações**
- ✅ Refatorado `ConfiguracoesComponent` com melhor lógica de bolsas (123 linhas alteradas)
- ✅ Melhorado sistema de atribuição de bolsas a alunos
- ✅ Aprimorado CSS com novos estilos (70 linhas adicionadas)
- ✅ Ajustes no HTML para melhor organização (7 linhas alteradas)

---

### 🐛 Correções

#### 1. **Listagem de Alunos**
- ✅ Corrigido problema na listagem de alunos
- ✅ Melhorado carregamento e exibição de dados

#### 2. **Atribuição de Bolsas**
- ✅ Corrigido sistema de atribuição de bolsas
- ✅ Melhorada validação e tratamento de erros

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (3 arquivos)
- `src/app/features/secretaria/configuracoes/configuracoes.component.css` - 70 linhas adicionadas
- `src/app/features/secretaria/configuracoes/configuracoes.component.html` - 7 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.ts` - 123 linhas alteradas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 30 de Novembro de 2025  
**Commit:** `8eaa3ed`

---

## [Data: 30/11/2025] - Implementação do Componente de Envio de Certificados

### 🎯 Resumo Geral
- **14 arquivos modificados**
- **433 inserções**, **601 deleções**
- Implementação do componente de upload e envio de certificados
- Remoção do componente antigo de envio de e-mail
- Integração com serviço de upload
- Atualização de dependências

---

### ✨ Implementações

#### 1. **Novo Componente de Upload de Certificados**
- ✅ Criado componente `UploadCertificadosComponent` completo (100 linhas)
- ✅ Implementado upload de arquivo com drag & drop
- ✅ Interface HTML moderna e responsiva (69 linhas)
- ✅ Estilos CSS customizados (131 linhas)
- ✅ Arquivo de teste criado (23 linhas)
- ✅ Integração com `UploadService` para envio de arquivos
- ✅ Feedback visual com diálogos de confirmação
- ✅ Tratamento de erros robusto

#### 2. **Novo Serviço de Upload**
- ✅ Criado `UploadService` para envio de arquivos (21 linhas)
- ✅ Método `enviarArquivo()` para upload de arquivos
- ✅ Integração com endpoint `/send-emails`
- ✅ Suporte a FormData para envio de arquivos

#### 3. **Nova Interface de Resposta**
- ✅ Criada interface `SendEmailResponse` (7 linhas)
- ✅ Tipagem para resposta do envio de e-mails
- ✅ Suporte a dados de quantidade enviada

#### 4. **Atualização de Rotas**
- ✅ Adicionada rota para componente de upload de certificados
- ✅ Integração no sistema de navegação (15 linhas alteradas)

#### 5. **Melhorias na Sidenav**
- ✅ Atualizado `SidenavSecretariaComponent` com link para upload de certificados
- ✅ Refatoração completa do HTML (132 linhas alteradas)
- ✅ Melhor organização dos links de navegação

---

### 🗑️ Remoções

#### 1. **Componente de Envio de E-mail Removido**
- ❌ Removido componente `EnvioDeEmailComponent` completamente:
  - `envio-de-email.component.ts` - 131 linhas removidas
  - `envio-de-email.component.html` - 81 linhas removidas
  - `envio-de-email.component.css` - 263 linhas removidas
  - `envio-de-email.component.spec.ts` - 47 linhas removidas
- **Motivo**: Substituído pelo novo componente de upload de certificados
- **Total**: 522 linhas removidas

---

### 📦 Dependências

#### 1. **Atualização de Pacotes**
- ✅ Atualizado `package.json` e `package-lock.json` (5 e 9 linhas alteradas)
- ✅ Novas dependências adicionadas para suporte a upload

---

### 📊 Estatísticas de Alterações

#### Arquivos Criados (5 arquivos)
- `src/app/features/secretaria/upload-certificados/upload-certificados.component.ts` - 100 linhas
- `src/app/features/secretaria/upload-certificados/upload-certificados.component.html` - 69 linhas
- `src/app/features/secretaria/upload-certificados/upload-certificados.component.css` - 131 linhas
- `src/app/features/secretaria/upload-certificados/upload-certificados.component.spec.ts` - 23 linhas
- `src/app/services/upload.service.ts` - 21 linhas
- `src/app/shared/interfaces/send-email-response.model.ts` - 7 linhas

#### Arquivos Modificados (6 arquivos)
- `src/app/app.routes.ts` - 15 linhas alteradas
- `src/app/features/secretaria/upload-certificados/upload-certificados.component.ts` - 6 linhas alteradas (após criação)
- `src/app/shared/sidenav/sidenav-secretaria.component.html` - 132 linhas alteradas
- `package.json` - 5 linhas alteradas
- `package-lock.json` - 9 linhas alteradas

#### Arquivos Removidos (4 arquivos)
- `src/app/features/secretaria/envio-de-email/envio-de-email.component.ts` - 131 linhas
- `src/app/features/secretaria/envio-de-email/envio-de-email.component.html` - 81 linhas
- `src/app/features/secretaria/envio-de-email/envio-de-email.component.css` - 263 linhas
- `src/app/features/secretaria/envio-de-email/envio-de-email.component.spec.ts` - 47 linhas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 30 de Novembro de 2025  
**Commit:** `4b4134b`

---

## [Data: 29/11/2025] - Correção de Fluxo de Inscrições e Criação de Bolsas

### 🎯 Resumo Geral
- **16 arquivos modificados**
- **1018 inserções**, **397 deleções**
- Correção de erros no fluxo de inscrições
- Correção de problema na criação de bolsas
- Melhorias significativas em componentes da secretaria
- Atualização completa do CHANGELOG

---

### ✨ Implementações

#### 1. **Atualização Completa do CHANGELOG**
- ✅ Adicionada documentação completa de 383 linhas
- ✅ Documentação de todas as mudanças anteriores

#### 2. **Melhorias no Componente de Cadastros**
- ✅ Refatorado CSS com redesign completo (117 linhas alteradas)
- ✅ Atualizado HTML com melhor estrutura (8 linhas alteradas)
- ✅ Melhorias na apresentação visual

#### 3. **Melhorias no Componente de Listagem de Alunos**
- ✅ Refatorado CSS com novos estilos (132 linhas adicionadas)
- ✅ Atualizado HTML com melhor organização (79 linhas alteradas)
- ✅ Refatorada lógica do componente (119 linhas alteradas)
- ✅ Melhor tratamento de dados e validações

#### 4. **Melhorias no Componente de Listagem de Projetos**
- ✅ Ajustes no CSS (1 linha alterada)
- ✅ Atualizado HTML com melhorias (35 linhas alteradas)
- ✅ Refatoração completa da lógica (422 linhas alteradas)
- ✅ Melhor sistema de paginação e filtros

#### 5. **Melhorias no Serviço de Inscrições**
- ✅ Refatorado `InscricoesService` com novos métodos (51 linhas alteradas)
- ✅ Melhor tratamento de dados de inscrições

#### 6. **Melhorias no Serviço de Projetos**
- ✅ Atualizado `ProjetoService` com ajustes (31 linhas alteradas)
- ✅ Melhor compatibilidade com API

#### 7. **Melhorias na Sidenav**
- ✅ Ajustes no CSS (13 linhas adicionadas)
- ✅ Atualizada lógica do componente (15 linhas alteradas)

---

### 🐛 Correções

#### 1. **Fluxo de Inscrições**
- ✅ Corrigido erro na listagem de inscrições
- ✅ Melhorado tratamento de dados
- ✅ Corrigida validação de inscrições

#### 2. **Criação de Bolsas**
- ✅ Corrigido problema que impedia criação de bolsas
- ✅ Melhorada validação de dados
- ✅ Corrigido tratamento de erros

#### 3. **Listagem de Projetos**
- ✅ Corrigido cálculo de paginação
- ✅ Melhorado carregamento de dados
- ✅ Corrigidos filtros e busca

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (16 arquivos)
- `CHANGELOG.md` - 383 linhas adicionadas
- `src/app/components/footer/footer.component.html` - 2 linhas alteradas
- `src/app/features/secretaria/cadastros/cadastros.component.css` - 117 linhas alteradas
- `src/app/features/secretaria/cadastros/cadastros.component.html` - 8 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.html` - 6 linhas removidas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.css` - 132 linhas adicionadas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.html` - 79 linhas alteradas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.ts` - 119 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.css` - 1 linha alterada
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.html` - 35 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.spec.ts` - 1 linha removida
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.ts` - 422 linhas alteradas
- `src/app/services/inscricoes.service.ts` - 51 linhas alteradas
- `src/app/services/projeto.service.ts` - 31 linhas alteradas
- `src/app/shared/sidenav/sidenav-secretaria.component.css` - 13 linhas adicionadas
- `src/app/shared/sidenav/sidenav-secretaria.component.ts` - 15 linhas alteradas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 29 de Novembro de 2025  
**Commit:** `76cedc3`

---

## [Data: 26/11/2025] - Correção de Serviços de Bolsa, Projetos e Modal de Notificações

### 🎯 Resumo Geral
- **45 arquivos modificados**
- **1832 inserções**, **1005 deleções**
- Correção de serviços de bolsa e projetos
- Criação de modal para notificações
- Refatoração de componentes da secretaria
- Consolidação de interfaces

---

### ✨ Implementações

#### 1. **Melhorias no Serviço de Configurações**
- ✅ Adicionados métodos para gerenciamento de bolsas e tipos de bolsa (69 linhas alteradas)
- ✅ Melhor integração com API

#### 2. **Refatoração do Componente de Configurações**
- ✅ Refatorado componente com melhor estrutura (107 linhas alteradas)
- ✅ Melhor organização do código

#### 3. **Melhorias no Serviço de Projetos**
- ✅ Refatorado com novos métodos e validações (257 linhas alteradas)
- ✅ Melhor tratamento de dados

#### 4. **Melhorias no Serviço de Relatórios**
- ✅ Refatorado com melhor estrutura (129 linhas alteradas)
- ✅ Melhor mapeamento de dados

#### 5. **Melhorias no Serviço de Login**
- ✅ Atualizado com melhor tratamento de tokens (41 linhas alteradas)

#### 6. **Melhorias no Serviço de Inscrições**
- ✅ Refatorado com novos métodos (28 linhas alteradas)

#### 7. **Melhorias no Serviço de Notificações**
- ✅ Atualizado com melhor estrutura (19 linhas alteradas)

#### 8. **Melhorias no Serviço de Senha**
- ✅ Atualizado com melhor tratamento de erros (23 linhas alteradas)

#### 9. **Melhorias em Componentes da Secretaria**
- ✅ `FormularioProjetoComponent`: Refatorado com melhor lógica (354 linhas alteradas)
- ✅ `FormularioAvaliadorComponent`: Melhorado (47 linhas alteradas)
- ✅ `ListagemAlunosComponent`: Refatorado (41 linhas alteradas)
- ✅ `ListagemAvaliadoresComponent`: Melhorado (51 linhas alteradas)
- ✅ `NotificacoesComponent`: Atualizado (20 linhas alteradas)
- ✅ `RelatoriosComponent`: Melhorado (12 linhas alteradas)
- ✅ `CadastrosComponent`: Atualizado (34 linhas alteradas)

---

### 🗑️ Remoções

#### 1. **Serviço de Bolsa Removido**
- ❌ Removido `BolsaService` (31 linhas removidas)
- ❌ Removido teste do serviço (60 linhas removidas)
- **Motivo**: Funcionalidades migradas para `ConfigService`

#### 2. **Interfaces Removidas**
- ❌ Removidas interfaces duplicadas (consolidadas em `configuracao.ts`)

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (45 arquivos)
- Múltiplos arquivos de componentes e serviços atualizados
- Consolidação de interfaces
- Remoção de código duplicado

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 26 de Novembro de 2025  
**Commit:** `4b452c6`

---

## [Data: 28/11/2025] - Correção de Arquivos de Teste

### 🎯 Resumo Geral
- **6 arquivos modificados**
- **294 inserções**, **137 deleções**
- Correções e melhorias em arquivos de teste (.spec)
- Ajustes em testes de componentes da secretaria
- Melhorias na cobertura de testes

---

### ✨ Implementações

#### 1. **Melhorias em Testes de Componentes**
- ✅ Atualizado `ConfiguracoesComponent.spec.ts` com testes mais abrangentes
- ✅ Melhorado `FormularioProjetoComponent.spec.ts` com novos casos de teste
- ✅ Aprimorado `ListagemAlunosComponent.spec.ts` com validações adicionais
- ✅ Atualizado `SidenavSecretariaComponent.spec.ts` com melhor cobertura

#### 2. **Correções em Serviços de Teste**
- ✅ Corrigido `ConfigService.spec.ts` com ajustes em mocks e stubs
- ✅ Melhorada estrutura de testes para melhor manutenibilidade

---

### 🐛 Correções

#### 1. **Testes de Componentes**
- ✅ Corrigidos mocks e stubs em testes de componentes
- ✅ Ajustados testes para refletir mudanças recentes nos componentes
- ✅ Corrigida estrutura de testes para melhor compatibilidade

#### 2. **Formulário de Projeto**
- ✅ Corrigido pequeno ajuste no componente `FormularioProjetoComponent`

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (6 arquivos)
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - 241 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.spec.ts` - 140 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.ts` - 2 linhas alteradas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.spec.ts` - 38 linhas alteradas
- `src/app/services/config.service.spec.ts` - 6 linhas alteradas
- `src/app/shared/sidenav/sidenav-secretaria.component.spec.ts` - 4 linhas alteradas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 28 de Novembro de 2025  
**Commit:** `bd017dc`

---

## [Data: 26/11/2025] - Atualização de Testes e Documentação

### 🎯 Resumo Geral
- **22 arquivos modificados**
- **220 inserções**, **84 deleções**
- Atualização completa de testes de componentes
- Melhoria na documentação do projeto
- Aumento da cobertura de testes

---

### ✨ Implementações

#### 1. **Atualização de Testes de Componentes**
- ✅ Melhorado `AppComponent.spec.ts` com novos casos de teste
- ✅ Atualizado `FooterComponent.spec.ts` com validações adicionais
- ✅ Aprimorado `HomeComponent.spec.ts` com testes mais abrangentes
- ✅ Atualizado `RelatorioFormComponent.spec.ts` (Orientador)
- ✅ Melhorado `CadastrosComponent.spec.ts` com novos testes
- ✅ Atualizado `ConfiguracoesComponent.spec.ts`
- ✅ Aprimorado `DashboardComponent.spec.ts`
- ✅ Melhorado `EnvioDeEmailComponent.spec.ts`
- ✅ Atualizado `FormularioAvaliadorComponent.spec.ts`
- ✅ Aprimorado `FormularioProjetoComponent.spec.ts`
- ✅ Melhorado `ListagemAlunosComponent.spec.ts`
- ✅ Atualizado `EnviarAvaliacoesModal.spec.ts`
- ✅ Aprimorado `ListagemAvaliadoresComponent.spec.ts`
- ✅ Melhorado `ListagemProjetosComponent.spec.ts`
- ✅ Atualizado `NotificacoesComponent.spec.ts`
- ✅ Aprimorado `RelatoriosComponent.spec.ts`
- ✅ Melhorado `CadastroComponent.spec.ts`
- ✅ Atualizado `ConfirmDialogComponent.spec.ts` com 32 linhas adicionais
- ✅ Aprimorado `LoginComponent.spec.ts`
- ✅ Melhorado `ResetPasswordComponent.spec.ts`
- ✅ Atualizado `SidenavSecretariaComponent.spec.ts` com 17 linhas adicionais

#### 2. **Melhorias na Documentação**
- ✅ Atualizado `README.md` com informações mais detalhadas
- ✅ Melhorada descrição de funcionalidades e estrutura do projeto
- ✅ Adicionadas instruções mais claras para desenvolvimento e deploy

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (22 arquivos)
- `README.md` - 140 linhas alteradas (refatoração completa)
- `src/app/app.component.spec.ts` - 7 linhas adicionadas
- `src/app/components/footer/footer.component.spec.ts` - 1 linha adicionada
- `src/app/components/home/home.component.spec.ts` - 7 linhas adicionadas
- `src/app/features/orientador/relatorio-form/relatorio-form.component.spec.ts` - 6 linhas adicionadas
- `src/app/features/secretaria/cadastros/cadastros.component.spec.ts` - 8 linhas adicionadas
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - 1 linha adicionada
- `src/app/features/secretaria/dashboard/dashboard.component.spec.ts` - 9 linhas adicionadas
- `src/app/features/secretaria/envio-de-email/envio-de-email.component.spec.ts` - 6 linhas adicionadas
- `src/app/features/secretaria/formulario-avaliador/formulario-avaliador.component.spec.ts` - 12 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.spec.ts` - 4 linhas adicionadas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.spec.ts` - 8 linhas adicionadas
- `src/app/features/secretaria/listagem-avaliadores/enviar-avaliacoes.modal.spec.ts` - 7 linhas adicionadas
- `src/app/features/secretaria/listagem-avaliadores/listagem-avaliadores.component.spec.ts` - 6 linhas adicionadas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.spec.ts` - 4 linhas adicionadas
- `src/app/features/secretaria/notificacoes/notificacoes.component.spec.ts` - 7 linhas adicionadas
- `src/app/features/secretaria/relatorios/relatorios.component.spec.ts` - 8 linhas adicionadas
- `src/app/shared/cadastro/cadastro.component.spec.ts` - 4 linhas adicionadas
- `src/app/shared/confirm-dialog/confirm-dialog.component.spec.ts` - 32 linhas adicionadas
- `src/app/shared/login/login.component.spec.ts` - 4 linhas adicionadas
- `src/app/shared/reset-password/reset-password.component.spec.ts` - 6 linhas adicionadas
- `src/app/shared/sidenav/sidenav-secretaria.component.spec.ts` - 17 linhas adicionadas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 26 de Novembro de 2025  
**Commit:** `7f168bf`

---

## [Data: 25/11/2025] - Refatoração de Interface de Bolsas

### 🎯 Resumo Geral
- **2 commits relacionados**
- **195 inserções**, **125 deleções**
- Refatoração completa da interface de gerenciamento de bolsas
- Remoção de lógica de Bolsa e adição de funcionalidades TipoBolsa
- Melhorias na UI de registro e atribuição de bolsas

---

### ✨ Implementações

#### 1. **Refatoração da Interface de Registro e Atribuição de Bolsas**
- ✅ Refatorado `ConfiguracoesComponent.html` com melhor organização
- ✅ Melhorada interface de usuário para registro de bolsas
- ✅ Aprimorada experiência de atribuição de bolsas
- ✅ Melhorada responsividade e layout

#### 2. **Remoção de Lógica de Bolsa e Adição de TipoBolsa**
- ✅ Removida lógica antiga de gerenciamento de bolsas
- ✅ Implementada nova funcionalidade de gerenciamento de Tipos de Bolsa
- ✅ Refatorado `ConfiguracoesComponent` para usar nova estrutura
- ✅ Melhorada organização do código relacionado a bolsas

---

### 🐛 Correções

#### 1. **Componente de Configurações**
- ✅ Corrigida estrutura de gerenciamento de bolsas
- ✅ Ajustada lógica para trabalhar com Tipos de Bolsa ao invés de Bolsas diretas
- ✅ Melhorada consistência na interface

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados
- `src/app/features/secretaria/configuracoes/configuracoes.component.html` - 137 linhas alteradas (83 inserções, 54 deleções)
- `src/app/features/secretaria/configuracoes/configuracoes.component.ts` - 183 linhas alteradas (112 inserções, 71 deleções)

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 25 de Novembro de 2025  
**Commits:** `5cd53c6`, `7ebf9e5`

---

## [Data: 26/11/2025] - Refatoração de Serviços, Componentes e Interfaces

### 🎯 Resumo Geral
- **37 arquivos modificados**
- **1.163 inserções**, **1.020 deleções**
- Implementação de sistema de diálogos reutilizável
- Refatoração completa de serviços e interfaces
- Remoção de componentes e serviços obsoletos
- Melhorias significativas em componentes da secretaria
- Atualização de rotas e configurações

---

### ✨ Implementações

#### 1. **Sistema de Diálogos Reutilizável**
- ✅ Criado novo serviço `DialogService` para gerenciamento centralizado de diálogos
- ✅ Implementado componente `ConfirmDialogComponent` para alertas e confirmações
- ✅ Adicionados métodos `alert()` e `confirm()` no `DialogService`
- ✅ Integrado `DialogService` em todos os componentes da secretaria:
  - `CadastrosComponent`
  - `ConfiguracoesComponent`
  - `FormularioProjetoComponent`
  - `FormularioAvaliadorComponent`
  - `ListagemAvaliadoresComponent`
  - `NotificacoesComponent`
  - `RelatoriosComponent`
- ✅ Integrado `DialogService` no componente `RelatorioFormComponent` (Orientador)
- ✅ Substituição de `window.confirm()` e `window.alert()` por diálogos Material Design
- ✅ Melhorada experiência do usuário com diálogos estilizados e responsivos

#### 2. **Refatoração de Interfaces**
- ✅ Criada nova interface `Configuracao` consolidando:
  - `Campus`
  - `Curso`
  - `TipoBolsa`
  - `BolsaCreateDto`
  - `BolsaListItem`
  - `BolsaListResponse`
- ✅ Criada interface `ListagemAlunos` com `AlunoSecretariaView`
- ✅ Criada interface `ListagemProjetos` com `ListagemResponse`
- ✅ Atualizada interface `Projeto` com novos campos e tipos
- ✅ Removidas interfaces duplicadas e obsoletas

#### 3. **Melhorias no Serviço de Configurações (ConfigService)**
- ✅ Adicionado método `listarTiposBolsa()` com suporte a paginação
- ✅ Adicionado método `criarTipoBolsa()` para criação de tipos de bolsa
- ✅ Adicionado método `excluirTipoBolsa()` para exclusão de tipos de bolsa
- ✅ Adicionado método `listarBolsas()` com suporte a paginação
- ✅ Adicionado método `criarBolsa()` para criação de bolsas
- ✅ Adicionado método `excluirBolsa()` para exclusão de bolsas
- ✅ Refatorado para usar novas interfaces consolidadas

#### 4. **Melhorias no Serviço de Projetos (ProjetoService)**
- ✅ Refatorado método `cadastrarProjetoCompleto()` com melhor tratamento de Base64
- ✅ Melhorado método `gerarCodProjeto()` para geração automática de códigos
- ✅ Aprimorado método `stripDataUrl()` para processamento de Base64
- ✅ Adicionado suporte para `ideia_inicial_pdf_b64` além de `ideia_inicial_b64`
- ✅ Melhorado tratamento de erros e validações
- ✅ Refatorado métodos de listagem e busca de projetos
- ✅ Melhorada compatibilidade com diferentes formatos de resposta da API

#### 5. **Melhorias no Serviço de Relatórios (RelatorioService)**
- ✅ Refatorado método `listarDoMes()` com melhor mapeamento de dados
- ✅ Refatorado método `listarPendentesDoMes()` com melhor estrutura de resposta
- ✅ Melhorado método `confirmar()` com tipagem aprimorada
- ✅ Adicionado método `listarRecebidosSecretaria()` para visualização na secretaria
- ✅ Melhorado tratamento de parâmetros de consulta

#### 6. **Melhorias no Serviço de Inscrições (InscricoesService)**
- ✅ Refatorado para usar `inject()` do Angular
- ✅ Melhorado método `listarPorProjeto()` com suporte a paginação e ordenação
- ✅ Adicionados parâmetros: `pagina`, `limite`, `ordenarPor`, `ordem`
- ✅ Melhorado método `listarAprovadosDoProjeto()` com mapeamento de dados
- ✅ Aprimorado tratamento de respostas da API

#### 7. **Melhorias no Serviço de Login (LoginService)**
- ✅ Refatorado método `persistTokensFromResponse()` com melhor tratamento de tokens
- ✅ Melhorado método `decodeRoleFromJwt()` com suporte a múltiplos formatos de payload
- ✅ Adicionado suporte para diferentes formatos de resposta de login
- ✅ Melhorado método `base64UrlDecode()` para decodificação robusta
- ✅ Aprimorado tratamento de roles e permissões

#### 8. **Melhorias no Serviço de Notificações (NotificacaoService)**
- ✅ Refatorado métodos para melhor estrutura de resposta
- ✅ Melhorado tratamento de paginação
- ✅ Aprimorado mapeamento de dados de notificações

#### 9. **Melhorias no Serviço de Senha (PasswordService)**
- ✅ Refatorado métodos com melhor tratamento de erros
- ✅ Melhorado feedback para o usuário

#### 10. **Melhorias no Componente de Formulário de Projeto**
- ✅ Integrado `DialogService` para confirmações e alertas
- ✅ Melhorado tratamento de erros com diálogos informativos
- ✅ Refatorado carregamento de dados com melhor estrutura
- ✅ Melhorada validação de formulários
- ✅ Atualizado para usar novas interfaces

#### 11. **Melhorias no Componente de Configurações**
- ✅ Integrado `DialogService` para confirmações de exclusão
- ✅ Refatorado para usar `ConfigService` com novos métodos
- ✅ Melhorado tratamento de erros com diálogos
- ✅ Atualizado para usar novas interfaces consolidadas

#### 12. **Melhorias no Componente de Cadastros**
- ✅ Integrado `DialogService` para feedback ao usuário
- ✅ Melhorado tratamento de erros
- ✅ Refatorado métodos de carregamento

#### 13. **Melhorias em Outros Componentes da Secretaria**
- ✅ `FormularioAvaliadorComponent`: Integrado `DialogService`
- ✅ `ListagemAvaliadoresComponent`: Integrado `DialogService`
- ✅ `ListagemAlunosComponent`: Refatorado com melhor estrutura
- ✅ `NotificacoesComponent`: Integrado `DialogService`
- ✅ `RelatoriosComponent`: Integrado `DialogService`

#### 14. **Melhorias no Componente de Relatório (Orientador)**
- ✅ Integrado `DialogService` para confirmações
- ✅ Melhorado tratamento de erros

#### 15. **Melhorias em Componentes Compartilhados**
- ✅ `CadastroComponent`: Atualizado para usar novos serviços
- ✅ `ResetPasswordComponent`: Refatorado com melhor tratamento de erros
- ✅ `SidenavSecretariaComponent`: Atualizado com melhor estrutura

#### 16. **Atualizações de Rotas**
- ✅ Removidas rotas de componentes obsoletos (avaliador externo)
- ✅ Limpeza de rotas não utilizadas

#### 17. **Atualizações de Configuração**
- ✅ Atualizado `tsconfig.json` com novas configurações
- ✅ Atualizado `package.json` e `package-lock.json` com dependências

---

### 🐛 Correções

#### 1. **Serviços**
- ✅ Corrigido tratamento de tokens no `LoginService`
- ✅ Corrigido mapeamento de dados em `RelatorioService`
- ✅ Corrigido paginação em `InscricoesService`
- ✅ Corrigido tratamento de erros em todos os serviços

#### 2. **Componentes**
- ✅ Corrigido tratamento de erros em componentes da secretaria
- ✅ Corrigido feedback ao usuário com diálogos apropriados
- ✅ Corrigido carregamento de dados em formulários

#### 3. **Interfaces**
- ✅ Corrigida tipagem de interfaces
- ✅ Removidas interfaces duplicadas
- ✅ Consolidadas interfaces relacionadas

---

### 🗑️ Remoções

#### 1. **Componentes Removidos**
- ❌ Removido componente `FormularioAvaliacaoComponent` (Avaliador Externo):
  - `formulario-avaliacao.component.ts`
  - `formulario-avaliacao.component.html`
  - `formulario-avaliacao.component.css`
  - `formulario-avaliacao.component.spec.ts`
- **Motivo**: Componente não utilizado ou substituído por outra funcionalidade

#### 2. **Serviços Removidos**
- ❌ Removido `BolsaService`:
  - `bolsa.service.ts`
  - `bolsa.service.spec.ts`
- **Motivo**: Funcionalidades migradas para `ConfigService`

#### 3. **Interfaces Removidas**
- ❌ Removida interface `bolsa.ts` (consolidada em `configuracao.ts`)
- ❌ Removida interface `campus.ts` (consolidada em `configuracao.ts`)
- ❌ Removida interface `curso.ts` (consolidada em `configuracao.ts`)
- ❌ Removida interface `listagem.ts` (substituída por `listagem-projetos.ts`)
- **Motivo**: Consolidação de interfaces relacionadas para melhor organização

---

### 🔄 Refatorações

#### 1. **Código**
- ✅ Refatorado todos os serviços para usar padrões modernos do Angular
- ✅ Substituído `window.confirm()` e `window.alert()` por `DialogService`
- ✅ Melhorada organização de imports
- ✅ Removido código duplicado
- ✅ Melhorada tipagem com interfaces consolidadas

#### 2. **Estrutura**
- ✅ Consolidadas interfaces relacionadas em arquivos únicos
- ✅ Reorganizada estrutura de serviços
- ✅ Melhorada organização de componentes

#### 3. **Padrões**
- ✅ Implementado padrão de injeção com `inject()` onde apropriado
- ✅ Padronizado tratamento de erros com diálogos
- ✅ Melhorada consistência de código

---

### 📊 Estatísticas de Alterações

#### Arquivos Criados (4 arquivos)
- `src/app/services/dialog.service.ts` - 48 linhas (novo serviço de diálogos)
- `src/app/shared/confirm-dialog/confirm-dialog.component.ts` - 32 linhas
- `src/app/shared/confirm-dialog/confirm-dialog.component.html` - novo
- `src/app/shared/confirm-dialog/confirm-dialog.component.css` - novo
- `src/app/shared/confirm-dialog/confirm-dialog.component.spec.ts` - novo
- `src/app/shared/interfaces/configuracao.ts` - 37 linhas (consolidação)
- `src/app/shared/interfaces/listagem-alunos.ts` - 11 linhas
- `src/app/shared/interfaces/listagem-projetos.ts` - 15 linhas

#### Arquivos Modificados (29 arquivos)
- `src/app/app.routes.ts` - 7 linhas alteradas (remoção de rotas)
- `src/app/features/orientador/relatorio-form/relatorio-form.component.ts` - 16 linhas alteradas
- `src/app/features/secretaria/cadastros/cadastros.component.ts` - 34 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.ts` - 107 linhas alteradas
- `src/app/features/secretaria/formulario-avaliador/formulario-avaliador.component.ts` - 47 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.css` - 387 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.html` - 181 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.ts` - 354 linhas alteradas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.ts` - 41 linhas alteradas
- `src/app/features/secretaria/listagem-avaliadores/listagem-avaliadores.component.ts` - 51 linhas alteradas
- `src/app/features/secretaria/notificacoes/notificacoes.component.ts` - 20 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.ts` - 12 linhas alteradas
- `src/app/services/cadastro.service.ts` - 5 linhas alteradas
- `src/app/services/config.service.ts` - 69 linhas alteradas
- `src/app/services/inscricoes.service.ts` - 28 linhas alteradas
- `src/app/services/login.service.ts` - 41 linhas alteradas
- `src/app/services/notificacao.service.ts` - 19 linhas alteradas
- `src/app/services/password.service.ts` - 23 linhas alteradas
- `src/app/services/projeto.service.ts` - 257 linhas alteradas
- `src/app/services/relatorio.service.ts` - 129 linhas alteradas
- `src/app/shared/cadastro/cadastro.component.ts` - 4 linhas alteradas
- `src/app/shared/interfaces/projeto.ts` - 16 linhas alteradas
- `src/app/shared/reset-password/reset-password.component.ts` - 12 linhas alteradas
- `src/app/shared/sidenav/sidenav-secretaria.component.ts` - 15 linhas alteradas
- `tsconfig.json` - 1 linha alterada
- `package.json` - 2 linhas alteradas
- `package-lock.json` - 4 linhas alteradas

#### Arquivos Removidos (8 arquivos)
- `src/app/features/avaliador-externo/formulario-avaliacao/formulario-avaliacao.component.ts` - 76 linhas
- `src/app/features/avaliador-externo/formulario-avaliacao/formulario-avaliacao.component.html` - 26 linhas
- `src/app/features/avaliador-externo/formulario-avaliacao/formulario-avaliacao.component.css` - 15 linhas
- `src/app/features/avaliador-externo/formulario-avaliacao/formulario-avaliacao.component.spec.ts` - 64 linhas
- `src/app/services/bolsa.service.ts` - 31 linhas
- `src/app/services/bolsa.service.spec.ts` - 60 linhas
- `src/app/shared/interfaces/bolsa.ts` - 6 linhas
- `src/app/shared/interfaces/campus.ts` - 4 linhas
- `src/app/shared/interfaces/curso.ts` - 4 linhas
- `src/app/shared/interfaces/listagem.ts` - 15 linhas

---

### 🚀 Melhorias de Performance

- ✅ Otimização de serviços com melhor estrutura de dados
- ✅ Melhor tratamento de erros reduzindo tentativas desnecessárias
- ✅ Consolidação de interfaces reduzindo duplicação de código

---

### 🔒 Melhorias de Segurança

- ✅ Melhor tratamento de tokens JWT
- ✅ Validação aprimorada de dados de entrada
- ✅ Tratamento de erros mais robusto

---

### 📝 Notas Técnicas

#### Novos Serviços e Componentes
- `DialogService`: Serviço centralizado para gerenciamento de diálogos
  - Método `alert(mensagem, titulo)`: Exibe diálogo de alerta
  - Método `confirm(mensagem, titulo)`: Exibe diálogo de confirmação
- `ConfirmDialogComponent`: Componente reutilizável para diálogos
  - Suporta modos 'alert' e 'confirm'
  - Integrado com Material Design

#### Novas Interfaces
- `Configuracao`: Consolida interfaces de configuração (Campus, Curso, TipoBolsa, Bolsa)
- `ListagemAlunos`: Interface para visualização de alunos na secretaria
- `ListagemProjetos`: Interface para listagem de projetos com paginação

#### Dependências
- Nenhuma nova dependência adicionada
- Nenhuma dependência removida

---

### ✅ Testes e Validações

- ✅ Testado sistema de diálogos em todos os componentes
- ✅ Testado refatoração de serviços
- ✅ Testado consolidação de interfaces
- ✅ Validado remoção de componentes obsoletos
- ✅ Testado fluxo completo de funcionalidades da secretaria

---

### 🎯 Próximos Passos Sugeridos

1. Adicionar testes unitários para `DialogService` e `ConfirmDialogComponent`
2. Implementar mais tipos de diálogos (sucesso, erro, informação)
3. Adicionar animações nos diálogos
4. Implementar internacionalização (i18n) para mensagens
5. Adicionar documentação de uso do `DialogService`

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 26 de Novembro de 2025  
**Branch:** `main`

---

## [Data: 13/11/2025] - Correções de Redirecionamento e Reset de Senha

### 🎯 Resumo Geral
- **25 arquivos modificados**
- **1.450 inserções**, **572 deleções**
- Correções críticas de redirecionamento de cadastro
- Melhorias significativas no componente de reset de senha
- Atualizações em listagem de alunos e projetos
- Criação de docker-compose.yml
- Melhorias em testes e documentação

---

### ✨ Implementações

#### 1. **Melhorias no Componente de Reset de Senha**
- ✅ Refatorado completamente `ResetPasswordComponent` com melhor UX
- ✅ Adicionado novo layout HTML com melhor organização visual
- ✅ Implementado fluxo completo de reset de senha com validações
- ✅ Melhorado tratamento de erros e feedback ao usuário
- ✅ Adicionada validação de tokens e expiração

#### 2. **Melhorias no Componente de Listagem de Alunos**
- ✅ Refatorado `ListagemAlunosComponent` com melhor estrutura
- ✅ Melhorada interface HTML com melhor organização
- ✅ Aprimorado CSS com melhor responsividade
- ✅ Melhorada lógica de listagem e filtros

#### 3. **Melhorias no Componente de Listagem de Projetos**
- ✅ Refatorado CSS com redesign completo (712 linhas alteradas)
- ✅ Melhorada interface HTML com melhor organização
- ✅ Aprimorada lógica de listagem

#### 4. **Docker e Infraestrutura**
- ✅ Criado `docker-compose.yml` para facilitar deploy
- ✅ Configurado para build e execução simplificados

#### 5. **Melhorias em Testes**
- ✅ Atualizado `ConfiguracoesComponent.spec.ts` com 159 linhas adicionais
- ✅ Melhorado `ConfigService.spec.ts` com 74 linhas adicionais
- ✅ Adicionado `BolsaService.spec.ts` com 11 linhas

---

### 🐛 Correções

#### 1. **Redirecionamento de Cadastro**
- ✅ Corrigido redirecionamento após cadastro de usuários
- ✅ Ajustado fluxo de cadastro para diferentes perfis
- ✅ Melhorado tratamento de erros no cadastro

#### 2. **Reset de Senha**
- ✅ Corrigido fluxo completo de reset de senha
- ✅ Ajustado tratamento de tokens de reset
- ✅ Melhorado feedback ao usuário durante o processo
- ✅ Corrigida validação de formulário de reset

#### 3. **Componente de Login**
- ✅ Removidas linhas desnecessárias do HTML
- ✅ Melhorada lógica de login
- ✅ Ajustado tratamento de erros

#### 4. **Formulário de Projeto**
- ✅ Removidas linhas desnecessárias do HTML
- ✅ Ajustada lógica de formulário

#### 5. **Serviços**
- ✅ Ajustado `ConfigService` com pequenas correções
- ✅ Removido código não utilizado do `ProjetoService`

#### 6. **Componente de Cadastro**
- ✅ Ajustado redirecionamento após cadastro
- ✅ Melhorado tratamento de erros

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (25 arquivos)
- `CHANGELOG.md` - 392 linhas adicionadas
- `README.md` - 52 linhas alteradas
- `docker-compose.yml` - 31 linhas (novo arquivo)
- `package.json` - 2 linhas alteradas
- `proxy.conf.json` - 2 linhas alteradas
- `src/app/app.component.css` - 2 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - 159 linhas adicionadas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.html` - 2 linhas removidas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.ts` - 27 linhas alteradas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.css` - 4 linhas alteradas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.html` - 42 linhas alteradas
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.ts` - 167 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.css` - 712 linhas alteradas (redesign completo)
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.html` - 83 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.ts` - 22 linhas alteradas
- `src/app/services/bolsa.service.spec.ts` - 11 linhas adicionadas
- `src/app/services/config.service.spec.ts` - 74 linhas alteradas
- `src/app/services/config.service.ts` - 2 linhas alteradas
- `src/app/services/projeto.service.ts` - 20 linhas removidas
- `src/app/shared/cadastro/cadastro.component.ts` - 4 linhas alteradas
- `src/app/shared/login/login.component.html` - 10 linhas removidas
- `src/app/shared/login/login.component.ts` - 9 linhas alteradas
- `src/app/shared/reset-password/reset-password.component.html` - 125 linhas alteradas
- `src/app/shared/reset-password/reset-password.component.ts` - 66 linhas alteradas
- `src/styles.css` - 2 linhas alteradas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 13 de Novembro de 2025  
**Commit:** `0082176`

---

## [Data: 13/11/2025] - Melhorias de UI/UX e Refatorações de Componentes

### 🎯 Resumo Geral
- **17 arquivos modificados**
- **975 inserções**, **453 deleções**
- Melhorias significativas na interface de listagem de projetos
- Refatoração do componente de configurações (bolsas)
- Melhorias no formulário de projeto
- Remoção de componentes de debug não utilizados
- Aprimoramentos de estilos e responsividade

---

### ✨ Implementações

#### 1. **Melhorias no Componente de Listagem de Projetos**
- ✅ Implementado sistema de paginação responsivo com cálculo dinâmico de tamanho de página
- ✅ Adicionado scroll automático para o topo ao mudar de página ou filtrar
- ✅ Implementado sistema de menu dropdown para ações de projeto (Secretaria)
- ✅ Adicionado suporte para múltiplas ações: concluir, cancelar, tornar inadimplente
- ✅ Implementado cálculo e exibição de progresso de projetos (barra de progresso)
- ✅ Adicionado sistema de filtros por status (Todos, Em Execução, Concluídos)
- ✅ Melhorada exibição de notas e média de projetos
- ✅ Implementado sistema de hidratação de dados (alunos selecionados e notas)
- ✅ Adicionado suporte para diferentes modos de visualização (Secretaria, Orientador, Aluno)
- ✅ Melhorada responsividade com grid adaptativo (4 colunas → 2 → 1)
- ✅ Implementado controle de scrollbars (ocultação condicional)
- ✅ Adicionado sistema de debounce para filtros de busca

#### 2. **Refatoração do Componente de Configurações (Bolsas)**
- ✅ Refatorado método `cadastrarBolsaAluno()` para usar novo endpoint `POST /bolsas/`
- ✅ Implementado método `create()` no `BolsaService` para criação de bolsas
- ✅ Melhorado formulário de cadastro de bolsa com seleção de aluno e checkbox de status
- ✅ Adicionado feedback visual após criação de bolsa
- ✅ Melhorada função de filtro de bolsas com normalização de texto
- ✅ Implementado toggle otimista de status de bolsa (atualização imediata com rollback em caso de erro)
- ✅ Adicionada formatação `properCase` para nomes de alunos na listagem

#### 3. **Melhorias no Formulário de Projeto**
- ✅ Refatorado método `listarOrientadoresAprovados()` para usar endpoint específico
- ✅ Melhorado carregamento de projeto em modo de edição
- ✅ Adicionado suporte para exibição de notas do projeto (Nota 1, Nota 2, Nota Final)
- ✅ Implementado sistema de status visual para notas (Aprovado, Reprovado, Pendente)
- ✅ Melhorada validação de formulário com mensagens mais claras
- ✅ Adicionado suporte para diferentes modos de visualização (SECRETARIA, ORIENTADOR, ALUNO)
- ✅ Implementado controle de campos read-only baseado no modo de visualização

#### 4. **Serviço de Projeto (ProjetoService)**
- ✅ Adicionado método `listarOrientadoresAprovados()` para filtrar apenas orientadores aprovados
- ✅ Melhorado método `listarInscricoesPorProjeto()` com melhor tratamento de dados
- ✅ Refatorado método `cadastrarProjetoCompleto()` com validações aprimoradas
- ✅ Adicionado método `listarNotasDoProjeto()` para buscar notas de avaliação

#### 5. **Serviço de Bolsa (BolsaService)**
- ✅ Implementado método `create()` para criação de registro de bolsa
- ✅ Implementado método `setStatus()` para atualização de status de bolsa
- ✅ Interface `BolsaRow` movida para arquivo dedicado (`shared/interfaces/bolsa.ts`)

#### 6. **Melhorias de Estilos Globais**
- ✅ Adicionado suporte para estilos de scrollbar customizados
- ✅ Implementado sistema de ocultação de scrollbars (`.hide-scrollbars`)
- ✅ Melhorados estilos de selects nativos com seta SVG embutida
- ✅ Adicionado suporte para acessibilidade em selects (min-height em mobile)

---

### 🐛 Correções

#### 1. **Componente de Configurações**
- ✅ Corrigido endpoint de criação de bolsa para usar `POST /bolsas/` ao invés de tipos
- ✅ Corrigido método `cadastrarBolsaAluno()` para usar `BolsaService.create()`
- ✅ Melhorado tratamento de erros com mensagens mais descritivas
- ✅ Corrigido reset de formulário após criação bem-sucedida

#### 2. **Listagem de Projetos**
- ✅ Corrigido cálculo de paginação para evitar páginas inválidas
- ✅ Corrigido scroll para topo ao mudar de página
- ✅ Corrigido fechamento de menu dropdown ao clicar fora
- ✅ Corrigido tratamento de projetos sem ID válido
- ✅ Melhorado tratamento de erros de carregamento com mensagens específicas

#### 3. **Formulário de Projeto**
- ✅ Corrigido carregamento de orientador em modo de edição
- ✅ Corrigido carregamento de campus em modo de edição
- ✅ Melhorado tratamento de projetos não encontrados

#### 4. **Rotas (app.routes.ts)**
- ✅ Removida rota de debug (`health`) não utilizada
- ✅ Mantidas rotas de reset de senha para diferentes perfis

---

### 🗑️ Remoções

#### 1. **Componente de Debug (Health)**
- ❌ Removido componente `health.component.ts` completamente
- ❌ Removido arquivo de teste `health.component.spec.ts`
- **Motivo**: Componente de debug não utilizado em produção
- **Impacto**: Nenhum, componente não estava sendo usado

#### 2. **Serviço de Configurações**
- ❌ Removidos métodos de tipos de bolsa não utilizados:
  - `listarTiposBolsa()`
  - `criarTipoBolsa()`
  - `excluirTipoBolsa()`
- **Motivo**: Funcionalidade de tipos de bolsa não está sendo utilizada
- **Nota**: Métodos podem ser restaurados se necessário no futuro

---

### 🎨 Melhorias de UI/UX

#### 1. **Listagem de Projetos**
- ✅ Design moderno com cards com gradientes e sombras
- ✅ Animações suaves de hover e transições
- ✅ Barra de progresso visual para status de preenchimento
- ✅ Menu dropdown elegante com ícones e cores semânticas
- ✅ Paginação fixa no rodapé com indicador de página atual
- ✅ Estados visuais claros (loading, erro, vazio, sem resultados)
- ✅ Responsividade completa (desktop, tablet, mobile)
- ✅ Grid adaptativo: 4 colunas → 2 colunas → 1 coluna

#### 2. **Formulário de Projeto**
- ✅ Seção de notas com cards individuais e status visual
- ✅ Indicadores de status (Aprovado ✓, Reprovado ✗, Pendente ⏳)
- ✅ Melhor organização visual de campos
- ✅ Feedback visual para campos desabilitados (read-only)

#### 3. **Configurações (Bolsas)**
- ✅ Formulário inline para cadastro rápido
- ✅ Feedback visual após criação de bolsa
- ✅ Toggle switch estilizado para status de bolsa
- ✅ Tabela responsiva com filtro em tempo real

---

### 🔄 Refatorações

#### 1. **Código**
- ✅ Refatorado componente de listagem de projetos com melhor separação de responsabilidades
- ✅ Extraída lógica de paginação para métodos privados
- ✅ Melhorada organização de métodos por funcionalidade
- ✅ Refatorado sistema de filtros com Subject e debounce
- ✅ Melhorada tipagem com interfaces específicas

#### 2. **Estrutura**
- ✅ Interface `BolsaRow` movida para `shared/interfaces/bolsa.ts`
- ✅ Melhorada organização de imports
- ✅ Removido código não utilizado

#### 3. **Performance**
- ✅ Implementado debounce para filtros (120ms)
- ✅ Otimizado carregamento de dados com forkJoin
- ✅ Melhorado cálculo de paginação (evita recálculos desnecessários)
- ✅ Implementado trackBy para melhor performance do *ngFor

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (17 arquivos)
- `src/app/app.routes.ts` - 9 linhas alteradas (remoção de rota de debug)
- `src/app/features/secretaria/configuracoes/configuracoes.component.html` - 46 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - 3 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.ts` - 76 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.html` - 50 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.ts` - 73 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.css` - 246 linhas alteradas (redesign completo)
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.html` - 427 linhas alteradas (redesign completo)
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.spec.ts` - 27 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.ts` - 153 linhas alteradas
- `src/app/services/config.service.ts` - 3 linhas removidas (métodos não utilizados)
- `src/app/services/projeto.service.ts` - 28 linhas alteradas
- `src/app/shared/interfaces/bolsa.ts` - 8 linhas alteradas
- `src/styles.css` - 9 linhas adicionadas (scrollbars e selects)

#### Arquivos Removidos
- `src/app/debug/health.component.ts` - 8 linhas
- `src/app/debug/health.component.spec.ts` - 17 linhas

---

### 🚀 Melhorias de Performance

- ✅ Debounce em filtros de busca (120ms)
- ✅ Otimização de renderização com trackBy
- ✅ Lazy loading de dados com forkJoin
- ✅ Cálculo dinâmico de tamanho de página baseado em viewport
- ✅ Scroll otimizado com scrollIntoView

---

### 🔒 Melhorias de Segurança

- ✅ Validação aprimorada de IDs antes de requisições
- ✅ Tratamento de erros mais robusto
- ✅ Validação de permissões por perfil (Secretaria, Orientador, Aluno)

---

### 📝 Notas Técnicas

#### Novos Métodos e Funcionalidades
- `ListagemProjetosComponent.computePageSize()`: Calcula tamanho de página baseado em viewport
- `ListagemProjetosComponent.scrollToTopOfList()`: Scroll suave para o topo
- `ListagemProjetosComponent.hidratarSelecionados()`: Carrega alunos selecionados
- `ListagemProjetosComponent.hidratarNotas()`: Carrega notas de projetos
- `BolsaService.create()`: Cria registro de bolsa
- `BolsaService.setStatus()`: Atualiza status de bolsa
- `ProjetoService.listarOrientadoresAprovados()`: Lista apenas orientadores aprovados

#### Dependências
- Nenhuma nova dependência adicionada
- Nenhuma dependência removida

---

### ✅ Testes e Validações

- ✅ Testado fluxo de listagem de projetos com paginação
- ✅ Testado sistema de filtros e busca
- ✅ Testado cadastro de bolsa
- ✅ Testado toggle de status de bolsa
- ✅ Testado formulário de projeto em diferentes modos
- ✅ Testado responsividade em diferentes tamanhos de tela
- ✅ Testado scroll e navegação

---

### 🎯 Próximos Passos Sugeridos

1. Adicionar testes unitários para novos métodos implementados
2. Implementar cache para dados de projetos
3. Adicionar loading skeleton durante carregamento
4. Implementar infinite scroll como alternativa à paginação
5. Adicionar exportação de dados (Excel/PDF) para listagem de projetos

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 13 de Novembro de 2025  
**Branch:** `main`

---

## [Data: 10/11/2025] - Atualização de Testes e Configuração Docker

### 🎯 Resumo Geral
- **4 arquivos de teste atualizados**
- **1 arquivo docker-compose.yml criado**
- Melhorias na cobertura de testes
- Configuração Docker simplificada para desenvolvimento e produção

---

### ✅ Qualidade e Testes

#### 1. **Atualização dos Testes do ConfigService**
- ✅ Adicionados testes para métodos de Campus (listar, criar, excluir)
- ✅ Adicionados testes para métodos de Cursos (listar, criar, excluir)
- ✅ Adicionados testes para métodos de Tipos de Bolsa (listar, criar, excluir)
- ✅ Cobertura completa de todos os métodos do serviço
- ✅ Validação de métodos HTTP corretos (GET, POST, DELETE)
- ✅ Validação de payloads de requisição

#### 2. **Atualização dos Testes do BolsaService**
- ✅ Adicionado teste para método `create()` (criação de bolsa)
- ✅ Teste existente para método `setStatus()` mantido
- ✅ Validação de endpoint POST `/bolsas/`
- ✅ Validação de payload com `id_aluno` e `possui_bolsa`

#### 3. **Atualização dos Testes do ConfiguracoesComponent**
- ✅ Refatorado para usar `BolsaService` ao invés de `ConfigService` para bolsas
- ✅ Adicionados testes para criação de bolsa
- ✅ Adicionados testes para toggle de status de bolsa
- ✅ Adicionado teste para rollback de status em caso de erro
- ✅ Adicionado teste para filtro de bolsas
- ✅ Adicionados testes para Campus e Cursos
- ✅ Cobertura completa de todas as funcionalidades do componente
- ✅ Separação clara de responsabilidades entre `ConfigService` e `BolsaService`

---

### 🐳 Docker e Infraestrutura

#### 1. **Criação do docker-compose.yml**
- ✅ Arquivo `docker-compose.yml` criado para facilitar execução do frontend
- ✅ Configuração de build automático do Dockerfile
- ✅ Mapeamento de porta 8080:80 (frontend acessível em http://localhost:8080)
- ✅ Healthcheck configurado para verificação de saúde do container
- ✅ Network isolado (`fronttcc-network`)
- ✅ Restart policy configurada (`unless-stopped`)
- ✅ Suporte para volumes (opcional para desenvolvimento)

#### 2. **Comandos Docker**
- ✅ Comando simplificado: `docker compose up --build`
- ✅ Build automático da imagem Angular
- ✅ Configuração Nginx incluída
- ✅ Proxy para backend configurado via Nginx

---

### 🐛 Correções

#### 1. **Testes do ConfiguracoesComponent**
- ✅ Corrigido uso incorreto de `ConfigService` para bolsas
- ✅ Corrigido para usar `BolsaService` corretamente
- ✅ Removidos métodos inexistentes dos stubs de teste
- ✅ Adicionados stubs corretos para `BolsaService`

---

### 📊 Estatísticas de Alterações

#### Arquivos de Teste Atualizados (3 arquivos)
- `src/app/services/config.service.spec.ts` - 72 linhas adicionadas (testes completos)
- `src/app/services/bolsa.service.spec.ts` - 9 linhas adicionadas (teste de create)
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - 101 linhas alteradas (refatoração completa)

#### Arquivos Criados (1 arquivo)
- `docker-compose.yml` - 32 linhas (configuração Docker completa)

---

### 🚀 Melhorias de Infraestrutura

- ✅ Configuração Docker simplificada
- ✅ Build e execução em um único comando
- ✅ Healthcheck automático
- ✅ Network isolado para melhor organização
- ✅ Suporte para desenvolvimento e produção

---

### 📝 Notas Técnicas

#### Testes
- Todos os testes agora validam métodos HTTP corretos
- Validação de payloads de requisição
- Cobertura completa de funcionalidades
- Separação clara de responsabilidades entre serviços

#### Docker
- Imagem base: `node:20-alpine` para build
- Imagem final: `nginx:1.27-alpine` para produção
- Proxy Nginx configurado para `/api/` → backend
- Porta padrão: 80 (mapeada para 8080 no host)

#### Comandos Úteis
```bash
# Build e executar container
docker compose up --build

# Executar em background
docker compose up -d --build

# Ver logs
docker compose logs -f

# Parar container
docker compose down
```

---

### ✅ Testes e Validações

- ✅ Todos os testes do ConfigService passando
- ✅ Todos os testes do BolsaService passando
- ✅ Todos os testes do ConfiguracoesComponent passando
- ✅ Docker compose buildando corretamente
- ✅ Container executando e respondendo corretamente
- ✅ Healthcheck funcionando

---

### 🎯 Próximos Passos Sugeridos

1. Adicionar testes de integração end-to-end
2. Configurar CI/CD com Docker
3. Adicionar variáveis de ambiente para configuração do backend
4. Implementar multi-stage build otimizado
5. Adicionar testes de carga para container

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 10 de Novembro de 2025  
**Branch:** `main`

---

## [Data: 11/11/2025] - Correção de Botões dos Formulários e Responsividade

### 🎯 Resumo Geral
- **17 arquivos modificados**
- **975 inserções**, **453 deleções**
- Correções de botões em formulários
- Melhorias de responsividade em componentes
- Ajustes em listagem de projetos
- Melhorias em configurações

---

### ✨ Implementações

#### 1. **Melhorias no Componente de Listagem de Projetos**
- ✅ Redesign completo do CSS (246 linhas alteradas)
- ✅ Melhorias significativas no HTML (427 linhas alteradas)
- ✅ Aprimorada lógica de listagem (153 linhas alteradas)
- ✅ Melhorada responsividade e layout

#### 2. **Melhorias no Componente de Configurações**
- ✅ Refatorado HTML com melhor organização (46 linhas alteradas)
- ✅ Melhorada lógica do componente (76 linhas alteradas)
- ✅ Atualizado arquivo de teste (3 linhas alteradas)

#### 3. **Melhorias no Formulário de Projeto**
- ✅ Ajustado HTML removendo linhas desnecessárias (50 linhas alteradas)
- ✅ Refatorada lógica do componente (73 linhas alteradas)

#### 4. **Melhorias de Estilos Globais**
- ✅ Adicionados estilos de scrollbar customizados (9 linhas adicionadas)
- ✅ Melhorada responsividade geral

---

### 🐛 Correções

#### 1. **Botões dos Formulários**
- ✅ Corrigidos botões em todos os formulários
- ✅ Melhorada consistência visual dos botões
- ✅ Ajustados estilos de botões para melhor responsividade

#### 2. **Responsividade**
- ✅ Corrigida responsividade em diferentes tamanhos de tela
- ✅ Ajustados layouts para mobile e tablet
- ✅ Melhorada experiência em dispositivos menores

#### 3. **Listagem de Projetos**
- ✅ Corrigido cálculo de paginação
- ✅ Ajustado scroll e navegação
- ✅ Melhorado tratamento de erros

#### 4. **Rotas**
- ✅ Removida rota de debug não utilizada
- ✅ Ajustadas rotas para melhor organização

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (17 arquivos)
- `src/app/app.routes.ts` - 9 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.html` - 46 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - 3 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.ts` - 76 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.html` - 50 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.ts` - 73 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.css` - 246 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.html` - 427 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.spec.ts` - 27 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.ts` - 153 linhas alteradas
- `src/app/services/config.service.ts` - 3 linhas removidas
- `src/app/services/projeto.service.ts` - 28 linhas alteradas
- `src/app/shared/interfaces/bolsa.ts` - 8 linhas alteradas
- `src/styles.css` - 9 linhas adicionadas

#### Arquivos Removidos
- `src/app/debug/health.component.ts` - 8 linhas
- `src/app/debug/health.component.spec.ts` - 17 linhas

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 11 de Novembro de 2025  
**Commit:** `85f6538`

---

## [Data: 09/11/2025] - Melhorias de UI/UX e refatorações

### 🎯 Resumo Geral
- **16 arquivos modificados**
- **730 inserções**, **453 deleções**
- Melhorias significativas na interface de listagem de projetos
- Refatoração do componente de configurações (bolsas)
- Melhorias no formulário de projeto
- Remoção de componentes de debug não utilizados
- Aprimoramentos de estilos e responsividade

---

### ✨ Implementações

#### 1. **Melhorias no Componente de Listagem de Projetos**
- ✅ Implementado sistema de paginação responsivo com cálculo dinâmico de tamanho de página
- ✅ Adicionado scroll automático para o topo ao mudar de página ou filtrar
- ✅ Implementado sistema de menu dropdown para ações de projeto (Secretaria)
- ✅ Adicionado suporte para múltiplas ações: concluir, cancelar, tornar inadimplente
- ✅ Implementado cálculo e exibição de progresso de projetos (barra de progresso)
- ✅ Adicionado sistema de filtros por status (Todos, Em Execução, Concluídos)
- ✅ Melhorada exibição de notas e média de projetos
- ✅ Implementado sistema de hidratação de dados (alunos selecionados e notas)
- ✅ Adicionado suporte para diferentes modos de visualização (Secretaria, Orientador, Aluno)
- ✅ Melhorada responsividade com grid adaptativo (4 colunas → 2 → 1)
- ✅ Implementado controle de scrollbars (ocultação condicional)
- ✅ Adicionado sistema de debounce para filtros de busca

#### 2. **Refatoração do Componente de Configurações (Bolsas)**
- ✅ Refatorado método `cadastrarBolsaAluno()` para usar novo endpoint `POST /bolsas/`
- ✅ Implementado método `create()` no `BolsaService` para criação de bolsas
- ✅ Melhorado formulário de cadastro de bolsa com seleção de aluno e checkbox de status
- ✅ Adicionado feedback visual após criação de bolsa
- ✅ Melhorada função de filtro de bolsas com normalização de texto
- ✅ Implementado toggle otimista de status de bolsa (atualização imediata com rollback em caso de erro)
- ✅ Adicionada formatação `properCase` para nomes de alunos na listagem

#### 3. **Melhorias no Formulário de Projeto**
- ✅ Refatorado método `listarOrientadoresAprovados()` para usar endpoint específico
- ✅ Melhorado carregamento de projeto em modo de edição
- ✅ Adicionado suporte para exibição de notas do projeto (Nota 1, Nota 2, Nota Final)
- ✅ Implementado sistema de status visual para notas (Aprovado, Reprovado, Pendente)
- ✅ Melhorada validação de formulário com mensagens mais claras
- ✅ Adicionado suporte para diferentes modos de visualização (SECRETARIA, ORIENTADOR, ALUNO)
- ✅ Implementado controle de campos read-only baseado no modo de visualização

#### 4. **Serviço de Projeto (ProjetoService)**
- ✅ Adicionado método `listarOrientadoresAprovados()` para filtrar apenas orientadores aprovados
- ✅ Melhorado método `listarInscricoesPorProjeto()` com melhor tratamento de dados
- ✅ Refatorado método `cadastrarProjetoCompleto()` com validações aprimoradas
- ✅ Adicionado método `listarNotasDoProjeto()` para buscar notas de avaliação

#### 5. **Serviço de Bolsa (BolsaService)**
- ✅ Implementado método `create()` para criação de registro de bolsa
- ✅ Implementado método `setStatus()` para atualização de status de bolsa
- ✅ Interface `BolsaRow` movida para arquivo dedicado (`shared/interfaces/bolsa.ts`)

#### 6. **Melhorias de Estilos Globais**
- ✅ Adicionado suporte para estilos de scrollbar customizados
- ✅ Implementado sistema de ocultação de scrollbars (`.hide-scrollbars`)
- ✅ Melhorados estilos de selects nativos com seta SVG embutida
- ✅ Adicionado suporte para acessibilidade em selects (min-height em mobile)

---

### 🐛 Correções

#### 1. **Componente de Configurações**
- ✅ Corrigido endpoint de criação de bolsa para usar `POST /bolsas/` ao invés de tipos
- ✅ Corrigido método `cadastrarBolsaAluno()` para usar `BolsaService.create()`
- ✅ Melhorado tratamento de erros com mensagens mais descritivas
- ✅ Corrigido reset de formulário após criação bem-sucedida

#### 2. **Listagem de Projetos**
- ✅ Corrigido cálculo de paginação para evitar páginas inválidas
- ✅ Corrigido scroll para topo ao mudar de página
- ✅ Corrigido fechamento de menu dropdown ao clicar fora
- ✅ Corrigido tratamento de projetos sem ID válido
- ✅ Melhorado tratamento de erros de carregamento com mensagens específicas

#### 3. **Formulário de Projeto**
- ✅ Corrigido carregamento de orientador em modo de edição
- ✅ Corrigido carregamento de campus em modo de edição
- ✅ Melhorado tratamento de projetos não encontrados

#### 4. **Rotas (app.routes.ts)**
- ✅ Removida rota de debug (`health`) não utilizada
- ✅ Mantidas rotas de reset de senha para diferentes perfis

---

### 🗑️ Remoções

#### 1. **Componente de Debug (Health)**
- ❌ Removido componente `health.component.ts` completamente
- ❌ Removido arquivo de teste `health.component.spec.ts`
- **Motivo**: Componente de debug não utilizado em produção
- **Impacto**: Nenhum, componente não estava sendo usado

#### 2. **Serviço de Configurações**
- ❌ Removidos métodos de tipos de bolsa não utilizados:
  - `listarTiposBolsa()`
  - `criarTipoBolsa()`
  - `excluirTipoBolsa()`
- **Motivo**: Funcionalidade de tipos de bolsa não está sendo utilizada
- **Nota**: Métodos podem ser restaurados se necessário no futuro

---

### 🎨 Melhorias de UI/UX

#### 1. **Listagem de Projetos**
- ✅ Design moderno com cards com gradientes e sombras
- ✅ Animações suaves de hover e transições
- ✅ Barra de progresso visual para status de preenchimento
- ✅ Menu dropdown elegante com ícones e cores semânticas
- ✅ Paginação fixa no rodapé com indicador de página atual
- ✅ Estados visuais claros (loading, erro, vazio, sem resultados)
- ✅ Responsividade completa (desktop, tablet, mobile)
- ✅ Grid adaptativo: 4 colunas → 2 colunas → 1 coluna

#### 2. **Formulário de Projeto**
- ✅ Seção de notas com cards individuais e status visual
- ✅ Indicadores de status (Aprovado ✓, Reprovado ✗, Pendente ⏳)
- ✅ Melhor organização visual de campos
- ✅ Feedback visual para campos desabilitados (read-only)

#### 3. **Configurações (Bolsas)**
- ✅ Formulário inline para cadastro rápido
- ✅ Feedback visual após criação de bolsa
- ✅ Toggle switch estilizado para status de bolsa
- ✅ Tabela responsiva com filtro em tempo real

---

### 🔄 Refatorações

#### 1. **Código**
- ✅ Refatorado componente de listagem de projetos com melhor separação de responsabilidades
- ✅ Extraída lógica de paginação para métodos privados
- ✅ Melhorada organização de métodos por funcionalidade
- ✅ Refatorado sistema de filtros com Subject e debounce
- ✅ Melhorada tipagem com interfaces específicas

#### 2. **Estrutura**
- ✅ Interface `BolsaRow` movida para `shared/interfaces/bolsa.ts`
- ✅ Melhorada organização de imports
- ✅ Removido código não utilizado

#### 3. **Performance**
- ✅ Implementado debounce para filtros (120ms)
- ✅ Otimizado carregamento de dados com forkJoin
- ✅ Melhorado cálculo de paginação (evita recálculos desnecessários)
- ✅ Implementado trackBy para melhor performance do *ngFor

---

### 📊 Estatísticas de Alterações

#### Arquivos Modificados (16 arquivos)
- `src/app/app.routes.ts` - 9 linhas alteradas (remoção de rota de debug)
- `src/app/features/secretaria/configuracoes/configuracoes.component.html` - 46 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - 3 linhas alteradas
- `src/app/features/secretaria/configuracoes/configuracoes.component.ts` - 76 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.html` - 50 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.ts` - 73 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.css` - 246 linhas alteradas (redesign completo)
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.html` - 427 linhas alteradas (redesign completo)
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.spec.ts` - 27 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.ts` - 153 linhas alteradas
- `src/app/services/config.service.ts` - 3 linhas removidas (métodos não utilizados)
- `src/app/services/projeto.service.ts` - 28 linhas alteradas
- `src/app/shared/interfaces/bolsa.ts` - 8 linhas alteradas
- `src/styles.css` - 9 linhas adicionadas (scrollbars e selects)

#### Arquivos Removidos
- `src/app/debug/health.component.ts` - 8 linhas
- `src/app/debug/health.component.spec.ts` - 17 linhas

---

### 🚀 Melhorias de Performance

- ✅ Debounce em filtros de busca (120ms)
- ✅ Otimização de renderização com trackBy
- ✅ Lazy loading de dados com forkJoin
- ✅ Cálculo dinâmico de tamanho de página baseado em viewport
- ✅ Scroll otimizado com scrollIntoView

---

### 🔒 Melhorias de Segurança

- ✅ Validação aprimorada de IDs antes de requisições
- ✅ Tratamento de erros mais robusto
- ✅ Validação de permissões por perfil (Secretaria, Orientador, Aluno)

---

### 📝 Notas Técnicas

#### Novos Métodos e Funcionalidades
- `ListagemProjetosComponent.computePageSize()`: Calcula tamanho de página baseado em viewport
- `ListagemProjetosComponent.scrollToTopOfList()`: Scroll suave para o topo
- `ListagemProjetosComponent.hidratarSelecionados()`: Carrega alunos selecionados
- `ListagemProjetosComponent.hidratarNotas()`: Carrega notas de projetos
- `BolsaService.create()`: Cria registro de bolsa
- `BolsaService.setStatus()`: Atualiza status de bolsa
- `ProjetoService.listarOrientadoresAprovados()`: Lista apenas orientadores aprovados

#### Dependências
- Nenhuma nova dependência adicionada
- Nenhuma dependência removida

---

### ✅ Testes e Validações

- ✅ Testado fluxo de listagem de projetos com paginação
- ✅ Testado sistema de filtros e busca
- ✅ Testado cadastro de bolsa
- ✅ Testado toggle de status de bolsa
- ✅ Testado formulário de projeto em diferentes modos
- ✅ Testado responsividade em diferentes tamanhos de tela
- ✅ Testado scroll e navegação

---

### 🎯 Próximos Passos Sugeridos

1. Adicionar testes unitários para novos métodos implementados
2. Implementar cache para dados de projetos
3. Adicionar loading skeleton durante carregamento
4. Implementar infinite scroll como alternativa à paginação
5. Adicionar exportação de dados (Excel/PDF) para listagem de projetos

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 09 de Novembro de 2025  
**Branch:** `main`

---

## [Data: 08/11/2025] - Qualidade e automação de testes

### 🎯 Resumo Geral
- **31 arquivos de teste criados/modificados**
- **Novo serviço de senha implementado**
- **Refatoração do módulo de configurações**
- **Correção crítica de URLs de API**

---

### ✅ Qualidade e Testes

#### Testes de Componentes
- ✅ **AppComponent**: Testes de renderização e lógica de roteamento
- ✅ **HomeComponent**: Testes de componente principal
- ✅ **FooterComponent**: Testes de exibição condicional
- ✅ **HealthComponent**: Testes de verificação de rotas
- ✅ **LoginComponent**: Testes de autenticação e formulário
- ✅ **CadastroComponent**: Testes de registro de usuários
- ✅ **ResetPasswordComponent**: Testes de redefinição de senha
- ✅ **SidenavSecretariaComponent**: Testes de navegação lateral

#### Testes de Funcionalidades da Secretaria
- ✅ **ConfiguracoesComponent**: Testes de CRUD de campus, cursos e bolsas
- ✅ **CadastrosComponent**: Testes de gerenciamento de cadastros
- ✅ **ListagemAlunosComponent**: Testes de listagem e seleção de alunos
- ✅ **ListagemAvaliadoresComponent**: Testes de gerenciamento de avaliadores
- ✅ **ListagemProjetosComponent**: Testes de listagem de projetos
- ✅ **FormularioProjetoComponent**: Testes de formulário de projeto
- ✅ **FormularioAvaliadorComponent**: Testes de formulário de avaliador
- ✅ **RelatoriosComponent**: Testes de relatórios mensais
- ✅ **NotificacoesComponent**: Testes de notificações
- ✅ **EnvioDeEmailComponent**: Testes de envio de e-mails
- ✅ **DashboardComponent**: Testes de dashboard
- ✅ **EnviarAvaliacoesModal**: Testes de modal de avaliações

#### Testes de Funcionalidades do Orientador
- ✅ **RelatorioFormComponent**: Testes de formulário de relatório

#### Testes de Funcionalidades do Avaliador Externo
- ✅ **FormularioAvaliacaoComponent**: Testes de formulário de avaliação externa

#### Testes de Serviços HTTP
- ✅ **AuthService**: Testes de autenticação e autorização
- ✅ **LoginService**: Testes de login e SSO
- ✅ **CadastroService**: Testes de cadastro de usuários
- ✅ **ProjetoService**: Testes de CRUD de projetos, serialização de payloads e tratamento de erros
- ✅ **InscricoesService**: Testes de gerenciamento de inscrições
- ✅ **RelatorioService**: Testes de relatórios mensais
- ✅ **NotificacaoService**: Testes de notificações
- ✅ **ConfigService**: Testes de configurações (campus, cursos, bolsas)
- ✅ **BolsaService**: Testes de gerenciamento de bolsas

#### Cobertura de Testes
- ✅ Testes unitários para todos os componentes standalone
- ✅ Testes de integração para serviços HTTP
- ✅ Validação de serialização correta de payloads
- ✅ Tratamento de erros em todos os serviços
- ✅ Testes de renderização e lógica de componentes
- ✅ Testes de roteamento e navegação

---

### ✨ Implementações

#### 1. **Novo Serviço de Senha (PasswordService)**
- ✅ Criado serviço dedicado para gerenciamento de senhas
- ✅ Implementado método `forgotPassword()` para envio de e-mail de redefinição
- ✅ Implementado método `resetPassword()` para confirmação de redefinição via token
- ✅ Localização: `src/app/services/password.service.ts`

#### 2. **Refatoração do Componente de Configurações**
- ✅ Integrado CRUD de Tipos de Bolsa no componente de configurações
- ✅ Implementada listagem de alunos para atribuição de bolsas
- ✅ Adicionado filtro de busca por nome ou e-mail para bolsas
- ✅ Implementado toggle de status de bolsa por aluno
- ✅ Adicionada formatação `properCase` para nomes de alunos
- ✅ Implementada normalização de texto (remoção de acentos) para buscas
- ✅ Melhorada interface de usuário com tabs do Material Design

#### 3. **Serviço de Configurações (ConfigService)**
- ✅ Adicionados métodos para CRUD de Tipos de Bolsa:
  - `listarTiposBolsa()`: Lista todos os tipos de bolsa
  - `criarTipoBolsa(body: { nome: string })`: Cria novo tipo de bolsa
  - `excluirTipoBolsa(id_bolsa: number)`: Exclui tipo de bolsa
- ✅ Endpoints configurados para `/bolsas/tipos`

#### 4. **Serviço de Bolsas (BolsaService)**
- ✅ Implementado método `listar()` para listar alunos com status de bolsa
- ✅ Implementado método `setStatus()` para atualizar status de bolsa de aluno
- ✅ Interface `BolsaRow` definida com campos: `id_aluno`, `nome_completo`, `email`, `possui_bolsa`

#### 5. **Melhorias no Serviço de Notificações**
- ✅ Refatorado método `getNotificacoes()` para usar paginação padrão
- ✅ Melhorado método `marcarTodasComoLidas()` com parâmetros corretos
- ✅ Ajustada estrutura de resposta da API

---

### 🐛 Correções

#### 1. **Correção Crítica de URLs de API (Environment)**
- ✅ **Problema**: `ERR_CONNECTION_REFUSED` ao servir o frontend em portas não padrão
- ✅ **Solução**: Implementada função `resolveUrl()` que calcula automaticamente URLs baseadas no `window.location.origin`
- ✅ **Arquivos Afetados**:
  - `src/environments/environment.ts`
- ✅ **URLs Corrigidas**:
  - `apiBaseUrl`: Agora resolve automaticamente baseado na origem atual
  - `ssoRedirectUrl`: Resolve automaticamente para evitar CORS
  - `emailApiBaseUrl`: Resolve automaticamente através do proxy
- ✅ **Benefícios**:
  - Elimina erros de conexão em diferentes portas
  - Funciona automaticamente em desenvolvimento e produção
  - Suporta URLs absolutas (http/https) e relativas
  - Compatível com proxy local

#### 2. **Correção no Componente de Reset de Senha**
- ✅ Integrado com novo `PasswordService`
- ✅ Melhorado tratamento de erros
- ✅ Validação de tokens aprimorada

#### 3. **Correção na Sidenav**
- ✅ Removido link para componente `atribuir-bolsas` (removido)
- ✅ Adicionado link para configurações com gerenciamento de bolsas integrado

---

### 🗑️ Remoções

#### 1. **Componente Atribuir Bolsas**
- ❌ Removido componente `atribuir-bolsas` completamente:
  - `atribuir-bolsas.component.ts`
  - `atribuir-bolsas.component.html`
  - `atribuir-bolsas.component.css`
  - `atribuir-bolsas.component.spec.ts`
- **Motivo**: Funcionalidade integrada ao componente de configurações para melhor organização
- **Migração**: Todas as funcionalidades foram movidas para `configuracoes.component`

---

### 🚨 Bugs Conhecidos

#### 1. **Bug na Criação de Bolsa** ⚠️
- **Status**: 🔴 **EM INVESTIGAÇÃO**
- **Descrição**: Erro ao tentar criar uma nova bolsa através do formulário de configurações
- **Localização**: `src/app/features/secretaria/configuracoes/configuracoes.component.ts`
- **Método Afetado**: `cadastrarTipoBolsa()`
- **Possíveis Causas**:
  - Incompatibilidade com endpoint do backend (`/bolsas/tipos`)
  - Formato de payload incorreto
  - Validação no backend rejeitando requisição
  - Problema de CORS ou autenticação
- **Endpoint**: `POST ${apiBaseUrl}/bolsas/tipos`
- **Payload Esperado**: `{ nome: string }`
- **Ação Necessária**: 
  - Verificar se o endpoint do backend está correto
  - Validar formato de resposta do backend
  - Verificar logs de erro no console do navegador
  - Testar requisição diretamente via Postman/Insomnia
- **Workaround Temporário**: Usar interface de administração do backend diretamente

---

### 🛠️ Ferramentas e Configuração

#### Testes
- ✅ Configurado Karma como test runner
- ✅ Configurado Jasmine como framework de testes
- ✅ Configurado ChromeHeadless para execução em CI/CD
- ✅ **Nota**: Definir `CHROME_BIN` no ambiente CI/CD para execução automática
- ✅ Cobertura de testes para todos os serviços HTTP
- ✅ Mocks e stubs configurados para testes isolados

#### Ambiente de Desenvolvimento
- ✅ Proxy configurado para desenvolvimento local
- ✅ URLs resolvidas automaticamente baseadas no ambiente
- ✅ Suporte a diferentes portas de desenvolvimento

---

### 📊 Estatísticas de Alterações

#### Arquivos de Teste Criados/Modificados (31 arquivos)
- `src/app/app.component.spec.ts` - Modificado
- `src/app/components/home/home.component.spec.ts` - Modificado
- `src/app/components/footer/footer.component.spec.ts` - Criado
- `src/app/debug/health.component.spec.ts` - Criado
- `src/app/shared/login/login.component.spec.ts` - Criado
- `src/app/shared/cadastro/cadastro.component.spec.ts` - Criado
- `src/app/shared/reset-password/reset-password.component.spec.ts` - Criado
- `src/app/shared/sidenav/sidenav-secretaria.component.spec.ts` - Modificado
- `src/app/services/auth.service.spec.ts` - Criado
- `src/app/services/login.service.spec.ts` - Criado
- `src/app/services/cadastro.service.spec.ts` - Criado
- `src/app/services/projeto.service.spec.ts` - Criado
- `src/app/services/inscricoes.service.spec.ts` - Criado
- `src/app/services/relatorio.service.spec.ts` - Criado
- `src/app/services/notificacao.service.spec.ts` - Criado
- `src/app/services/config.service.spec.ts` - Modificado
- `src/app/services/bolsa.service.spec.ts` - Criado
- `src/app/features/secretaria/configuracoes/configuracoes.component.spec.ts` - Modificado
- `src/app/features/secretaria/cadastros/cadastros.component.spec.ts` - Modificado
- `src/app/features/secretaria/listagem-alunos/listagem-alunos.component.spec.ts` - Modificado
- `src/app/features/secretaria/listagem-avaliadores/listagem-avaliadores.component.spec.ts` - Modificado
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.spec.ts` - Criado
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.spec.ts` - Criado
- `src/app/features/secretaria/formulario-avaliador/formulario-avaliador.component.spec.ts` - Criado
- `src/app/features/secretaria/relatorios/relatorios.component.spec.ts` - Criado
- `src/app/features/secretaria/notificacoes/notificacoes.component.spec.ts` - Criado
- `src/app/features/secretaria/envio-de-email/envio-de-email.component.spec.ts` - Criado
- `src/app/features/secretaria/dashboard/dashboard.component.spec.ts` - Criado
- `src/app/features/secretaria/listagem-avaliadores/enviar-avaliacoes.modal.spec.ts` - Criado
- `src/app/features/orientador/relatorio-form/relatorio-form.component.spec.ts` - Criado
- `src/app/features/avaliador-externo/formulario-avaliacao/formulario-avaliacao.component.spec.ts` - Criado

#### Arquivos de Código Modificados
- `src/app/services/password.service.ts` - **NOVO** (25 linhas)
- `src/app/services/config.service.ts` - Modificado (adição de métodos de bolsa)
- `src/app/services/bolsa.service.ts` - Modificado
- `src/app/services/notificacao.service.ts` - Modificado
- `src/app/features/secretaria/configuracoes/configuracoes.component.ts` - Modificado (integração de bolsas)
- `src/app/features/secretaria/configuracoes/configuracoes.component.html` - Modificado
- `src/app/features/secretaria/configuracoes/configuracoes.component.css` - Modificado
- `src/app/shared/reset-password/reset-password.component.ts` - Modificado
- `src/app/shared/sidenav/sidenav-secretaria.component.html` - Modificado
- `src/app/shared/sidenav/sidenav-secretaria.component.ts` - Modificado
- `src/environments/environment.ts` - Modificado (correção de URLs)

#### Arquivos Removidos
- `src/app/features/secretaria/atribuir-bolsas/atribuir-bolsas.component.ts` - Removido
- `src/app/features/secretaria/atribuir-bolsas/atribuir-bolsas.component.html` - Removido
- `src/app/features/secretaria/atribuir-bolsas/atribuir-bolsas.component.css` - Removido
- `src/app/features/secretaria/atribuir-bolsas/atribuir-bolsas.component.spec.ts` - Removido

---

### 🎯 Próximos Passos

#### Prioridade Alta
1. 🔴 **Corrigir bug na criação de bolsa**
   - Investigar endpoint do backend
   - Validar formato de requisição
   - Testar integração completa
   - Adicionar tratamento de erros mais robusto

#### Prioridade Média
2. Adicionar testes de integração end-to-end
3. Melhorar cobertura de testes para componentes complexos
4. Documentar APIs de serviços
5. Adicionar validação de formulários mais robusta

#### Prioridade Baixa
6. Otimizar performance de testes
7. Adicionar testes de acessibilidade
8. Implementar testes visuais (screenshot testing)

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 08 de Novembro de 2025  
**Branch:** `codex/create-frontend-quality-tests-and-changelog`

## [Data: 08/11/2025]

### 🎯 Resumo Geral
- **24 arquivos modificados**
- **1.090 inserções**, **696 deleções**
- Correções de fluxos da secretaria, melhorias de UX e refatorações importantes

---

## ✨ Implementações

### 🔧 Componentes e Funcionalidades

#### 1. **Componente de Debug (Health Check)**
- ✅ Adicionado novo componente `health.component.ts` para verificação de roteamento
- Localização: `src/app/debug/health.component.ts`
- Funcionalidade: Verifica se o sistema de rotas está funcionando corretamente

#### 2. **Melhorias no Formulário de Projeto**
- ✅ Implementado sistema de upload de documentos (DOCX e PDF) com ViewChild
- ✅ Adicionado controle de histórico de documentos por etapa (IDEIA, PARCIAL, FINAL)
- ✅ Implementada validação de código de projeto (`cod_projeto`)
- ✅ Adicionado suporte para Base64 de documento inicial (`ideia_inicial_b64`)
- ✅ Melhorado controle de estado de documentos com status de envio
- ✅ Implementada lógica de validação para avanço de etapas

#### 3. **Melhorias no Componente de Relatórios**
- ✅ Implementada função `properCase` para formatação correta de nomes próprios
- ✅ Adicionado tratamento de palavras minúsculas em nomes (de, da, do, das, dos, e, di)
- ✅ Melhorada exibição de nomes de orientadores nos relatórios mensais
- ✅ Aprimorada formatação de dados recebidos e pendentes

#### 4. **Melhorias no Formulário de Relatório**
- ✅ Refatorado parser de observações para melhor legibilidade
- ✅ Melhorada formatação de regex para extração de dados
- ✅ Adicionado HostListener para melhor interação
- ✅ Aprimorada hidratação do formulário com valores padrão

#### 5. **Melhorias no Componente de Cadastros**
- ✅ Implementada normalização de texto com remoção de acentos para busca
- ✅ Melhorada função de busca com suporte a caracteres especiais
- ✅ Adicionado suporte para campo `nome_completo` além de `nome`
- ✅ Aprimorada correspondência de termos de busca

---

## 🐛 Correções

### 1. **Rotas e Navegação**
- ✅ Corrigido redirecionamento no `LandingRedirectGuard`
- ✅ Ajustadas rotas para diferentes perfis (SECRETARIA, ORIENTADOR, ALUNO)
- ✅ Corrigida estrutura de rotas no `app.routes.ts`

### 2. **Serviços**

#### ProjetoService
- ✅ Refatorado método `cadastrarProjetoCompleto` para suportar Base64
- ✅ Adicionada função `stripDataUrl` para processamento de Base64
- ✅ Implementada geração automática de código de projeto
- ✅ Melhorado tratamento de erros e validações
- ✅ Corrigida normalização de projetos e projetos detalhados
- ✅ Ajustado método `listarInscricoesPorProjeto` para melhor compatibilidade

#### InscricoesService
- ✅ Removido método `excluirEmLote` (não utilizado)
- ✅ Limpeza de código obsoleto

### 3. **Interfaces**
- ✅ Atualizada interface `ProjetoRequest` para incluir:
  - `cod_projeto?: string`
  - `ideia_inicial_b64?: string` (obrigatório no POST)
- ✅ Melhorada tipagem de projetos

### 4. **Componentes**

#### AppComponent
- ✅ Ajustada lógica de exibição do footer
- ✅ Melhorado controle de rotas para exibição condicional

#### Sidenav Secretaria
- ✅ Ajustes de CSS para melhor layout
- ✅ Melhorias visuais na navegação

---

## 🗑️ Remoções

### 1. **Componente Navbar**
- ❌ Removido componente `navbar` completamente:
  - `navbar.component.ts`
  - `navbar.component.html`
  - `navbar.component.css`
- **Motivo**: Componente não utilizado, substituído por sidenav

---

## 🎨 Melhorias de UI/UX

### 1. **Estilos e Layout**
- ✅ Melhorias no CSS do componente de relatórios
- ✅ Ajustes visuais no formulário de relatório
- ✅ Melhorias no layout de cadastros
- ✅ Ajustes na sidenav da secretaria

### 2. **Formulários**
- ✅ Melhorada experiência de upload de arquivos
- ✅ Adicionados indicadores visuais de status de documentos
- ✅ Melhorada validação de formulários

---

## 🔄 Refatorações

### 1. **Código**
- ✅ Refatoração de métodos de normalização de texto
- ✅ Melhoria na organização de tipos e interfaces
- ✅ Limpeza de código não utilizado
- ✅ Melhorada legibilidade de código complexo

### 2. **Estrutura**
- ✅ Reorganização de imports
- ✅ Melhoria na organização de componentes
- ✅ Ajustes na estrutura de pastas

---

## 📊 Estatísticas de Alterações

### Arquivos Modificados
- `src/app/app.component.html` - 7 linhas alteradas
- `src/app/app.component.ts` - 19 linhas alteradas
- `src/app/app.routes.ts` - 59 linhas alteradas
- `src/app/core/guards/landing-redirect.guard.ts` - 11 linhas alteradas
- `src/app/features/orientador/relatorio-form/relatorio-form.component.css` - 87 linhas alteradas
- `src/app/features/orientador/relatorio-form/relatorio-form.component.html` - 44 linhas alteradas
- `src/app/features/orientador/relatorio-form/relatorio-form.component.ts` - 61 linhas alteradas
- `src/app/features/secretaria/cadastros/cadastros.component.css` - 51 linhas alteradas
- `src/app/features/secretaria/cadastros/cadastros.component.html` - 48 linhas alteradas
- `src/app/features/secretaria/cadastros/cadastros.component.ts` - 14 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.html` - 133 linhas alteradas
- `src/app/features/secretaria/formulario-projeto/formulario-projeto.component.ts` - 426 linhas alteradas
- `src/app/features/secretaria/listagem-projetos/listagem-projetos.component.ts` - 25 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.css` - 198 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.html` - 165 linhas alteradas
- `src/app/features/secretaria/relatorios/relatorios.component.ts` - 40 linhas alteradas
- `src/app/services/inscricoes.service.ts` - 7 linhas removidas
- `src/app/services/projeto.service.ts` - 140 linhas alteradas
- `src/app/shared/interfaces/projeto.ts` - 3 linhas alteradas
- `src/app/shared/sidenav/sidenav-secretaria.component.css` - 26 linhas alteradas

### Arquivos Removidos
- `src/app/components/navbar/navbar.component.css` - 167 linhas
- `src/app/components/navbar/navbar.component.html` - 29 linhas
- `src/app/components/navbar/navbar.component.ts` - 18 linhas

### Arquivos Criados
- `src/app/debug/health.component.ts` - 8 linhas

---

## 🚀 Melhorias de Performance

- ✅ Otimização de queries e requisições
- ✅ Melhoria na normalização de dados
- ✅ Redução de código não utilizado

---

## 🔒 Melhorias de Segurança

- ✅ Validação aprimorada de dados de entrada
- ✅ Melhor tratamento de erros

---

## 📝 Notas Técnicas

### Tipos e Interfaces
- Adicionado tipo `EtapaDocumento` ('IDEIA' | 'PARCIAL' | 'FINAL')
- Adicionado tipo `StatusEnvio` ('ENVIADO' | 'NAO_ENVIADO')
- Adicionada interface `DocumentoHistorico`
- Estendida interface `ProjetoCadastroExt` com novos campos

### Dependências
- Nenhuma nova dependência adicionada
- Nenhuma dependência removida

---

## ✅ Testes e Validações

- ✅ Testado fluxo de cadastro de projetos
- ✅ Testado upload de documentos
- ✅ Testado geração de relatórios
- ✅ Testado busca e filtros de cadastros
- ✅ Testado redirecionamento de rotas

---

## 🎯 Próximos Passos Sugeridos

1. Testes automatizados para novos componentes
2. Documentação de APIs atualizadas
3. Validação de integração com backend
4. Testes de carga para upload de arquivos

---

**Desenvolvedor:** Felipe Souza Moreira  
**Data:** 08 de Novembro de 2025  
**Branch:** `codex/perform-thorough-project-scan-and-diagnosis`

