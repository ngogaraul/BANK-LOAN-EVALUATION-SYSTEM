# Loan System

Monorepo containing the Loan System backend and frontend applications.

## Overview

- **Backend:** Sanic-based API (Python) located in `loan_system_backend/`.
- **Frontend:** React + Vite UI located in `loan-system-frontend/`.

This repository provides the API and a simple web UI for managing clients, applications, scoring, and decisions.

## Repository structure

- `loan_system_backend/` — Python backend, dependencies in `requirements.txt`, main app in `app/`.
- `loan-system-frontend/` — Frontend built with React and Vite.
- `README.md` — This file.
- `.gitignore` — Root gitignore for the project.

## Prerequisites

- Python 3.11+ 
- Node.js 18+ and npm/yarn
- A database supported by SQLAlchemy (set via `DATABASE_URL`)

## Environment variables

The backend loads environment variables (via python-dotenv if present). Important vars include:

- `APP_HOST` — backend host (default `0.0.0.0`)
- `APP_PORT` — backend port (default `9000`)
- `DATABASE_URL` — database connection URL (required)
- `SCORING_API_BASE` — scoring service base URL (default `http://localhost:8000`)
- `JWT_SECRET` — JWT signing secret (default `change_me`)
- `JWT_ALG` — JWT algorithm (default `HS256`)
- `JWT_EXPIRE_MIN` — JWT expiry in minutes (default `480`)
- `ADMIN_BOOTSTRAP_KEY` — optional bootstrap admin key

Create a `.env` file in `loan_system_backend/` with the values you need, for example:

```
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/loans
JWT_SECRET=supersecret
APP_PORT=9000
```

## Setup & Run

Backend (Windows example):

```powershell
cd "loan_system_backend"
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python -m app.main
```

Notes:
- The backend uses Sanic (`app/main.py`). If you prefer, run with a process manager or container.

Frontend:

```bash
cd "loan-system-frontend"
npm install
npm run dev
```

Open the frontend dev server (Vite) in your browser (usually http://localhost:5173).

## Development notes

- API origin is allowed for `http://localhost:----` in the backend CORS config (adjust as needed).
- Backend routes are registered under `loan_system_backend/app/routes/`.
- Frontend source is under `loan-system-frontend/src/`.

## Contributing

1. Create a branch for your change.
2. Run tests and linters locally (none included by default).
3. Open a PR with a clear description.


