# Alaya

A Bengaluru-focused shared-living platform. Someone with a spare room can find a compatible, verified roommate. Someone looking for affordable accommodation can find that room and chat safely after a mutual match.

## Stack

- **Web:** Next.js, TypeScript, Tailwind
- **API:** Nest.js modular monolith, Prisma, Socket.IO
- **Data:** PostgreSQL, Redis, MinIO
- **Run:** Docker Compose

## Start everything

```bash
docker compose up --build
```

- Web: http://localhost:3000
- API: http://localhost:4000/health
- MinIO console: http://localhost:9001 (`minio` / `minio12345`)
- Object storage image: `quay.io/minio/minio`

## Seeded walkthrough

Password for every seed account: `Password123!`

| Email | Role | Locality |
| --- | --- | --- |
| pankaj@fmr.test | Has a Bellandur PG room (₹10,000 contribution) | Bellandur |
| arjun@fmr.test | Needs a room | Bellandur |
| rahul@fmr.test | Has an HSR apartment room | HSR |
| priya@fmr.test | Needs a room | Whitefield / HSR |
| vivek@fmr.test | Needs a room | Bellandur |

Suggested demo:

1. Sign in as `arjun@fmr.test`.
2. Open Discover → People. Pankaj should rank high, with reasons (same locality, similar budget, similar sleep).
3. Open Pankaj, tap **Interested**.
4. Sign out, sign in as `pankaj@fmr.test`, open Matches / incoming interest, tap **Interested**.
5. Chat opens. Phone numbers and the exact PG address stay hidden.

Phone OTP in local/dev: request any valid 10-digit Indian mobile and enter `123456`. The code is also printed in the API logs.

## Local development without rebuilding images

```bash
docker compose up postgres redis minio
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev:api
npm run dev:web
```

## What this slice includes

Authentication (email + mock phone OTP), progressive onboarding, room listings, People/Rooms discovery, deterministic compatibility scoring with explanations, one-way interest → mutual match, Socket.IO chat, and block.

Out of scope: admin dashboard, KYC, payments, flatmate groups, push/email notifications.
