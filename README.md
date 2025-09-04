
# 📘 `README.md` 

# 🏦 Case Técnico - Clientes & Saldos

Este repositório contém duas aplicações:  
- **/back** → API (NestJS + Prisma)  
- **/front** → Frontend (Angular 18)  

O objetivo é demonstrar boas práticas de **arquitetura, segurança e escalabilidade em cloud (AWS)**.

---

## 🚀 Subindo o projeto localmente

### Pré-requisitos
- Node.js 22+
- Docker (opcional, para Postgres)
- Angular CLI

### Passos
```bash
# 1. Clone do projeto
git clone <repo_url>
cd case_itau_nodejs

# 2. Backend
cd back
cp .env.example .env
npm install
npx prisma migrate dev
npm run start:dev

# 3. Frontend
cd ../front
npm install
npm start
````

* Backend: [http://localhost:3000](http://localhost:3000)
* Frontend: [http://localhost:4200](http://localhost:4200)

---



* **Frontend**: hospedado em **S3 + CloudFront** (CDN global).
* **Backend**: container em **ECS Fargate** ou **EKS** (Kubernetes gerenciado).
* **Banco**: **RDS Postgres** (Multi-AZ + Read Replicas).
* **Cache**: **ElastiCache Redis** (cache + idempotência).
* **Mensageria**: **SQS/SNS** para eventos.
* **Segurança**: WAF + Security Groups + Secrets Manager.
* **Observabilidade**: CloudWatch + X-Ray + Grafana.

---

## 📖 Documentação específica

* [Backend (NestJS)](./back/README.md)
* [Frontend (Angular)](./front/README.md)
* [Diagramas de explicação] (./explain)
* Documentação da API [http://localhost:3000/api/v1/docs](http://localhost:3000/api/v1/docs)
