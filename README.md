# KrishiDrishti – Intelligent Farming Assistant

KrishiDrishti is a production-ready, full-stack web application designed to empower farmers with real-time analytics, alerts, and policy assistance.

---

## Technical Architecture

- **Frontend**: React (Vite), Tailwind CSS, React Router, Recharts, Lucide Icons, Web Speech API (transcription & text-to-speech).
- **Backend**: Node.js, Express.js, MongoDB Atlas (Mongoose), JWT, Socket.io (real-time alerts).

---

## Directory Layout

```
client/          # React SPA (Vite + Tailwind)
server/          # Express API server (MVC layout)
package.json     # Workspace coordinator
```

---

## Setup & Startup Instructions

### 1. Environment Configurations

#### Backend (`server/`)
Create a `.env` file under the `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key

# Optional integrations (Automatic fallback to local if blank)
EMAIL_USER=
EMAIL_PASS=
GEMINI_API_KEY=
```

---

### 2. Launching the Project

#### Install Dependencies
At the workspace root, run:
```bash
npm run install:all
```
This script will concurrently install dependencies in the root, `server/`, and `client/` directories.

#### Run Frontend & Backend Concurrently
From the workspace root, run:
```bash
npm run dev:all
```
- Frontend will load on [http://localhost:3000](http://localhost:3000)
- Express API server will listen on port `5000`

---

## Demo Administrator Credentials
Upon database connection, the system automatically checks for admin profiles. If none exist, it seeds:
- **Email**: `admin@agrismart.com`
- **Password**: `adminpassword`
Use this login under the **Admin Access** link in the footer to manage schemes, users, and broadcast warning messages.
