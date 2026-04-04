<div align="center">
  <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest" />
  <img src="https://img.shields.io/badge/Security-Strict-blue?style=for-the-badge" alt="Security Validated" />
</div>

<h1 align="center">⚙️ Doomsday System API (Gestión del Fin)</h1>

<p align="center">
  <strong>The core backend engine powering the Doomsday System.</strong>
  <br />
  A robust, enterprise-grade RESTful API built with NestJS to manage critical resources, personnel, and communications between outposts.
</p>

---

## 📖 Overview

The **Doomsday System API** is the foundational backend infrastructure for the *Gestión del fin* ecosystem. It handles all business logic, data persistence, and inter-camp communication strategies safely and reliably.

Built upon the powerful **NestJS** framework, this backend leverages decorators, dependency injection, and heavy TypeScript typing to ensure a scalable and strictly validated data flow. It adheres to top-tier security standards, strictly separating testing credentials and environments.

## ✨ Key Features

- **🔐 Enterprise Security:** Secure JWT-based authentication with properly managed environment configurations (no hardcoded credentials).
- **🏕️ Camp Resource Orchestration:** Endpoints dedicated to tracking, allocating, and updating physical and human resources across multiple camp instances.
- **📡 Inter-Camp Communications:** Facilitates data exchange and state updates between distinct geographical nodes.
- **🚦 API Standardization:** All endpoints are standardized under the `/api` global prefix, utilizing clean RESTful architecture.
- **🛡️ Strict Validation:** Complete Request/Response schema validation using Data Transfer Objects (DTOs) and `class-validator`.
- **🧪 Comprehensive Testing:** Fully configured with Jest for Unit Testing and heavily integrated End-to-End (E2E) test coverage.

## 🛠️ Technology Stack

- **Framework:** [NestJS](https://nestjs.com/) (Node.js)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Testing:** [Jest](https://jestjs.io/) & Supertest (E2E)
- **Validation:** class-validator & class-transformer
- **Environment Management:** dotenv

## 🚀 Getting Started

Follow these steps to set up the backend server on your local environment.

### Prerequisites
- Node.js (v18+ recommended)
- A running database instance (e.g., PostgreSQL/MySQL, depending on configuration).

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/doomsday-system-api.git
   cd doomsday-system-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` (for dev) and `.env.test` (for e2e testing) in the root directory:
   ```env
   # .env
   PORT=3000
   DATABASE_URL=your_database_connection_string
   JWT_SECRET=your_super_secret_key
   ```

4. **Start the Development Server:**
   ```bash
   npm run start:dev
   ```
   *The server will start listening on `http://localhost:3000/api`.*

### Testing Commands

This project maintains high reliability through automated testing:
- **Unit Tests:** `npm run test`
- **E2E Tests:** `npm run test:e2e`
- **Test Coverage:** `npm run test:cov`

## 📂 Architecture Overview

Built using the highly modular NestJS structure:
```text
src/
 ├── auth/        # Authentication logic, guards, and JWT strategies
 ├── camps/       # Camp management, human resources, and inventory controllers
 ├── communications/ # Inter-camp messaging and logs
 ├── common/      # Global filters, interceptors, and custom decorators
 ├── main.ts      # Application bootstrap and global config
 └── app.module.ts# Root module
```

## 🤝 Contributing
Contributions, issues, and feature requests are welcome. Feel free to check the [issues page](https://github.com/your-username/doomsday-system-api/issues) if you want to contribute.

## 📄 License
This project is licensed under the MIT License.
