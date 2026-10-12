# klipIT - Fullstack URL Shortener

A modern fullstack URL shortener web application built with **React.js**, **Node.js**, **Express**, and **MongoDB**.

## Features

- **Instant URL Shortening**: Generates unique short IDs for long links using NanoID.
- **Smart Link Deduplication**: Reuses existing short links for identical destination URLs.
- **Seamless Redirection**: Automatically redirects visitors from short links (`http://localhost:3000/:id` and `http://localhost:5000/:id`) directly to target destinations.
- **Zero-Setup Database Fallback**: Embedded in-memory MongoDB (`mongodb-memory-server`) boots automatically if no local/remote MongoDB instance is running.
- **Persistent History**: Keeps track of your shortened links across browser sessions using `localStorage`.
- **One-Click Copy & Feedback**: Copy short links to your clipboard with immediate visual confirmation ("Copied!").
- **Responsive Design**: Clean UI powered by TailwindCSS and modern responsive layouts.

## Tech Stack

- **Frontend**: React 18, TailwindCSS, React Icons, React Spinners
- **Backend**: Node.js, Express, Mongoose, NanoID, MongoDB Memory Server
- **Tooling**: Concurrently, PowerShell & Batch launchers

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [npm](https://www.npmjs.com/)

### Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/shru06-pro/klipIT.git
cd klipIT
npm run install:all
```

### Running Locally

Run both frontend and backend concurrently with a single command:

```bash
# Option 1: npm
npm run dev

# Option 2: Windows PowerShell
.\run.ps1

# Option 3: Windows Batch
run.bat
```

- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### Environment Configuration

Environment templates are provided in `.env.example`, `server/.env.example`, and `client/.env.example`:

```env
# Server (.env)
PORT=5000
DATABASE_URL=mongodb://127.0.0.1:27017/url-shortener
BASE_URL=http://localhost:3000

# Client (.env)
REACT_APP_API_URL=http://localhost:5000
```

## License

ISC License
