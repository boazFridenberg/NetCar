# NetCar 🚗

> A production-grade platform for exploring brand-new Israeli vehicles (2025–2026), with a precise **cost-of-ownership calculator**, smart catalog, and side-by-side comparison.

NetCar pulls **real-time vehicle data** from the Israeli Ministry of Transportation (data.gov.il) and enriches it with high-quality press imagery, then helps drivers understand what a car *actually* costs to own.

---

## 🏛 Architecture

This is a monorepo split into two decoupled apps:

```text
NetCar/
├── server/        # Node.js + Express + TypeScript REST API
└── client/        # React + TypeScript + Tailwind CSS SPA
```

### Tech Stack

| Layer        | Technology                                                   |
| ------------ | ------------------------------------------------------------ |
| Frontend     | React, TypeScript, Tailwind CSS, Lucide React, React Router  |
| Backend      | Node.js, Express, TypeScript                                 |
| Persistence  | In-memory repository pattern (swappable for SQLite/Mongo)    |
| Auth         | Split JWT (short-lived access + rotating refresh token)      |
| External API | data.gov.il (MoT registry), Google/Bing Image Search         |

---

## 🚀 Getting Started

### 1. Backend

```bash
cd server
cp .env.example .env      # fill in your API keys
npm install
npm run dev               # starts on http://localhost:3002
```

### 2. Frontend

```bash
cd client
npm install
npm run dev               # starts on http://localhost:5173
```

---

## 🔐 Environment

See [`server/.env.example`](./server/.env.example) for all required configuration.
The app degrades gracefully: if image-search keys are absent, it falls back to
locally hosted silhouette imagery so the UI is **never broken**.

---

## 📦 API Surface (high level)

| Method | Route                          | Description                            |
| ------ | ------------------------------ | -------------------------------------- |
| POST   | `/api/auth/register`           | Create account                         |
| POST   | `/api/auth/login`              | Login → access + refresh tokens        |
| POST   | `/api/auth/refresh`            | Rotate refresh → new access token      |
| POST   | `/api/auth/logout`             | Invalidate refresh token               |
| GET    | `/api/vehicles`                | Paginated catalog (2025–2026 only)     |
| GET    | `/api/vehicles/:id`            | Vehicle detail                         |
| POST   | `/api/calculator/estimate`     | Cost-of-ownership breakdown            |
| GET    | `/api/admin/stats`             | Admin analytics (protected)            |

---

## 📄 License

Proprietary — © NetCar. All rights reserved.
