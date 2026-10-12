# Klip. — Production-Ready Fullstack URL Shortener

A production-ready, honest URL shortener application built with **React**, **Express**, and **PostgreSQL**. Features clean editorial typography, scannable QR code generation with vector exports, custom slug reservation, honest retention policies, and robust security middleware.

---

## Tech Stack & Architecture

- **Frontend (`/client`)**: React 18, TailwindCSS, QRCode, React Icons, React Spinners.
- **Backend (`/server`)**: Node.js, Express, PostgreSQL (`pg` + `@electric-sql/pglite` embedded fallback), Helmet, Express Rate Limit, NanoID.
- **Database**: PostgreSQL (compatible with Neon, Supabase, Railway, Render, or local PostgreSQL).
- **Tooling**: Concurrently, npm scripts, PowerShell & Windows Batch launchers.

---

## 1. Local Setup

### Prerequisites
- Node.js (version 18 or higher): `node -v`
- npm (version 9 or higher): `npm -v`
- *(Optional)* Local PostgreSQL server or a remote connection string from [Neon](https://neon.tech) / [Supabase](https://supabase.com). If none is configured, the server automatically starts an embedded persistent PostgreSQL engine in user space.

### Installation

Clone the repository and install all dependencies for root, client, and server:

```bash
git clone https://github.com/shru06-pro/klipIT.git
cd klipIT
npm run install:all
```

### Running Locally

```bash
# Run both client and server concurrently:
npm run dev

# Or using the Windows launch scripts:
.\run.ps1
# or
run.bat
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 2. Environment Variables

Templates are provided in `.env.example`, `server/.env.example`, and `client/.env.example`.

### Server Environment (`server/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `PORT` | Port the Express server listens on | `5000` |
| `BASE_URL` | Public base URL used to construct short links (`${BASE_URL}/${code}`) | `http://localhost:3000` (or `https://yourdomain.com`) |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/dbname` |
| `CLIENT_ORIGIN` | Allowed origin for CORS (matches frontend URL) | `http://localhost:3000` |

*The server validates `BASE_URL`, `DATABASE_URL`, and `PORT` on startup and fails fast if any are missing.*

### Client Environment (`client/.env`)
| Variable | Description | Example |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | Base URL of the backend API (CRA bundler) | `http://localhost:5000` |
| `VITE_API_URL` | Base URL of the backend API (Vite alternative) | `http://localhost:5000` |

---

## 3. Database Schema & Migration

The PostgreSQL database schema is defined in [`server/schema.sql`](file:///d:/projects/url%20shortner/server/schema.sql). The server automatically applies it on startup, or you can run it manually in your PostgreSQL console:

```sql
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(50) NOT NULL UNIQUE,
    original_url TEXT NOT NULL,
    clicks INTEGER NOT NULL DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
```

---

## 4. Production Deployment Guide

### A. Deploy the Database (Neon or Supabase)

1. **Neon**:
   - Create a free project on [Neon](https://neon.tech).
   - In the Dashboard, copy the **Connection string** (e.g. `postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`).
2. **Supabase**:
   - Create a new project on [Supabase](https://supabase.com).
   - Go to **Project Settings > Database** and copy the **URI** connection string.

### B. Deploy the Backend (Render or Railway)

1. **Render**:
   - Create a new **Web Service** pointing to your repository.
   - Set **Root Directory** to `server`.
   - Set **Build Command** to `npm install`.
   - Set **Start Command** to `npm start`.
   - Add Environment Variables:
     - `PORT`: `5000` (or Render's default `$PORT`)
     - `BASE_URL`: Your public domain (e.g. `https://your-frontend.vercel.app` or custom domain)
     - `DATABASE_URL`: Your Neon / Supabase connection string
     - `CLIENT_ORIGIN`: Your frontend URL (e.g. `https://your-frontend.vercel.app`)

2. **Railway**:
   - Deploy from GitHub repo and set root directory to `/server`.
   - Add the environment variables (`BASE_URL`, `DATABASE_URL`, `PORT`, `CLIENT_ORIGIN`).

### C. Deploy the Frontend (Vercel or Netlify)

1. **Vercel**:
   - Import your repository in [Vercel](https://vercel.com).
   - Set **Root Directory** to `client`.
   - Framework preset: `Create React App`.
   - Add Environment Variable:
     - `REACT_APP_API_URL`: Your deployed backend URL (e.g. `https://your-backend.onrender.com`).
2. **Netlify**:
   - Import repo, set base directory to `client`, build command to `npm run build`, and publish directory to `build`.
   - Set `REACT_APP_API_URL` in **Site Configuration > Environment Variables**.

---

## 5. Security & Validation

- **Helmet**: Secures HTTP headers against common web vulnerabilities.
- **Rate Limiting**: Restricts `/api/shorten` to 60 creations per 15 minutes per IP via `express-rate-limit`.
- **URL Sanitization**: Rejects non-HTTP/HTTPS protocols, URLs exceeding 2048 characters, and links pointing to the shortener's own domain.
- **Custom Slugs**: Strictly validated for length (3–50 chars), regex `^[a-zA-Z0-9_-]+$`, uniqueness, and reserved words (`api`, `health`, `admin`, etc.).
- **Honest Expiry**: Auto-30d links store an `expires_at` timestamp in PostgreSQL. Expired links return HTTP 410.

---

## 6. License

ISC License
