
# 📘 `front/README.md`

# 💻 Frontend - Gestão de Clientes (Angular)

Frontend em **Angular 18** que consome a API de Clientes & Saldos.  
Permite criar clientes, listar, depositar e sacar valores.

---

## 🚀 Tecnologias
- Angular 18 + TypeScript
- Angular Material
- RxJS
- HttpClient (integração com API)

---

## ⚙️ Rodando localmente
```bash
cd front
npm install
npm start
````

* Front: [http://localhost:4200](http://localhost:4200)

---

## 🔒 Integração & Segurança

* Autenticação JWT → token armazenado e enviado no header Authorization.
* Interceptors HTTP → adicionam token e tratam erros globais.
* Validação reativa nos formulários.

---

## 📌 Funcionalidades

* **Login** (gera JWT via API)
* **Cadastro de clientes**
* **Listagem de clientes**
* **Depósitos e saques** com confirmação visual
* **Feedback ao usuário** (Snackbar/Dialog)

---

## 🌐 Deploy (AWS)

* **Frontend**: hospedado em **S3 + CloudFront**
* **Integração**: via **ALB** que redireciona requisições ao backend
* **Segurança extra**: WAF + TLS

---

```

# 📘 `front/README.md`

```markdown
# 💻 Frontend - Gestão de Clientes (Angular)

Frontend em **Angular 18** que consome a API de Clientes & Saldos.  
Permite criar clientes, listar, depositar e sacar valores.

---

## 🚀 Tecnologias
- Angular 18 + TypeScript
- Angular Material
- RxJS
- HttpClient (integração com API)

---

## ⚙️ Rodando localmente
```bash
cd front
npm install
npm start
````

* Front: [http://localhost:4200](http://localhost:4200)

---

## 🔒 Integração & Segurança

* Autenticação JWT → token armazenado e enviado no header Authorization.
* Interceptors HTTP → adicionam token e tratam erros globais.
* Validação reativa nos formulários.

---

## 📌 Funcionalidades

* **Login** (gera JWT via API)
* **Cadastro de clientes**
* **Listagem de clientes**
* **Depósitos e saques** com confirmação visual
* **Feedback ao usuário** (Snackbar/Dialog)

---

## 🌐 Deploy (AWS)

* **Frontend**: hospedado em **S3 + CloudFront**
* **Integração**: via **ALB** que redireciona requisições ao backend
* **Segurança extra**: WAF + TLS
