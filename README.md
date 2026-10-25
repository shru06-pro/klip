# Klip. — Enterprise Fullstack URL Shortener & QR Studio

<div align="center">

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)
[![Node.js Version](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/React-v18.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-v4.18-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v14+-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Code Style: Enterprise](https://img.shields.io/badge/Architecture-Controller--Service--Repository-orange.svg)](https://martinfowler.com/eaaCatalog/repository.html)

**Klip** is a production-grade, neo-minimalist URL shortener and dynamic QR studio engineered for high-throughput link management. Built with **React 18**, **Node.js/Express**, and **PostgreSQL**, Klip provides edge-redirect performance, custom alias collision resolution, vector/raster QR exports, automated 30-day TTL lifecycle handling, and client telemetry with zero surveillance bloat.

[Live Demo](http://localhost:3000) • [Architecture](#-high-level-system-architecture) • [User Workflows](#-user-workflow-diagrams) • [API Reference](#-api-reference) • [Interview Questions & Answers](#-system-design--engineering-interview-qa)

</div>

---

## 📸 Screenshots & Visual Walkthrough

### 1. Desktop Interface & Hero Capsule
The interface uses a warm editorial color palette (`#F8F6F2`), high-contrast typography (*Instrument Serif* + *DM Sans*), and an active pill capsule shortener with real-time feedback.

<div align="center">
  <img src="docs/images/klip-preview.png" alt="Klip Desktop Interface" width="100%" />
</div>

<br/>

### 2. Multi-Device Responsive Layout
Engineered with responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`) ensuring consistent layout and touch target sizing across desktop, tablet, and mobile viewports.

<div align="center">
  <table>
    <tr>
      <td width="60%" align="center">
        <b>Active Result Card & Dynamic QR Matrix</b><br/><br/>
        <img src="docs/images/klip-active-card.png" alt="Klip Result Card & QR Matrix" width="100%" />
      </td>
      <td width="40%" align="center">
        <b>Mobile Device Viewport (390px)</b><br/><br/>
        <img src="docs/images/klip-mobile-preview.png" alt="Klip Mobile Viewport" width="100%" />
      </td>
    </tr>
  </table>
</div>

<br/>

### 3. Bento Feature Suite & Recent Links Ledger
Featuring 3-column architectural highlight tiles, dynamic click velocity sparklines, auto-expiration countdowns, and quick clipboard/QR modal actions.

<div align="center">
  <img src="docs/images/klip-bento-ledger.png" alt="Bento Feature Suite and Recent Links Ledger" width="100%" />
</div>

---

## 🏗 High-Level System Architecture

Klip is structured around a decoupled, multi-tier enterprise architecture following the **Controller-Service-Repository** pattern. Each tier maintains a strict boundary to isolate HTTP transport, business rules, and database persistence.

```mermaid
flowchart TD
    subgraph ClientLayer["Client & Presentation Tier"]
        Browser["Desktop & Mobile Browsers<br/>(React 18 SPA)"]
        CurlClient["CLI & External API Clients<br/>(curl / SDKs)"]
    end

    subgraph EdgeLayer["Edge & Ingress Tier"]
        DNS["DNS / Cloudflare Edge"]
        VercelEdge["Vercel CDN Edge<br/>(SPA Rewrites / Static Assets)"]
        ReverseProxy["Reverse Proxy / Load Balancer<br/>(Render Ingress / NGINX)"]
    end

    subgraph SecurityTier["Transport & Security Middleware"]
        HelmetMW["Helmet Security Headers<br/>(HSTS, CSP, X-Frame-Options)"]
        CorsMW["Dynamic CORS Middleware<br/>(Origin Whitelist Validation)"]
        RateLimitMW["Express Rate Limiter<br/>(60 req / 15 min per IP)"]
    end

    subgraph AppTier["Application & Routing Tier (Express.js)"]
        ServerLifecycle["Server Process Lifecycle<br/>(server.js - SIGINT/SIGTERM Graceful Shutdown)"]
        ExpressApp["Decoupled Express App<br/>(backend/src/app.js)"]
        
        subgraph Controllers["Controller Tier (HTTP Transport)"]
            UrlController["UrlController<br/>• shortenUrl()<br/>• handleRedirect()<br/>• getUrlStats()<br/>• deleteUrl()"]
            HealthController["HealthController<br/>• getHealth()<br/>• getRoot()"]
        end
    end

    subgraph ServiceTier["Domain Business Logic Tier"]
        UrlService["UrlService (Core Domain Logic)<br/>• RFC 3986 URL Validation<br/>• Custom Slug Regex & Blacklist Checks<br/>• NanoID Collision Resolution Loop<br/>• 30-Day Auto-Expiration Math<br/>• Asynchronous Click Increment Trigger"]
    end

    subgraph DataTier["Data Access Tier (Repository Pattern)"]
        UrlRepository["UrlRepository (Data Access Object)<br/>• findByShortCode()<br/>• findByOriginalUrl()<br/>• create()<br/>• incrementClicks()<br/>• deleteByShortCode()"]
        ConnectionPool["Database Connection Pool<br/>(pg.Pool with keep-alives)"]
        EmbeddedFallback["@electric-sql/pglite<br/>(In-Memory/Persistent Local Fallback)"]
    end

    subgraph DatabaseTier["Persistence Tier (PostgreSQL)"]
        PostgresDB[("PostgreSQL Database<br/>(Neon / Supabase / Local)")]
        TableUrls["Table: urls<br/>• id (SERIAL PK)<br/>• short_code (VARCHAR UNIQUE)<br/>• original_url (TEXT)<br/>• clicks (INTEGER DEFAULT 0)<br/>• created_at (TIMESTAMP)<br/>• expires_at (TIMESTAMP)"]
        IndexCode[("Index: idx_urls_short_code")]
        IndexUrl[("Index: idx_urls_original_url")]
    end

    %% Wiring Connections
    Browser -->|HTTP GET/POST| DNS
    CurlClient -->|HTTP GET/POST| DNS
    DNS --> VercelEdge
    DNS --> ReverseProxy
    VercelEdge -.->|Serve Static Bundle| Browser
    ReverseProxy --> ServerLifecycle
    ServerLifecycle --> ExpressApp

    ExpressApp --> HelmetMW
    HelmetMW --> CorsMW
    CorsMW --> RateLimitMW
    RateLimitMW --> Controllers

    UrlController --> UrlService
    HealthController --> ConnectionPool
    UrlService --> UrlRepository

    UrlRepository --> ConnectionPool
    ConnectionPool -.->|Production Connection| PostgresDB
    ConnectionPool -.->|Zero-Config Dev Fallback| EmbeddedFallback

    PostgresDB --- TableUrls
    TableUrls --- IndexCode
    TableUrls --- IndexUrl
```

---

## 🔄 User Workflow Diagrams

### 1. Link Creation & QR Code Generation Workflow
This sequence illustrates how a raw long URL is sanitized, validated, checked for collisions, persisted in PostgreSQL, and returned with a dynamic QR matrix.

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Client
    participant Frontend as React Frontend (App)
    participant RateLimit as RateLimiter MW
    participant Controller as UrlController
    participant Service as UrlService
    participant Repo as UrlRepository
    participant DB as PostgreSQL DB
    participant QR as QR Generator (Client)

    User->>Frontend: Input Long URL & Optional Custom Slug
    Frontend->>RateLimit: POST /api/shorten { url, slug, autoExpire }
    
    alt Rate Limit Exceeded (>60 req / 15m)
        RateLimit-->>Frontend: 429 Too Many Requests (Retry-After: 900)
        Frontend-->>User: Display rate limit alert banner
    else Under Rate Limit
        RateLimit->>Controller: Forward Request
        Controller->>Service: shortenUrl(url, slug, autoExpire)
        
        Service->>Service: Validate URL schema (http/https & loop protection)
        
        alt Invalid URL or Malicious Loop
            Service-->>Controller: Throw ValidationError (400 Bad Request)
            Controller-->>Frontend: 400 Bad Request { error: "Invalid URL" }
        else Valid Parameters
            alt Custom Slug Provided
                Service->>Service: Validate slug pattern (/^[a-zA-Z0-9_-]{3,50}$/)
                Service->>Repo: findByShortCode(slug)
                Repo->>DB: SELECT * FROM urls WHERE short_code = $1
                DB-->>Repo: Result (Found / Null)
                
                alt Slug Collision Found
                    Service-->>Controller: Throw ConflictError (409 Conflict)
                    Controller-->>Frontend: 409 Conflict { error: "Slug already exists" }
                end
            else Auto-Generate Slug
                loop Collision Resolution (Up to 3 Retries)
                    Service->>Service: Generate 6-char NanoID [a-zA-Z0-9]
                    Service->>Repo: findByShortCode(id)
                    Repo->>DB: SELECT 1 FROM urls WHERE short_code = $1
                    DB-->>Repo: null (Unique Code Verified)
                end
            end
            
            Service->>Service: Calculate TTL: expires_at = now + 30 days
            Service->>Repo: create({ short_code, original_url, expires_at })
            Repo->>DB: INSERT INTO urls (...) VALUES (...) RETURNING *
            DB-->>Repo: Saved URL Record
            Repo-->>Service: UrlEntity Record
            Service-->>Controller: Formatted Output DTO
            Controller-->>Frontend: 201 Created { shortUrl, shortCode, clicks: 0, expires_at }
            
            Frontend->>QR: Compute QR Code Matrix (Error Correction: H)
            QR-->>Frontend: Render Vector SVG & Raster 4K PNG
            Frontend->>Frontend: Save to LocalStorage Ledger
            Frontend-->>User: Display Active Result Card & Dynamic QR Matrix
        end
    end
```

<br/>

### 2. Fast Edge 302 Redirection & Telemetry Workflow
This sequence traces the latency path of a user clicking a short link, demonstrating how Klip returns an instant HTTP `302 Found` header while firing non-blocking click tracking asynchronously.

```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Web Visitor / Mobile Device
    participant Edge as Edge Gateway / Express Router
    participant Controller as UrlController
    participant Service as UrlService
    participant Repo as UrlRepository
    participant DB as PostgreSQL DB
    actor Target as Target Web Server (Original URL)

    Visitor->>Edge: GET /:shortCode (e.g. /hackernews)
    Edge->>Controller: handleRedirect(req, res)
    Controller->>Service: getOriginalUrl(shortCode)
    Service->>Repo: findByShortCode(shortCode)
    Repo->>DB: SELECT * FROM urls WHERE short_code = $1 LIMIT 1
    DB-->>Repo: Record (original_url, expires_at, clicks)
    
    alt Short Code Not Found
        Repo-->>Service: null
        Service-->>Controller: Throw NotFoundError (404)
        Controller-->>Visitor: 404 Not Found HTML Page
    else Short Code Found
        Service->>Service: Check Expiration: current_time > expires_at?
        alt Link Expired
            Service-->>Controller: Throw ExpiredError (410 Gone)
            Controller-->>Visitor: 410 Gone (Link Expired)
        else Link Active
            Service-->>Controller: Return original_url
            
            Note over Controller,Visitor: FAST PATH: Send 302 Redirect Immediately
            Controller-->>Visitor: HTTP 302 Found<br/>Location: https://news.ycombinator.com<br/>Cache-Control: no-cache, no-store
            
            Visitor->>Target: GET https://news.ycombinator.com
            Target-->>Visitor: 200 OK (Page Rendered)
            
            Note over Controller,DB: ASYNC TELEMETRY (Non-blocking background job)
            Controller-)Service: recordClick(shortCode)
            Service-)Repo: incrementClicks(shortCode)
            Repo-)DB: UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1
            DB-->>Repo: 1 Row Updated
        end
    end
```

---

## 📁 Repository Directory Structure

```
klipIT/
├── package.json                           # Monorepo root scripts & dev orchestration
├── vercel.json                            # Vercel deployment & client-side rewrite rules
├── render.yaml                            # Render backend blueprint specification
├── .gitignore                             # Git ignore rules for node_modules, logs, and envs
├── .env.example                           # Global environment template reference
│
├── docs/                                  # Project documentation & visual assets
│   └── images/
│       ├── klip-preview.png               # High-resolution desktop UI screenshot
│       ├── klip-mobile-preview.png        # Mobile responsive viewport screenshot (390px)
│       ├── klip-active-card.png           # Active result card & QR code matrix preview
│       └── klip-bento-ledger.png          # Bento feature grid & recent links ledger
│
├── backend/                               # Layered Express + PostgreSQL Backend
│   ├── server.js                          # Process bootstrap, port listening, & SIGTERM handler
│   ├── package.json                       # Backend dependencies & test scripts
│   ├── .env.example                       # Backend environment template
│   └── src/
│       ├── app.js                         # Decoupled Express app (middleware, routing, errors)
│       ├── config/
│       │   ├── env.config.js              # Validated environment configuration with defaults
│       │   └── constants.js               # Rate limits, status codes, and slug regex constants
│       ├── database/
│       │   ├── connection.js              # pg.Pool with automatic @electric-sql/pglite fallback
│       │   └── schema.sql                 # DDL migration statements (CREATE TABLE & INDEXES)
│       ├── controllers/
│       │   ├── url.controller.js          # HTTP handlers for /api/shorten, /:code, stats, deletion
│       │   └── health.controller.js       # Health and telemetry probes
│       ├── services/
│       │   └── url.service.js             # Core domain logic (NanoID, validation, expiration)
│       ├── repositories/
│       │   └── url.repository.js          # Direct PostgreSQL persistence queries (SQL queries)
│       ├── validators/
│       │   └── url.validator.js           # RFC 3986 URL, loop-protection, and slug validation
│       ├── middlewares/
│       │   ├── cors.middleware.js         # Dynamic multi-origin CORS whitelist handler
│       │   ├── rateLimiter.middleware.js  # Express rate limiting (60 req / 15 min per IP)
│       │   └── error.middleware.js        # Centralized HTTP error handler & CORS response formatting
│       └── routes/
│           ├── index.js                   # Root router combining /health, /api, and /:code 302
│           └── api/
│               ├── health.routes.js       # Health check routes
│               └── url.routes.js          # RESTful shortener endpoints
│
└── frontend/                              # React 18 Single Page Application
    ├── package.json                       # Frontend dependencies & build scripts
    ├── tailwind.config.js                 # Tailwind design tokens, typography, and color palette
    ├── public/
    │   ├── index.html                     # HTML root template with Google Font preconnects
    │   ├── favicon.ico                    # Browser tab favicon
    │   ├── favicon-16x16.png              # 16px favicon
    │   ├── favicon-32x32.png              # 32px favicon
    │   └── apple-touch-icon.png           # iOS touch icon
    └── src/
        ├── index.js                       # React 18 Concurrent Root mount point
        ├── index.css                      # Custom utility classes, animations, design variables
        ├── App.js                         # Application shell & client-side redirect interceptor
        ├── reportWebVitals.js             # Performance metrics reporting
        ├── assets/
        │   └── images/
        │       └── logo-icon.png          # High-resolution monogram icon
        ├── config/
        │   ├── api.config.js              # Dynamic API base URL resolution
        │   └── navigation.config.js       # Navbar anchor mappings & external links
        ├── services/
        │   ├── api.service.js             # Fetch HTTP client with error handling
        │   ├── qr.service.js              # Dynamic QR matrix generation & SVG/PNG exports
        │   └── storage.service.js         # LocalStorage link persistence & recovery
        ├── hooks/
        │   ├── useLinks.js                # Link history state, sync, and deletion logic
        │   ├── useClipboard.js            # Clipboard copy state with timeout feedback
        │   └── useScrollSpy.js            # Active navigation section tracking
        └── components/
            ├── layout/
            │   ├── Header.jsx             # Brand header with sliding active indicator
            │   ├── Footer.jsx             # Footer with system status and copyright
            │   └── Main.jsx               # Content layout coordinator
            ├── common/
            │   └── QrModal.jsx            # Modal inspector for high-res QR downloads
            └── features/
                ├── hero/Hero.jsx          # Fluid editorial typography headline
                ├── shortener/Shortener.jsx# Responsive pill input capsule with toggle options
                ├── result/ActiveResultCard.jsx # Active Klip result card with inline QR preview
                ├── bento/BentoFeatures.jsx# 3-column architectural highlight grid
                └── ledger/UrlList.jsx     # Recent links table with sparklines and actions
```

---

## ⚡ Tech Stack Reference

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [React 18](https://react.dev/) (Concurrent Mode, Hooks, Functional Components) |
| **Styling & Design System** | [Tailwind CSS v3.4](https://tailwindcss.com/) with curated `#F8F6F2` editorial tokens |
| **Typography** | *Instrument Serif* (Display Headings), *DM Sans* (Body Copy), *DM Mono* (Code/Metrics) |
| **QR Code Engine** | [qrcode](https://www.npmjs.com/package/qrcode) (Client-side vector SVG & raster 4K PNG generation) |
| **Backend Runtime** | [Node.js v18+](https://nodejs.org/) & [Express v4.18](https://expressjs.com/) |
| **Database & Pooling** | [PostgreSQL](https://www.postgresql.org/) with `pg` connection pool + `@electric-sql/pglite` embedded fallback |
| **Identifier Generation** | [nanoid](https://www.npmjs.com/package/nanoid) (Cryptographically secure URL-friendly 6-character tokens) |
| **Security & Protection** | [Helmet](https://helmetjs.github.io/) (HTTP security headers), [express-rate-limit](https://express-rate-limit.mintlify.app/) |
| **Deployment Targets** | [Vercel](https://vercel.com) (Frontend CDN), [Render](https://render.com) (Backend), [Neon](https://neon.tech) / [Supabase](https://supabase.com) (PostgreSQL) |

---

## 🚀 Quickstart & Local Installation

### Prerequisites
- **Node.js**: `v18.0.0` or higher (`node -v`)
- **npm**: `v9.0.0` or higher (`npm -v`)
- *(Optional)* A remote PostgreSQL database (Neon, Supabase). If omitted, Klip automatically initializes an embedded local PGlite database without any setup required.

### 1. Clone & Install
```bash
# Clone the repository
git clone https://github.com/shru06-pro/klipIT.git
cd klipIT

# Install root, backend, and frontend dependencies in one command
npm run install:all
```

### 2. Configure Environment Variables
Copy the provided environment templates:
```bash
# Backend environment
cp backend/.env.example backend/.env

# Frontend environment
cp frontend/.env.example frontend/.env
```

Default values in `backend/.env`:
```env
PORT=5000
BASE_URL=http://localhost:3000
CLIENT_ORIGIN=http://localhost:3000
# DATABASE_URL=postgresql://user:password@localhost:5432/klipdb
```

Default values in `frontend/.env`:
```env
REACT_APP_API_URL=http://localhost:5000
```

### 3. Start Development Servers
Run both backend and frontend concurrently with live reloading:
```bash
npm run dev
```

- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## 📡 API Reference

All requests and responses use standard JSON (`application/json`) unless redirecting with HTTP `302`.

### Endpoints Overview

| Method | Endpoint | Description | Rate Limited | Auth Required |
| :--- | :--- | :--- | :---: | :---: |
| `POST` | `/api/shorten` | Shorten a long URL with optional custom slug & 30d TTL | Yes (60/15m) | No |
| `POST` | `/api/urls` | Alias to `/api/shorten` | Yes (60/15m) | No |
| `GET` | `/:code` | Redirect to the original URL (HTTP 302 Found) | No | No |
| `GET` | `/api/urls/:code` | Fetch metadata, expiration, and click analytics for a link | No | No |
| `DELETE`| `/api/urls` | Delete a shortened link from the database | No | No |
| `GET` | `/health` | Server and database connectivity health probe | No | No |
| `GET` | `/` | API status and version metadata | No | No |

---

### Detailed Endpoint Specifications

#### 1. Shorten URL (`POST /api/shorten` or `POST /api/urls`)
Creates a new shortened URL or returns the existing active shortcode if the same URL has already been registered without a conflicting slug.

- **URL**: `/api/shorten`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Rate Limit**: 60 requests per 15 minutes per IP address

##### Request Body Schema
| Parameter | Type | Required | Constraints | Description |
| :--- | :--- | :---: | :--- | :--- |
| `url` | String | **Yes** | Valid RFC 3986 URL, max 2048 chars, HTTP/HTTPS only | The destination URL to shorten. |
| `slug` | String | No | 3–50 chars, regex `^[a-zA-Z0-9_-]+$`, no reserved words | Custom alias for the link. |
| `autoExpire` | Boolean| No | Default `false` | When `true`, sets `expires_at` to exactly 30 days from creation. |

##### Request Example
```bash
curl -X POST http://localhost:5000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://news.ycombinator.com",
    "slug": "hn-frontpage",
    "autoExpire": true
  }'
```

##### Successful Response (`201 Created` or `200 OK`)
```json
{
  "shortUrl": "http://localhost:3000/hn-frontpage",
  "shortCode": "hn-frontpage",
  "clicks": 0,
  "expires_at": "2026-11-25T19:30:00.000Z",
  "created_at": "2026-10-26T19:30:00.000Z"
}
```

##### Error Responses
- **`400 Bad Request`**: URL is missing, invalid protocol (e.g. `ftp://`), payload over 2048 characters, or contains a self-referencing redirect loop.
  ```json
  {
    "error": "Invalid URL. Must be a valid HTTP or HTTPS web address."
  }
  ```
- **`409 Conflict`**: Custom slug has already been registered by another user.
  ```json
  {
    "error": "Custom slug 'hn-frontpage' is already taken. Please choose another."
  }
  ```
- **`429 Too Many Requests`**: Rate limit exceeded.
  ```json
  {
    "error": "Too many requests from this IP, please try again after 15 minutes."
  }
  ```

---

#### 2. Redirect to Original URL (`GET /:code`)
Resolves the short code, validates expiration, asynchronously increments click telemetry, and issues an HTTP `302 Found` response.

- **URL**: `/:code` (e.g. `/hn-frontpage`)
- **Method**: `GET`
- **Response Headers**:
  - `Location: https://news.ycombinator.com`
  - `Cache-Control: no-cache, no-store, must-revalidate`

##### Request Example
```bash
curl -i http://localhost:5000/hn-frontpage
```

##### Response (`302 Found`)
```http
HTTP/1.1 302 Found
Location: https://news.ycombinator.com
Cache-Control: no-cache, no-store, must-revalidate
Date: Mon, 26 Oct 2026 19:30:00 GMT
Connection: keep-alive
```

##### Error Responses
- **`404 Not Found`**: Short code does not exist.
  ```json
  {
    "error": "Short URL not found"
  }
  ```
- **`410 Gone`**: Link had a 30-day expiration date that has now passed.
  ```json
  {
    "error": "This shortened link has expired."
  }
  ```

---

#### 3. Link Statistics & Analytics (`GET /api/urls/:code`)
Retrieves click counts, target destination, and lifecycle timestamps for an existing shortcode.

- **URL**: `/api/urls/:code`
- **Method**: `GET`

##### Request Example
```bash
curl -X GET http://localhost:5000/api/urls/hn-frontpage
```

##### Successful Response (`200 OK`)
```json
{
  "shortCode": "hn-frontpage",
  "originalUrl": "https://news.ycombinator.com",
  "clicks": 42,
  "expires_at": "2026-11-25T19:30:00.000Z",
  "created_at": "2026-10-26T19:30:00.000Z"
}
```

##### Error Response (`404 Not Found`)
```json
{
  "error": "Short URL not found"
}
```

---

#### 4. Delete URL (`DELETE /api/urls`)
Removes a shortened URL from the PostgreSQL database.

- **URL**: `/api/urls`
- **Method**: `DELETE`
- **Headers**: `Content-Type: application/json`

##### Request Body
```json
{
  "shortCode": "hn-frontpage"
}
```

##### Request Example
```bash
curl -X DELETE http://localhost:5000/api/urls \
  -H "Content-Type: application/json" \
  -d '{"shortCode": "hn-frontpage"}'
```

##### Successful Response (`200 OK`)
```json
{
  "message": "URL deleted successfully"
}
```

##### Error Responses
- **`400 Bad Request`**: `shortCode` missing in request body.
- **`404 Not Found`**: `shortCode` not found in database.

---

#### 5. Health & Database Probe (`GET /health`)
Used by deployment platforms (Render, Kubernetes, AWS ALB) for liveness and readiness probes.

- **URL**: `/health`
- **Method**: `GET`

##### Request Example
```bash
curl -X GET http://localhost:5000/health
```

##### Successful Response (`200 OK`)
```json
{
  "status": "ok",
  "uptime": 3600,
  "timestamp": "2026-10-26T19:30:00.000Z",
  "database": "ok"
}
```

##### Degraded Response (`503 Service Unavailable`)
```json
{
  "status": "degraded",
  "uptime": 3600,
  "timestamp": "2026-10-26T19:30:00.000Z",
  "database": "disconnected"
}
```

---

## 🗄 Database Schema & Indexing Strategy

The PostgreSQL schema is defined in [`backend/src/database/schema.sql`](file:///d:/projects/url%20shortner/backend/src/database/schema.sql) and is automatically applied on boot:

```sql
-- Core URLs persistence table
CREATE TABLE IF NOT EXISTS urls (
    id SERIAL PRIMARY KEY,
    short_code VARCHAR(50) UNIQUE NOT NULL,
    original_url TEXT NOT NULL,
    clicks INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- B-Tree index for O(log N) fast short code resolution on redirects
CREATE INDEX IF NOT EXISTS idx_urls_short_code ON urls(short_code);

-- B-Tree index for O(log N) fast duplicate long URL lookups
CREATE INDEX IF NOT EXISTS idx_urls_original_url ON urls(original_url);
```

### Why B-Tree Indexes?
- **`idx_urls_short_code`**: Powers the hot read path (`GET /:code`). Because this query runs on every redirect, having a unique B-Tree index keeps point lookups at $O(\log N)$ or practically $O(1)$ when cached in PostgreSQL buffer pool memory.
- **`idx_urls_original_url`**: Enables deduplication during URL creation (`POST /api/shorten`). When users submit the same URL repeatedly, the database quickly finds the existing entry without scanning the entire table.

---

## 🚢 Production Deployment Guide

### A. Managed Database (Neon or Supabase)
1. Create a free PostgreSQL instance on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Copy your pooled connection URI string:
   ```
   postgresql://user:password@ep-cold-shadow-12345.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### B. Backend Deployment (Render)
1. Log in to [Render](https://render.com) and click **New + > Blueprint**.
2. Connect your GitHub repository (`shru06-pro/klipIT`).
3. Render parses [`render.yaml`](file:///d:/projects/url%20shortner/render.yaml) and automatically provisions:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Health Check Path: `/health`
4. Set Environment Variables in the Render dashboard:
   - `BASE_URL`: Your production frontend URL (e.g. `https://klip-app.vercel.app`)
   - `CLIENT_ORIGIN`: Your production frontend URL (e.g. `https://klip-app.vercel.app`)
   - `DATABASE_URL`: Your PostgreSQL connection string.

### C. Frontend Deployment (Vercel)
1. Import the repository on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set the Environment Variable:
   - `REACT_APP_API_URL`: Your deployed Render backend URL (e.g. `https://klip-backend.onrender.com`).
4. Click **Deploy**. Vercel uses [`vercel.json`](file:///d:/projects/url%20shortner/vercel.json) to bundle assets and forward client routes.

---

## 💡 System Design & Engineering Interview Q&A

This section contains 15 technical interview questions, system design trade-offs, and architectural explanations directly applicable to URL shortener systems like Klip.

---

### Q1: Why do URL shorteners return HTTP 302 Found (or 307 Temporary Redirect) instead of HTTP 301 Moved Permanently?

**Answer:**
- **HTTP 301 Moved Permanently**: Browsers and intermediate HTTP caches aggressively cache 301 redirects locally on the client machine. Once a browser receives a 301, subsequent visits to that short URL will never reach the shortener server again; the browser redirects directly to the destination from its disk cache. This makes accurate **click analytics and telemetry impossible**. Furthermore, if the destination URL needs to be updated or revoked, 301 makes it nearly impossible to invalidate clients' local caches.
- **HTTP 302 Found (or 307 Temporary Redirect)**: Tells the client that the redirection is temporary. The browser will continue making a network request to the shortener server on every visit, allowing the server to record analytics (timestamps, user-agents, referrers, geographic location) and check expiration dates before returning the redirection location.
- **Header Best Practice**: Always pair 302 with explicit cache prevention headers:
  ```http
  HTTP/1.1 302 Found
  Location: https://destination.com
  Cache-Control: no-cache, no-store, must-revalidate
  ```

---

### Q2: How does Klip handle short code collisions between custom aliases and auto-generated NanoID tokens?

**Answer:**
Klip uses a multi-layered collision defense strategy:
1. **Schema-Level Invariant**: A `UNIQUE` constraint and B-Tree index on `short_code` in the PostgreSQL database ensures that duplicate codes can never be written concurrently.
2. **Deterministic Lookup First**: If a user submits a custom alias, the service queries `findByShortCode(slug)` before writing. If found, an explicit `409 Conflict` error is returned.
3. **Collision-Retry Loop for Auto-Generated Codes**: When generating random tokens, Klip generates a 6-character URL-safe string using `nanoid`. If a collision occurs (which has an astronomically low probability of $1 \text{ in } 64^6 \approx 6.87 \times 10^{10}$), the service enters a retry loop with a bounded maximum attempt count ($N = 3$) to draw another token before committing.
4. **Reserved Word Blacklist**: Custom slugs are checked against a blacklist of reserved route names (`api`, `health`, `static`, `admin`, `login`, `terms`) to ensure custom links never hijack application routes.

---

### Q3: Why choose NanoID or Base62 over standard cryptographic hashes (MD5, SHA-256) or auto-incrementing integer IDs?

**Answer:**
- **MD5 / SHA-256 Drawbacks**: Hashing algorithms output long digests (e.g., 32 hexadecimal characters for MD5, 64 for SHA-256). Truncating an MD5 hash to 6 characters drastically increases the collision probability (the Birthday Paradox). Furthermore, cryptographic hashes are computationally expensive compared to PRNG string generation.
- **Auto-Incrementing Integer IDs (Base62) Drawbacks**: While encoding sequential database IDs (`1, 2, 3...`) into Base62 (`1, 2, ... a, b, ...`) is fast and collision-free, it exposes the system to **enumeration attacks**. Competitors or malicious bots can easily crawl every short link by iterating through IDs sequentially, discovering private or unlisted links and calculating exact total link volume.
- **NanoID Advantages**: NanoID uses a cryptographically secure pseudo-random number generator (CSPRNG), an alphabet of 64 URL-safe characters (`A-Z`, `a-z`, `0-9`, `_`, `-`), and uniform distribution. A 6-character NanoID yields $64^6 \approx 68.7 \text{ billion}$ unique combinations without sequential predictability.

---

### Q4: In high-concurrency systems handling 100,000 redirects/sec, why is `UPDATE urls SET clicks = clicks + 1` an anti-pattern, and how do you resolve it?

**Answer:**
- **The Bottleneck**: In relational databases like PostgreSQL, running `UPDATE urls SET clicks = clicks + 1 WHERE short_code = $1` on every incoming redirect causes severe **row-level lock contention**. If 5,000 visitors hit the same viral short link concurrently, transactions queue behind row locks, leading to thread pool exhaustion, latency spikes, and potential deadlocks. Furthermore, frequent updates generate high Write-Ahead Log (WAL) volume and table bloat (dead tuples in MVCC).
- **Production Solution — Write-Back Caching with Redis**:
  1. **Hot Path**: Increment an atomic in-memory counter in Redis via `INCR url:clicks:<short_code>`. This operation takes sub-millisecond time and handles hundreds of thousands of operations per second per node.
  2. **Asynchronous Persistence**: A background worker (or Redis cron sync) periodically flushes batch totals back to PostgreSQL using a single bulk statement:
     ```sql
     UPDATE urls SET clicks = clicks + batch.count 
     FROM (VALUES ('hn-link', 450), ('gh-link', 820)) AS batch(short_code, count)
     WHERE urls.short_code = batch.short_code;
     ```
- **Alternative Solution — Event Streaming (Kafka / RabbitMQ)**: Publish a lightweight click event `{ code, timestamp, userAgent, ip }` to a Kafka topic. An ingestion pipeline processes the stream in batches, updating the primary database and sending granular events to an analytics warehouse (ClickHouse / Snowflake).

---

### Q5: How would you design a database indexing strategy to optimize read-heavy URL shortener workloads?

**Answer:**
URL shortener traffic is typically **99% reads and 1% writes**. The indexing strategy must reflect this asymmetry:
1. **B-Tree on `short_code`**: A unique B-Tree index (`idx_urls_short_code`) allows the database engine to find the row pointer via an index seek in $O(\log N)$ time without touching table heap pages until reading the row data.
2. **Index-Only Scans**: By creating an index that covers the required columns:
   ```sql
   CREATE UNIQUE INDEX idx_urls_redirect 
   ON urls(short_code) 
   INCLUDE (original_url, expires_at);
   ```
   PostgreSQL can satisfy the entire redirect query directly from the index tree without any heap fetches (zero table page reads), drastically cutting disk I/O.
3. **Partial Indexes for Expirations**: If cleanups or filtered queries run on active links:
   ```sql
   CREATE INDEX idx_urls_active ON urls(expires_at) WHERE expires_at IS NOT NULL;
   ```
   This keeps index size small because links without expiration dates are excluded from the index.

---

### Q6: How do you handle link expiration (TTL) without table-locking cron jobs or degrading read performance?

**Answer:**
Running `DELETE FROM urls WHERE expires_at < NOW()` on a table with 500 million rows can cause full table scans, long transaction locks, and massive replication lag. Modern systems use a **Hybrid Lazy-Evaluation + Batch Purge** pattern:
1. **Lazy Check on Read (Application Layer)**: When a visitor accesses `/:code`, the service checks `if (record.expires_at && new Date() > record.expires_at)`. If expired, it returns HTTP `410 Gone` immediately. No expired link is ever served to users, regardless of whether it has been deleted from disk.
2. **Chunked Asynchronous Cleanup (Background)**: An automated worker runs during off-peak hours deleting records in small, bounded limits:
   ```sql
   DELETE FROM urls 
   WHERE id IN (
     SELECT id FROM urls 
     WHERE expires_at < NOW() 
     LIMIT 5000
   );
   ```
   Committing after every 5,000 records avoids long-lived locks and allows other queries to interleave cleanly.

---

### Q7: How does a URL shortener defend against recursive redirect loops and malicious phishing URLs?

**Answer:**
1. **Self-Referencing Loop Prevention**: Before saving, the application parses the target URL's hostname and compares it against the application's domain (`BASE_URL` or `req.headers.host`). If a user attempts to shorten `http://localhost:3000/xyz` to point to `http://localhost:3000/abc`, the request is rejected with `400 Bad Request`.
2. **Chain Depth Bounding**: If the destination redirects to another shortener, the client could get stuck in an infinite cycle. Advanced engines follow redirects up to a maximum depth ($D = 5$) during creation to verify the final landing target.
3. **Malware & Phishing Integration**: Production shorteners hook into Google Safe Browsing API or Cloudflare Radar during link creation. If the domain matches a known phishing, malware, or command-and-control server, link creation is blocked.
4. **URL Protocol Whitelisting**: Strict regex verification allows only `http://` and `https://`. Protocols like `javascript:`, `data:`, or `file://` are strictly rejected to prevent Cross-Site Scripting (XSS) and SSRF attacks.

---

### Q8: Explain the differences between Token Bucket, Leaky Bucket, and Fixed Window rate limiters. How does Klip implement protection?

**Answer:**
- **Fixed Window Counter** (Current Express implementation): Tracks request counts per client IP in fixed time intervals (e.g. 60 requests per 15-minute window). It is computationally lightweight with low memory footprint, but can suffer from a burst at the boundary (e.g., 60 requests at minute 14:59 and another 60 at 15:01).
- **Sliding Window Log / Counter**: Smooths out boundary bursts by weighting counts from previous and current windows based on the exact timestamp.
- **Token Bucket**: Tokens are continuously added to a bucket at a constant refill rate up to a maximum capacity. Each request consumes one token. This easily handles short bursts of legitimate traffic while enforcing an average rate limit.
- **Leaky Bucket**: Requests enter a queue and are processed at a strictly constant rate, smoothing out traffic spikes (ideal for protecting downstream database writes).

---

### Q9: How would you architect a caching tier for a global URL shortener with a 99:1 read-to-write ratio?

**Answer:**
A multi-tier caching architecture ensures that less than 1% of read requests ever touch the origin database:
1. **Layer 1: Edge CDN (Cloudflare / Fastly)**:
   - For public links that do not require millisecond-accurate click telemetry, the 302 redirect header can be cached at Edge Points of Presence (PoPs) worldwide for 5 minutes (`Cache-Control: public, max-age=300`).
   - If user-level telemetry is required, edge workers (e.g. Cloudflare Workers) intercept the request at the edge, record the analytics event to an edge key-value store, and redirect directly from the edge PoP with < 25ms latency.
2. **Layer 2: In-Memory Cache (Redis Cluster)**:
   - The application server checks Redis first: `GET url:<short_code>`.
   - If cache hit: return destination URL immediately.
   - If cache miss: query PostgreSQL, store result in Redis with an LRU (Least Recently Used) eviction policy and 24-hour TTL, then return.
3. **Layer 3: Primary Relational DB**:
   - Only cache misses touch PostgreSQL, shielding the database from read spikes.

---

### Q10: How would you shard or partition the database when scaling to 10 billion links?

**Answer:**
When table size exceeds memory capacity (e.g., 10 billion rows $\approx 1 \text{ TB}$ of index and data), horizontal sharding becomes necessary:
1. **Sharding Key Selection**:
   - The ideal shard key is `short_code`.
   - Hash the first characters of the `short_code` modulo the number of database shards ($N$):
     $$\text{Shard ID} = \text{MurmurHash3}(\text{short\_code}) \pmod N$$
   - This ensures uniform distribution of links across all database nodes.
2. **Range-Based Partitioning vs Hash Partitioning**:
   - Range-based partitioning on `created_at` (e.g., one partition per month) is useful for archiving or dropping old expired links, but can create a "hot shard" where all new writes hit the current month's partition.
   - Hash partitioning on `short_code` provides balanced read and write load across all shards.
3. **Consistent Hashing**:
   - In production, consistent hashing (using a virtual ring of 1,024 v-nodes) allows adding or removing database nodes without having to re-hash and migrate all existing keys.

---

### Q11: What are the trade-offs between Client-Side vs Server-Side QR Code Generation, and Vector (SVG) vs Raster (PNG)?

**Answer:**
- **Client-Side Generation (Klip's Approach)**:
  - **Pros**: Zero backend CPU overhead. The client calculates the QR Galois/Reed-Solomon matrix locally in JavaScript. Fast rendering and reduced network bandwidth.
  - **Cons**: Requires client JavaScript execution; cannot easily serve a direct `qr.png` image URL to third-party embedders without a server route.
- **Server-Side Generation**:
  - **Pros**: Accessible via direct URL (e.g. `<img src="https://klip.it/api/qr/abc.png" />`). Can be cached at the CDN layer.
  - **Cons**: Consumes server CPU cycles and memory for raster image encoding on every request.
- **Vector (SVG) vs Raster (PNG)**:
  - **SVG**: Infinite resolution, ultra-crisp at any print scale (billboards, magazines), smaller file size (~2KB), perfect for designers and typography studios.
  - **PNG**: Universal compatibility with messaging apps, email clients, and native mobile photo galleries. Klip provides both formats via a dual-download studio modal.

---

### Q12: Why decouple the Express application (`app.js`) from the network server listener (`server.js`)?

**Answer:**
1. **Automated Testing**: By exporting the `app` instance without calling `app.listen(PORT)`, integration tests using Supertest can execute requests directly against the Express pipeline in memory without binding to network ports. This prevents port collisions (`EADDRINUSE`) during parallel test runs.
2. **Process Lifecycle Management**: `server.js` acts solely as the process coordinator. It handles port binding, logs startup state, and registers handlers for process signals (`SIGTERM`, `SIGINT`, `unhandledRejection`).
3. **Clean Teardown**: When Kubernetes or Render terminates the container, `server.js` intercepts `SIGTERM`, stops accepting new HTTP connections via `server.close()`, waits for in-flight requests to complete, closes the database connection pool cleanly, and exits with code 0.

---

### Q13: How does Klip handle idempotency in link creation requests?

**Answer:**
- **Idempotent Duplicate Prevention**: If a client submits a long URL without a custom slug that already exists in the database, the service returns the existing short link record with an HTTP `200 OK` status code instead of creating a duplicate row with a new code.
- **Deterministic Deduplication Query**:
  ```sql
  SELECT * FROM urls WHERE original_url = $1 AND (expires_at IS NULL OR expires_at > NOW()) LIMIT 1;
  ```
- **Custom Alias Exception**: If the user explicitly provides a custom slug, the user intends to create a branded vanity alias. In this case, the system verifies that the custom alias is unique, and if available, creates the entry even if the target URL exists under an auto-generated token.

---

### Q14: How does CORS work under the hood with preflight requests, and why is origin whitelisting preferred over `*`?

**Answer:**
- **Preflight `OPTIONS` Request**: When a browser sends a cross-origin request with non-simple headers (e.g. `Content-Type: application/json`), it first issues an HTTP `OPTIONS` request. The browser inspects the response headers (`Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, `Access-Control-Allow-Headers`) before dispatching the actual `POST` or `DELETE` payload.
- **Why Wildcard `*` is Inadequate**:
  - Using `Access-Control-Allow-Origin: *` prevents sending authenticated credentials (`cookies`, `Authorization` headers) because browsers reject credentials when the wildcard is returned.
  - Wildcard allows any arbitrary malicious website to make cross-origin calls to private endpoints.
- **Dynamic Origin Whitelist**: Klip dynamically inspects incoming request `Origin` headers against an array of whitelisted domains (`CLIENT_ORIGIN`), echoing back the exact matching origin or rejecting unauthorized domains before request processing.

---

### Q15: How does Klip's database connection layer guarantee zero-downtime local development using PGlite when external PostgreSQL is unreachable?

**Answer:**
- **The Problem**: In microservice and enterprise codebases, developers often face broken local setups when external cloud databases are unreachable, credentials change, or developers work offline without Docker installed.
- **The PGlite Solution**: Klip implements a resilient fallback driver in [`backend/src/database/connection.js`](file:///d:/projects/url%20shortner/backend/src/database/connection.js):
  1. It first attempts to establish a pooled connection using standard `pg.Pool` with a 3-second connection timeout.
  2. If the connection fails or `DATABASE_URL` is omitted, it catches the error and automatically initializes an embedded **PGlite** instance (an in-memory and filesystem-backed WASM build of PostgreSQL).
  3. It automatically executes [`schema.sql`](file:///d:/projects/url%20shortner/backend/src/database/schema.sql) to apply tables and indexes.
  4. The rest of the application code remains 100% unchanged because PGlite supports the exact same parameterized SQL syntax (`$1, $2`) and query response structures (`{ rows }`).

---

## 📄 License

This project is licensed under the [ISC License](LICENSE). Built for high-reliability URL redirection and creative editorial workflows.
