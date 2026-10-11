# DevPilot AI — Requirements Audit (Phase 0)

Status legend: `[ ]` not started · `[~]` partial · `[x]` implemented AND tested.
Nothing is marked complete without evidence (passing tests / verified behavior).

Priority order: Reliability > Security > Correctness > Data Integrity > Verification > Explainability > Maintainability > Scalability > Automation > Performance > UI Polish.

## Phase map

| Phase | Scope | Status |
|---|---|---|
| 0 | Requirements audit, architecture, schema design | In progress |
| 1 | Backend foundation (NestJS, PostgreSQL, Prisma, Redis, config, logging, errors, health, Docker) | Code written, UNVERIFIED (not run) |
| 2 | Auth, sessions/JWT, RBAC, workspace membership | Not started |
| 3 | Workspaces, projects, tasks, issues, comments, audit logs | Not started |
| 4 | Project import (ZIP/Git), safe extraction, scan jobs | Not started |
| 5 | Code intelligence (AST, symbols, graph, search) | Not started |
| 6 | AI provider abstraction, usage tracking, agent sessions, orchestrator | Not started |
| 7 | Tool registry, permissions, approvals, file tools, terminal, Docker sandbox | Not started |
| 8 | Code modification, diff/patch, testing, verification, debugging, rollback | Not started |
| 9 | Git engine, PR preparation, webhooks | Not started |
| 10 | Security, dependency, API, DB analysis, code review, performance | Not started |
| 11 | RAG, embeddings, pgvector, project memory | Not started |
| 12 | Specialized agents | Not started |
| 13 | Health, reports, analytics, audit trails | Not started |
| 14 | Realtime (SSE/WS), notifications | Not started |
| 15 | CI/CD, deployment readiness, monitoring, AI evaluation | Not started |
| 16 | Frontend (only against real APIs) | Not started |

## Master checklist

- [ ] Authentication
- [ ] Authorization
- [ ] RBAC
- [ ] Users
- [ ] Workspaces
- [ ] Teams
- [ ] Projects
- [ ] Repository import
- [ ] Project scanning
- [ ] File indexing
- [ ] Code intelligence
- [ ] Tasks
- [ ] Issues
- [ ] AI provider
- [ ] Agent orchestrator
- [ ] Agent sessions
- [ ] Tool registry
- [ ] File tools
- [ ] Terminal
- [ ] Docker sandbox
- [ ] Testing
- [ ] Debugging
- [ ] Code modification
- [ ] Verification
- [ ] Git
- [ ] Pull requests
- [ ] Security
- [ ] Dependencies
- [ ] API analysis
- [ ] Database analysis
- [ ] RAG
- [ ] Embeddings
- [ ] Project memory
- [ ] Documentation
- [ ] Performance
- [ ] Project health
- [ ] Reports
- [ ] Audit logs
- [ ] Notifications
- [ ] Realtime
- [ ] Analytics
- [ ] AI cost tracking
- [ ] CI/CD
- [ ] Deployment readiness
- [ ] Monitoring
- [ ] Frontend integration
- [ ] Automated testing

## Cross-cutting rules (apply to every phase)

1. No fake functionality. Unimplemented capability returns `NOT_IMPLEMENTED` / `UNAVAILABLE` with explanation.
2. Backend first; frontend only in Phase 16, consuming real APIs.
3. Authorization enforced on the backend for every protected operation (user → workspace → project → role → permission).
4. Strict project/workspace data isolation (files, sessions, tasks, issues, memory, embeddings, reports, audit logs, health).
5. AI output is never executed directly: schema validation → policy → permission → risk → approval → execution.
6. Repository content is untrusted input (prompt-injection safe); tool permissions come only from backend policy.
7. Agent limits: maxSteps, maxToolCalls, maxRuntime, maxCost, maxRetries → `AGENT_LIMIT_REACHED`.
8. Commands only inside Docker sandbox; no host execution, no Docker socket exposure.
9. Secrets never exposed in APIs, logs, audit logs, or reports.
10. Consistent API envelope (`success/data/meta` and `success/error{code,message,requestId}`), `/api/v1`, allow-listed sorting, cursor pagination.
11. Every phase ends with the implementation gate: tests, lint, typecheck, build, migrations, API behavior, security, authz, error handling, docs, checklist update, remaining problems.

## Phase 1 plan (next)

- Monorepo: `apps/api` (NestJS), `packages/shared-types`, `docker/`, `database/`.
- Config module with validated env (Zod), `.env.example`.
- Prisma + PostgreSQL, Redis connection, BullMQ wiring.
- Pino logging, request/correlation IDs, global exception filter, response envelope.
- Helmet, CORS, rate limiting (throttler), URI versioning, Swagger.
- `/health`, `/health/live`, `/health/ready` with real DB/Redis checks.
- Graceful shutdown, `docker-compose.yml` (api, postgres+pgvector, redis).
- Jest + Supertest foundation tests.

## Known constraint of this environment

The current Claude chat sandbox has network access disabled, so `npm install`, Prisma migrations, Docker, and test runs cannot be executed here. Code written here would be **unverified** until run locally. For real verification (Implementation Gate), run the project with Claude Code on your machine.
