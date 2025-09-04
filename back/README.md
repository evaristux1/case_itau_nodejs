
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
* `GET /clientes/:id` → obter cliente
* `PUT /clientes/:id/deposit` → depositar
* `PUT /clientes/:id/withdraw` → sacar

---

## 📈 Arquitetura de Produção (AWS)

* **API**: ECS Fargate/EKS
* **Banco**: RDS Postgres (Multi-AZ + Read Replicas)
* **Cache**: ElastiCache Redis
* **Mensageria**: SQS/SNS
* **Logs & Métricas**: CloudWatch + Grafana + X-Ray

