# Klip. — Enterprise Fullstack URL Shortener & QR Studio

Klip is a production-ready, neo-minimalist URL shortener built with **React**, **Express**, and **PostgreSQL**. Designed with an enterprise-grade layered architecture (Controller-Service-Repository), clean editorial typography, dynamic vector/raster QR code generation, custom slug management, rate limiting, and robust security middleware.

---

## 1. Enterprise Architecture & Directory Structure

The project is structured with strict separation of concerns, isolating data access, domain business rules, HTTP transport, and UI presentations.

```
klipIT/
├── package.json                           # Monorepo workspace orchestrator
├── vercel.json                            # Vercel cloud deployment & SPA routing config
├── render.yaml                            # Render backend blueprint service definition
├── .gitignore                             # Git version control ignore rules
├── .env.example                           # Global environment template reference
│
├── backend/
│   ├── server.js                          # Process lifecycle manager (bootstrap & graceful shutdown)
│   ├── schema.sql                         # Root schema reference
│   ├── package.json                       # Backend dependencies & scripts
│   └── src/
│       ├── app.js                         # Decoupled Express app (middleware, routes, error handlers)
│       ├── config/
│       │   ├── env.config.js              # Validated environment configuration with production defaults
│       │   └── constants.js               # System constants, constraints, and rate limits
│       ├── database/
│       │   ├── connection.js              # PostgreSQL pool & persistent PGlite fallback driver
│       │   └── schema.sql                 # DDL migration statements (CREATE TABLE urls...)
│       ├── repositories/
│       │   └── url.repository.js          # Direct DB persistence queries (Repository Pattern)
│       ├── services/
│       │   └── url.service.js             # Core domain business logic (Service Pattern)
│       ├── controllers/
│       │   ├── url.controller.js          # HTTP request/response handler for URL operations
│       │   └── health.controller.js       # Health and telemetry probes
│       ├── validators/
│       │   └── url.validator.js           # RFC 3986 URL and custom slug validation
│       ├── middlewares/
│       │   ├── cors.middleware.js         # Dynamic multi-origin CORS middleware
│       │   ├── rateLimiter.middleware.js  # Request throttling (60 req / 15 min per IP)
│       │   └── error.middleware.js        # Centralized HTTP error & CORS handler
│       └── routes/
│           ├── api/
│           │   ├── health.routes.js       # /health probe
│           │   └── url.routes.js          # /api/shorten, /api/urls, /api/urls/:code
│           └── index.js                   # Root router aggregating sub-routers & 302 redirects
│
└── frontend/
    ├── package.json                       # Frontend dependencies & build scripts
    ├── tailwind.config.js                 # Tailwind CSS theme, custom tokens, and breakpoints
    ├── public/
    │   ├── index.html                     # HTML root template & Google Fonts preconnects
    │   ├── favicon.ico                    # Browser tab favicon
    │   ├── favicon-16x16.png              # 16px favicon
    │   ├── favicon-32x32.png              # 32px favicon
    │   └── apple-touch-icon.png           # iOS home screen touch icon
    └── src/
        ├── index.js                       # React 18 Concurrent DOM mount entry point
        ├── index.css                      # Global styles, typography tokens, keyframes
        ├── App.js                         # Root application shell & client redirect interceptor
        ├── reportWebVitals.js             # Web Vitals performance reporting
        ├── assets/
        │   └── images/
        │       └── logo-icon.png          # Monogram paperclip-K icon
        ├── config/
        │   ├── api.config.js              # Backend API URL resolution (CRA & Vite support)
        │   └── navigation.config.js       # Anchor mappings & navbar items
        ├── services/
        │   ├── api.service.js             # Encapsulated HTTP client (shorten, delete, stats)
        │   ├── qr.service.js              # QR matrix generation & vector/raster export
        │   └── storage.service.js         # LocalStorage persistence service
        ├── hooks/
        │   ├── useLinks.js                # Domain hook: link history, persistence & click sync
        │   ├── useClipboard.js            # Custom hook: clipboard copying with timeout feedback
        │   └── useScrollSpy.js            # Custom hook: scroll tracking & active section spy
        └── components/
            ├── layout/
            │   ├── Header.jsx             # Top brand header & sliding indicator
            │   ├── Footer.jsx             # Site footer & copyright
            │   └── Main.jsx               # Section coordinator
            ├── common/
            │   └── QrModal.jsx            # Reusable QR inspector & download modal
            └── features/
                ├── hero/Hero.jsx          # Fluid typography headline
                ├── shortener/Shortener.jsx# Pill input capsule
                ├── result/ActiveResultCard.jsx # Active link card & live QR preview
                ├── bento/BentoFeatures.jsx# 3-column feature grid
                └── ledger/UrlList.jsx     # Recent links ledger & sparklines
```

---

## 2. Tech Stack

- **Frontend**: React 18, Tailwind CSS, QRCode, React Spinners, Google Fonts (*Instrument Serif*, *DM Sans*, *DM Mono*).
- **Backend**: Node.js, Express, PostgreSQL (`pg` connection pool with automatic `@electric-sql/pglite` embedded fallback), Helmet, Express Rate Limit, NanoID.
- **Database**: PostgreSQL (compatible with Neon, Supabase, Railway, Render, or local PostgreSQL).
- **Architecture**: Controller-Service-Repository Pattern, Decoupled Server Lifecycle, Domain-Driven Frontend Features.

---

## 3. Local Setup & Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- *(Optional)* A local or hosted PostgreSQL database (Neon, Supabase, Railway). If omitted, the server automatically starts an embedded persistent PostgreSQL engine locally.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shru06-pro/klipIT.git
   cd klipIT
   ```

2. Install all dependencies across root, frontend, and backend:
   ```bash
   npm run install:all
   ```

3. Run both the backend and frontend concurrently:
   ```bash
   npm run dev
   ```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Probe**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 4. Environment Variables

Templates are provided in `.env.example`, `backend/.env.example`, and `frontend/.env.example`.

### Backend Environment (`backend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `PORT` | Port the Express server listens on | `5000` |
| `BASE_URL` | Public base URL used to construct short links (`${BASE_URL}/${code}`) | `http://localhost:3000` (or `https://yourdomain.com`) |
| `DATABASE_URL` | PostgreSQL connection string *(optional, falls back to embedded PGlite)* | `postgresql://user:pass@host:5432/dbname` |
| `CLIENT_ORIGIN` | Whitelisted origin(s) for CORS (comma-separated or wildcard) | `http://localhost:3000` |

### Frontend Environment (`frontend/.env`)
| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `REACT_APP_API_URL` | Base URL of the backend API (Create React App) | `http://localhost:5000` |
| `VITE_API_URL` | Base URL of the backend API (Vite alternative) | `http://localhost:5000` |

---

## 5. API Reference

### 1. Create Short URL
- **Endpoint**: `POST /api/shorten` (or `POST /api/urls`)
- **Rate Limit**: 60 requests per 15 minutes per IP
- **Body**:
  ```json
  {
    "url": "https://example.com/very/long/article?utm_source=twitter",
    "slug": "custom-alias",
    "autoExpire": true
  }
  ```
- **Response (`201 Created` or `200 OK` on duplicate)**:
  ```json
  {
    "shortUrl": "http://localhost:3000/custom-alias",
    "shortCode": "custom-alias",
    "clicks": 0,
    "expires_at": "2026-11-25T18:30:00.000Z",
    "created_at": "2026-10-26T18:30:00.000Z"
  }
  ```

### 2. Redirect to Original URL
- **Endpoint**: `GET /:code`
- **Behavior**: Resolves code from PostgreSQL, asynchronously increments `clicks = clicks + 1`, and redirects with HTTP `302 Found`. Returns HTTP `410 Gone` if expired, or HTTP `404 Not Found` if missing.

### 3. Get Link Statistics
- **Endpoint**: `GET /api/urls/:code`
- **Response (`200 OK`)**:
  ```json
  {
    "shortCode": "custom-alias",
    "originalUrl": "https://example.com/very/long/article",
    "clicks": 42,
    "expires_at": "2026-11-25T18:30:00.000Z",
    "created_at": "2026-10-26T18:30:00.000Z"
  }
  ```

### 4. Delete URL
- **Endpoint**: `DELETE /api/urls`
- **Body**:
  ```json
  {
    "shortCode": "custom-alias"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "message": "URL deleted successfully"
  }
  ```

### 5. Health Probe
- **Endpoint**: `GET /health`
- **Response (`200 OK`)**:
  ```json
  {
    "status": "ok",
    "uptime": 1284,
    "timestamp": "2026-10-26T18:30:00.000Z",
    "database": "ok"
  }
  ```

---

## 6. Database Schema

The PostgreSQL schema is defined in [`backend/src/database/schema.sql`](file:///d:/projects/url%20shortner/backend/src/database/schema.sql) and is automatically verified and applied on server startup:

```sql
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);
CREATE INDEX IF NOT EXISTS idx_urls_original_url ON urls(original_url);
```

---

## 7. Production Deployment Guide

### A. Database (Neon or Supabase)
1. Create a free PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy the connection string URI (e.g. `postgresql://user:password@ep-xyz.neon.tech/neondb?sslmode=require`).

### B. Backend (Render)
1. In the Render Dashboard, click **New + > Blueprint**.
2. Select your repository (`klipIT`).
3. Render automatically parses [`render.yaml`](file:///d:/projects/url%20shortner/render.yaml) and configures the root directory (`backend`), health check (`/health`), and environment variable slots.
4. Supply `BASE_URL` (your frontend domain), `DATABASE_URL`, and `CLIENT_ORIGIN`.

### C. Frontend (Vercel)
1. Import your repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set Environment Variable:
   - `REACT_APP_API_URL`: Your deployed Render backend URL (e.g. `https://klip-backend.onrender.com`).
4. Click **Deploy**. Vercel uses [`vercel.json`](file:///d:/projects/url%20shortner/vercel.json) to handle the production build and single-page routing.

---

## 8. Security & Engineering Best Practices

- **Helmet Security Headers**: Protects against cross-site scripting (XSS), clickjacking, and MIME sniffing.
- **Express Rate Limiting**: Throttles the link creation endpoint to 60 requests per 15 minutes per IP.
- **Input Sanitization**: Rejects self-referencing loops, invalid protocols (only HTTP/HTTPS accepted), and payload overages (> 2048 chars).
- **Reserved Keyword Blacklist**: Prevents custom slug collisions against system endpoints (`api`, `health`, `admin`, `static`, etc.).
- **Graceful Process Shutdown**: Intercepts `SIGINT` and `SIGTERM` signals to cleanly terminate open connections and release pool resources.

---

## 9. License

ISC License
