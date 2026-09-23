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

Discover is **same-gender only**, and people/rooms near the viewer’s **tech park** rank first.

| Email | Role | Office | Notes |
| --- | --- | --- | --- |
| arjun@fmr.test | Needs a room | RMZ Ecoworld | Already matched with Pankaj (chat ready) |
| pankaj@fmr.test | Has Bellandur PG room | RMZ Ecoworld | Incoming interest from Rohan |
| priya@fmr.test | Needs a room | ITPL | Already matched with Meera |
| meera@fmr.test | Has Whitefield apartment | ITPL | Women-only listing |
| vivek@fmr.test | Needs a room | Cessna | Phone not verified; liked Arjun |

Suggested demo:

1. Sign in as `arjun@fmr.test`.
2. Open Discover → People. Ecoworld / Cessna / TechVillage men should appear first. Whitefield and Electronic City men later. No women.
3. Open Matches — chat with Pankaj is already unlocked. Vivek sits under incoming interest.
4. Sign in as `priya@fmr.test` to see the women-only Whitefield ranking.
5. Contact stays hidden until a match; first 3 matches unlock phone/email, then Premium.

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
