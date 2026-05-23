# DevPulse - Internal Tech Issue & Feature Tracker

DevPulse is a high-performance, lightweight backend API designed to track internal technical issues and feature requests. Built with Express, TypeScript, and PostgreSQL, the application is optimized for Serverless execution on Vercel, utilizing modern practices like in-memory data joining to minimize database load.

**Live URL**: [https://devpulse-chi-ten.vercel.app](https://devpulse-chi-ten.vercel.app)

---

## 🚀 Features

- **Authentication & Authorization**: Role-based access control (`contributor` and `maintainer`) backed by secure JWT validation and bcrypt password hashing.
- **Dynamic Query Filtering & Sorting**: Publicly fetch issues with active filters for `type` (`bug`, `feature_request`) and `status` (`open`, `in_progress`, `resolved`), sorted dynamically by `newest` or `oldest`.
- **Application-Level Joins (No Database JOINs)**: High-performance resolver patterns that fetch issue reports and dynamically compile reporter profiles from the `users` table using batch query lookups (`WHERE id IN (...)`), avoiding lockups on complex database table joins.
- **Serverless-Native Optimization**: Compiled and bundled using `tsup` into a clean, single-entrypoint deployment to perfectly match Vercel Serverless Function requirements and completely avoid ES Modules extension path errors.

---

## 🛠️ Tech Stack

- **Runtime Environment**: Node.js (ES Modules, `"type": "module"`)
- **Framework**: Express.js
- **Language**: TypeScript
- **Bundler & Compiler**: `tsup` (esbuild)
- **Database**: PostgreSQL (using `pg` Connection Pool)
- **Security & Hashing**: JSON Web Tokens (JWT) & `bcrypt`
- **Package Manager**: `pnpm`
- **Deployment Platform**: Vercel Serverless Functions

---

## 📋 Database Schema Summary

The database tables are automatically initialized on server startup via the `initDB()` module:

### 1. `users`
Tracks contributors and maintainers inside the organization.
```sql
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'contributor' CHECK (role IN ('contributor', 'maintainer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `issues`
Tracks bug reports and feature requests.
```sql
CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature_request')),
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved')),
  reporter_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔌 API Endpoint List

### Authentication Module (`/api/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Public | Register a new user (default role: `contributor`). |
| **POST** | `/api/auth/login` | Public | Authenticates credentials and returns a JWT Bearer Token. |

### Issues Module (`/api/issues`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/issues` | Private | Creates a new issue. Requires standard Bearer Token. Accessible by `contributor` and `maintainer`. |
| **GET** | `/api/issues` | Public | Retrieves all issues. Supports query params: `sort=newest/oldest`, `type=bug/feature_request`, `status=open/in_progress/resolved`. |
| **GET** | `/api/issues/:id` | Public | Retrieves full details of a specific issue by its ID. |

---

## ⚙️ Setup & Installation

Follow these steps to run the project locally:

### 1. Clone & Install Dependencies
Ensure you have `pnpm` installed.
```bash
# Install all required packages
pnpm install
```

### 2. Environment Configuration
Create a `.env` file at the root of the project:
```env
PORT=5000
CONNECTIONSTRING=postgresql://your_db_user:your_db_password@your_db_host:5432/your_db_name?sslmode=require
JWT_SECRET=your_jwt_super_secret_key
```

### 3. Running Locally (Development Mode)
Starts the local development server with hot-reloading:
```bash
pnpm dev
```

### 4. Build and Run Production Bundle
Compiles and bundles the application using `tsup` and starts the compiled JavaScript bundle:
```bash
# Build the single ESM file bundle in dist/
pnpm build

# Start the compiled bundle
pnpm start
```
