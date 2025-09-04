
# 📘 `back/README.md`

# 🏦 API de Clientes & Saldos (NestJS)

API em **NestJS** para gerenciamento de clientes, saldos e transações.  
Foco em **segurança, consistência financeira e arquitetura limpa**.

---

## 🚀 Tecnologias
- NestJS + TypeScript
- Prisma ORM
- PostgreSQL / SQLite
- JWT (Auth)
- Helmet (segurança HTTP)
- Class-Validator (validação)

---

## ⚙️ Rodando localmente
```bash
cd back
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev
````

* API: [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Testes aplicados
```bash
npm run test:2e2
npm run test:watch
````

## 🔒 Segurança aplicada

* **JWT obrigatório** (exceto login e criação de usuário)
* **Helmet** (headers de proteção)
* **ValidationPipe** com whitelist + forbid extra props
* **Idempotency-Key** para evitar double-spend
* **Rate limit** (Throttler)

---

## 📌 Endpoints principais

* `POST /auth/token` → autenticação (gera JWT)
* `POST /clientes` → criar cliente
* `GET /clientes` → obter clientes
* `GET /clientes/:id` → obter cliente
* `PUTT /clientes/:id` → atualizar cliente
* `DELETE /clientes/:id` → desativar cliente
* `POST /clientes/:id/deposit` → depositar
* `POST /clientes/:id/withdraw` → sacar

---

# Endpoints

📖 **Documentação  (Swagger):**
[http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)

## 📈 Arquitetura de Produção (AWS)

* **API**: ECS Fargate/EKS
* **Banco**: RDS Postgres (Multi-AZ + Read Replicas)
* **Cache**: ElastiCache Redis
* **Mensageria**: SQS/SNS
* **Logs & Métricas**: CloudWatch + Grafana + X-Ray

