# AI IDE Platform

Monorepo scaffold for a SaaS AI-powered coding IDE with:

- Next.js frontend
- NestJS backend
- Prisma + PostgreSQL
- Redis-backed job/runtime hooks
- Docker sandbox worker
- Shared DTO/contracts package

## Apps

- `apps/web`: Next.js App Router frontend
- `apps/api`: NestJS API
- `apps/sandbox-worker`: isolated execution worker
- `packages/shared`: shared types and contracts

## Run

1. Copy `.env.example` to `.env`
2. Start infra with Docker Compose
3. Install dependencies with `pnpm install`
4. Run `pnpm db:generate`
5. Run `pnpm dev`

## Notes

This is a production-oriented foundation, not a single-file demo. The core domain model, API skeleton, editor shell, usage schema, and sandbox wiring are in place for iterative expansion.

