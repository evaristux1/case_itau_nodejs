# 🏦 Itaú Customer Management System

Sistema completo de gerenciamento de clientes com funcionalidades financeiras, desenvolvido com **NestJS** (backend) e **Angular** (frontend).

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Tecnologias](#tecnologias)
- [Instalação e Configuração](#instalação-e-configuração)
- [Backend (API)](#backend-api)
- [Frontend (Web App)](#frontend-web-app)
- [Funcionalidades](#funcionalidades)
- [API Endpoints](#api-endpoints)
- [Testes](#testes)
- [Deployment](#deployment)
- [Contribuição](#contribuição)

---

## 🎯 Visão Geral

O **Itaú Customer Management System** é uma aplicação full-stack que permite:

- **Gerenciamento completo de clientes** (CRUD)
- **Operações financeiras** (depósitos e saques)
- **Sistema de auditoria** completo
- **Dashboard analítico** com métricas em tempo real
- **Autenticação JWT** segura
- **Interface moderna** e responsiva

---

## 🏗️ Arquitetura

### Arquitetura Geral
```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐
│                 │ ◄────────────► │                 │
│  Angular SPA    │                │   NestJS API    │
│  (Frontend)     │                │   (Backend)     │
│                 │                │                 │
└─────────────────┘                └─────┬───────────┘
                                         │
                                         ▼
                                   ┌─────────────┐
                                   │   SQLite    │
                                   │ (Database)  │
                                   └─────────────┘
```

### Backend Architecture (Clean Architecture)
```
┌─────────────────────────────────────────────────────┐
│                   Presentation Layer                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Controllers │ │ Interceptors│ │   Guards    │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                Application Layer                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Use Cases   │ │     DTOs    │ │ Validators  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│                  Domain Layer                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  Entities   │ │Value Objects│ │   Ports     │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│               Infrastructure Layer                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  Prisma     │ │ Repositories│ │   Services  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Tecnologias

### Backend
- **Framework**: NestJS 10+
- **Runtime**: Node.js 18+
- **Database**: SQLite (Prisma ORM)
- **Authentication**: JWT
- **Validation**: Zod + class-validator
- **Testing**: Jest
- **Documentation**: Swagger/OpenAPI

### Frontend
- **Framework**: Angular 18+
- **UI Library**: Angular Material 18
- **State Management**: Angular Signals
- **HTTP Client**: Angular HttpClient
- **Styling**: SCSS + Material Design 3
- **Build Tool**: Angular CLI

### DevOps & Tools
- **Package Manager**: npm
- **Version Control**: Git
- **Database Migrations**: Prisma Migrate
- **API Testing**: Swagger UI
- **Code Quality**: ESLint, Prettier

---

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ e npm
- Git

### 1. Clone o repositório
```bash
git clone <repository-url>
cd itau-customer-management
```

### 2. Configuração do Backend
```bash
cd back
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações
```

**Exemplo do arquivo `.env`:**
```env
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1
API_VERSION=1.0.0

# Database
DATABASE_PROVIDER=sqlite
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# Encryption
ENCRYPTION_KEY=your-64-char-hex-encryption-key-or-32-byte-base64

# Security
BCRYPT_ROUNDS=12
CORS_ORIGINS=http://localhost:4200

# Features
FEATURE_SWAGGER_ENABLED=true
FEATURE_METRICS_ENABLED=true
FEATURE_HEALTH_CHECK_ENABLED=true
```

### 3. Configuração do banco de dados
```bash
# Executar migrações
npx prisma migrate dev

# (Opcional) Popular dados iniciais
npx prisma db seed
```

### 4. Iniciar o backend
```bash
npm run start:dev
# API estará disponível em http://localhost:3000
# Swagger UI em http://localhost:3000/api/v1/docs
```

### 5. Configuração do Frontend
```bash
cd ../front
npm install

# Iniciar desenvolvimento
npm start
# App estará disponível em http://localhost:4200
```

---

## 🔧 Backend (API)

### Estrutura de Diretórios
```
back/
├── src/
│   ├── app.module.ts
│   ├── main.ts
│   ├── config/                    # Configurações
│   │   ├── configs/
│   │   ├── env.schema.ts
│   │   └── configuration.module.ts
│   ├── modules/
│   │   ├── auth/                  # Autenticação
│   │   └── customers/             # Módulo de clientes
│   │       ├── application/       # Use Cases e DTOs
│   │       ├── domain/           # Entidades e Interfaces
│   │       ├── infra/            # Implementações
│   │       └── presentation/     # Controllers
│   ├── shared/                   # Utilitários compartilhados
│   │   ├── infrastructure/
│   │   ├── security/
│   │   └── validations/
│   └── guards/                   # Guards de autenticação
├── prisma/                       # Esquemas e migrações
└── test/                        # Testes
```

### Principais Características

#### 🏛️ Domain-Driven Design (DDD)
- **Entidades**: Representam objetos de negócio (`Customer`)
- **Value Objects**: Objetos imutáveis (`Money`)
- **Use Cases**: Lógica de negócio (`DepositUseCase`, `WithdrawUseCase`)
- **Repositories**: Abstração de persistência
- **Unit of Work**: Gerenciamento de transações

#### 🔒 Segurança
- **JWT Authentication**: Tokens seguros com expiração
- **Password Hashing**: bcrypt com salt configurável
- **Request Validation**: Validação rigorosa de entrada
- **Rate Limiting**: Proteção contra spam
- **CORS**: Configuração adequada para produção

#### 💰 Sistema Financeiro
- **Precisão**: Valores armazenados em centavos (evita problemas de ponto flutuante)
- **Idempotência**: Chaves de idempotência para operações críticas
- **Auditoria**: Log completo de todas as transações
- **Controle de Concorrência**: Versioning otimista para evitar race conditions

#### 📊 Monitoramento
- **Logging Estruturado**: Winston para logs em produção
- **Health Checks**: Endpoints para monitoramento
- **Error Tracking**: Integração com Sentry (opcional)
- **Métricas**: Coleta de métricas de performance

---

## 🖥️ Frontend (Web App)

### Estrutura de Diretórios
```
front/
├── src/
│   ├── app/
│   │   ├── core/                 # Serviços centrais
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── services/
│   │   ├── features/             # Módulos por funcionalidade
│   │   │   ├── auth/
│   │   │   ├── customers/
│   │   │   └── dashboard/
│   │   ├── shared/               # Componentes compartilhados
│   │   │   └── pipes/
│   │   └── app.component.*
│   ├── environments/
│   └── styles.scss
```

### Principais Características

#### 🎨 Design System
- **Material Design 3**: Interface moderna e consistente
- **Responsividade**: Adaptação completa a diferentes dispositivos
- **Tema Customizado**: Paleta de cores Itaú
- **Componentes Reutilizáveis**: Biblioteca de componentes próprios

#### ⚡ Performance
- **Standalone Components**: Reduz bundle size
- **Lazy Loading**: Carregamento sob demanda de módulos
- **OnPush Strategy**: Otimização de change detection
- **Angular Signals**: Estado reativo e performático

#### 🔐 Autenticação
- **JWT Integration**: Interceptors automáticos
- **Route Guards**: Proteção de rotas privadas
- **Session Management**: Controle de sessão no localStorage
- **Auto-redirect**: Redirecionamento inteligente após login

#### 📊 Dashboard
- **Métricas em Tempo Real**: Estatísticas atualizadas
- **Cards Interativos**: Interface intuitiva e moderna
- **Gráficos**: Visualização de dados (preparado para charts)
- **Ações Rápidas**: Acesso direto às funcionalidades principais

---

## ✨ Funcionalidades

### 👥 Gerenciamento de Clientes
- [x] **Criar cliente** com validação de CPF
- [x] **Listar clientes** com paginação e filtros
- [x] **Visualizar detalhes** do cliente
- [x] **Editar informações** do cliente
- [x] **Desativar cliente** (soft delete)

### 💳 Operações Financeiras
- [x] **Depositar dinheiro** com validação de valores
- [x] **Sacar dinheiro** com verificação de saldo
- [x] **Histórico de transações** completo
- [x] **Controle de concorrência** em operações
- [x] **Idempotência** para evitar duplicatas

### 📈 Dashboard e Relatórios
- [x] **Métricas gerais** (total de clientes, saldo total, etc.)
- [x] **Indicadores de performance** com trends
- [x] **Resumo financeiro** por cliente
- [ ] **Relatórios exportáveis** (planned)
- [ ] **Gráficos interativos** (planned)

### 🔧 Sistema
- [x] **Autenticação JWT** segura
- [x] **Validação robusta** de dados
- [x] **Error handling** centralizado
- [x] **Logging estruturado**
- [x] **Health checks** para monitoramento

---

## 📡 API Endpoints

### Autenticação
```http
POST /api/v1/auth/token
```

### Clientes
```http
GET    /api/v1/clientes          # Listar clientes
POST   /api/v1/clientes          # Criar cliente
GET    /api/v1/clientes/:id      # Obter cliente
PUT    /api/v1/clientes/:id      # Atualizar cliente
DELETE /api/v1/clientes/:id      # Desativar cliente
```

### Operações Financeiras
```http
POST /api/v1/clientes/:id/depositar   # Depositar
POST /api/v1/clientes/:id/sacar       # Sacar
```

### Documentação Completa
Acesse `http://localhost:3000/api/v1/docs` para ver a documentação interativa do Swagger.

---

## 🧪 Testes

### Backend
```bash
cd back

# Testes unitários
npm run test

# Testes com coverage
npm run test:cov

# Testes em watch mode
npm run test:watch
```

### Frontend
```bash
cd front

# Testes unitários
npm run test

# Testes end-to-end
npm run e2e
```

---

## 🚀 Deployment

### Backend
```bash
cd back

# Build para produção
npm run build

# Executar migrações em produção
npx prisma migrate deploy

# Iniciar aplicação
npm run start:prod
```

### Frontend
```bash
cd front

# Build para produção
npm run build

# Arquivos estarão em dist/
```

### Docker (Planejado)
```dockerfile
# Dockerfile exemplo para backend
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

---

## 📋 Roadmap

### Próximas Funcionalidades
- [ ] **Sistema de permissões** (roles/permissions)
- [ ] **Relatórios avançados** com exportação
- [ ] **Notificações em tempo real** (WebSocket)
- [ ] **Integração com APIs bancárias**
- [ ] **Multi-tenancy** para diferentes organizações
- [ ] **Auditoria avançada** com timeline
- [ ] **Dashboard customizável**
- [ ] **Exportação de dados** (CSV, PDF)

### Melhorias Técnicas
- [ ] **Rate limiting** mais granular
- [ ] **Caching** com Redis
- [ ] **Background jobs** com Bull
- [ ] **Containerização** completa
- [ ] **CI/CD** pipeline
- [ ] **Monitoring** avançado
- [ ] **Load balancing**
- [ ] **Database replication**

---

## 🤝 Contribuição

1. **Fork** o projeto
2. Crie uma **branch** para sua feature (`git checkout -b feature/amazing-feature`)
3. **Commit** suas mudanças (`git commit -m 'Add some amazing feature'`)
4. **Push** para a branch (`git push origin feature/amazing-feature`)
5. Abra um **Pull Request**

### Padrões de Código
- Use **ESLint** e **Prettier** para formatação
- Siga os padrões de **commit conventional**
- Mantenha **cobertura de testes** acima de 80%
- **Documente** APIs e componentes importantes

---

## 👨‍💻 Autor

**Gabriel**
- Email: gabrielevaristovcp@gmail.com

---

*Desenvolvido com ❤️ para gerenciamento eficiente de clientes*