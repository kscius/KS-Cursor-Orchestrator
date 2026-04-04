---
name: nodejs-backend-patterns
description: Build production-ready Node.js backend services with Express/Fastify, implementing middleware patterns, error handling, authentication, database integration, and API design best practices. Use when creating Node.js servers, REST APIs, GraphQL backends, or microservices architectures.
---

# Node.js Backend Patterns

## When to Use This Skill

- Building REST APIs or GraphQL servers
- Creating microservices with Node.js
- Implementing authentication and authorization
- Designing scalable backend architectures
- Setting up middleware and error handling
- Integrating databases (SQL and NoSQL)
- Building real-time applications with WebSockets
- Implementing background job processing

## Key Principles

**Structure:** Separate transport (HTTP layer) from business logic; keep auth, validation, and domain rules in clear layers.

**Validation:** Validate inputs at the boundary with Zod or class-validator; never trust upstream callers.

**Errors:** Named error types per domain; never swallow errors silently; consistent response shapes.

**Database:** Parameterized queries only; transactions for multi-step mutations; paginate unbounded reads; migrations for schema changes.

**Auth:** Verify authentication before authorization; short-lived tokens; validate scope/audience/expiry on every request.

**Background jobs:** Design for idempotency (safe to retry); log start/success/failure; use dead-letter queues for critical jobs.

**Observability:** Structured JSON logging with correlation IDs; P50/P95/P99 latency metrics; error-rate alerts.

## Framework Quick Reference

| Framework | Use when |
|-----------|----------|
| Express.js | Flexibility needed, large ecosystem of middleware |
| Fastify | High throughput, structured logging built-in, schema validation |
| NestJS | Enterprise, large team, strong DI and module conventions |

## Detailed Patterns

For complete code examples covering all patterns below, read `REFERENCE.md` in this directory:

- **Core Frameworks** — Express setup, Fastify setup, NestJS module structure
- **Architectural Patterns** — Layered architecture, Repository pattern, CQRS, Event-driven
- **Middleware Patterns** — Rate limiting, request validation, correlation IDs, caching middleware
- **Error Handling** — Custom error classes, global error middleware, async error propagation
- **Database Patterns** — Connection pooling, query builders, transaction management, migrations
- **Authentication & Authorization** — JWT validation, session management, RBAC, API key auth
- **Caching Strategies** — Redis caching, cache invalidation, cache-aside pattern
- **API Response Format** — Consistent envelope shape, pagination, error response format
- **Testing Patterns** — Unit tests for services, integration tests for routes, test containers

## Execution

1. Read `REFERENCE.md` for the specific pattern(s) needed
2. Follow existing repo conventions before introducing new patterns
3. Validate: lint + typecheck + targeted tests before declaring done
