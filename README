Tutorize — Educational platform
===============================================

## Structure

- Backend: NestJS (TypeScript) API with Prisma ORM, Prisma schema in `backend/prisma/schema.prisma`.
- Frontend: React + Vite (TypeScript) UI in `frontend/`.
- Tests: 
  - Integration tests in `integration-test/` (Postman collection + Newman runner)
  - Load & performance tests in `load-test/` (k6 scripts)
- Infrastructure: Dockerfile(s) under `backend/` and GitHub Actions workflows for CI/CD.

## Summary

- Backend: NestJS 10, Postgres (Prisma), JWT auth, Passport, Socket.IO, Puppeteer for PDF generation.
- Frontend: React 19, Vite, Tailwind, React Router, SWR, i18n.
- Hosting: AWS Amplify (frontend) + Amazon EC2 (backend) with Route 53 DNS management.
- Storage & Integrations: S3 (AWS SDK), Cloudinary, SendGrid.
- Testing: Postman + Newman (integration), k6 (load/performance), OWASP ZAP (security scanning).
- CI/CD: GitHub Actions (sequential workflow: performance-security-scan → production-deploy)

## Architecture (high level)

### AWS Infrastructure Architecture

```
      Users
        ↓
    [Route 53] (DNS Management)
        ↓
    ┌─────────────────────────────────────┐
    │          AWS Amplify                 │
    │    Frontend (React + Vite)          │
    │    - Global CDN distribution        │
    │    - Automatic deployments          │
    │    - SSL/TLS certificates           │
    └──────────────────┬──────────────────┘
                       │ HTTPS/WebSocket
                       ↓
    ┌─────────────────────────────────────┐
    │            Amazon EC2               │
    │        Backend (NestJS API)         │
    │                                     │
    │  ┌─────────────────────────────────┐ │
    │  │       Application Layer        │ │
    │  │  ┌─────────────┬─────────────┐ │ │
    │  │  │  Auth/JWT   │   Socket.IO │ │ │
    │  │  └─────────────┴─────────────┘ │ │
    │  │  ┌─────────────┬─────────────┐ │ │
    │  │  │   Modules   │   Services  │ │ │
    │  │  │ (Quiz,User, │ (Prisma,    │ │ │
    │  │  │  Exercise)  │  Puppeteer) │ │ │
    │  │  └─────────────┴─────────────┘ │ │
    │  └─────────────────────────────────┘ │
    │                                     │
    │  ┌─────────────────────────────────┐ │
    │  │       Database Layer           │ │
    │  │         PostgreSQL             │ │
    │  │       (via Prisma ORM)         │ │
    │  └─────────────────────────────────┘ │
    └──────────────────┬──────────────────┘
                       │
          ┌────────────┼────────────┐
          │            │            │
          ↓            ↓            ↓
    ┌─────────────┐ ┌─────────┐ ┌─────────────┐
    │   Amazon    │ │ SendGrid│ │ Cloudinary  │
    │     S3      │ │ (Email) │ │  (Images)   │
    │ (File Store)│ └─────────┘ └─────────────┘
    └─────────────┘
```

### Data Flow

1. **User Access**: Users access the application through Route 53 DNS, which routes traffic to AWS Amplify
2. **Frontend Delivery**: Amplify serves the React application with global CDN for optimal performance
3. **API Communication**: Frontend communicates with NestJS API on EC2 via HTTPS/WebSocket
4. **Authentication**: JWT-based authentication with role-based access (TEACHER/STUDENT)
5. **Real-time Features**: Socket.IO enables real-time notifications and live features
6. **File Storage**: S3 for document storage, Cloudinary for image processing
7. **Email Services**: SendGrid handles notifications and reports
8. **PDF Generation**: Puppeteer running on EC2 generates PDFs for exercises and quizzes

### CI/CD Pipeline

```
		GitHub Repository
        		↓
		Performance & Security Scan
	(k6 load tests + ZAP security scan)
        		↓
		If scan succeeds
        		↓
		Production CI/CD
    ┌─────────────────────────────────────┐
    │         GitHub Actions              │
    │                                     │
    │  1. Build Docker image              │
    │  2. Run integration tests           │
    │  3. Push image to Docker Hub        │
    │  4. SSH deploy to EC2               │
    │  5. Run database migrations         │
    │  6. Start production container      │
    └──────────────────┬──────────────────┘
                       │
                       ↓
    ┌─────────────────────────────────────┐
    │            Amazon EC2               │
    │      Production Environment         │
    │  - Docker container orchestration   │
    │  - Environment variable management  │
    │  - SSL/TLS termination             │
    └─────────────────────────────────────┘
```

## Tech stack

| Layer | Technology (primary) | Notes |
|-------|----------------------|-------|
| Frontend Hosting | AWS Amplify | Global CDN, automatic deployments, SSL certificates, branch-based environments |
| Backend Hosting | Amazon EC2 | Docker container deployment, auto-scaling capabilities, security groups |
| DNS Management | Amazon Route 53 | Domain routing, health checks, DNS failover |
| Backend framework | NestJS 10 | Modular controllers/services, global validation pipe, Swagger at `/api/docs` |
| ORM / DB | Prisma + PostgreSQL | `backend/prisma/schema.prisma` describes domain models (User, Quiz, Exercise, Document, IELTS, Submissions) |
| Auth | JWT, Passport | `@nestjs/jwt`, `passport-jwt` used for auth and role-based access (Role: TEACHER/STUDENT) |
| Frontend | React 19 + Vite | `frontend/src` with contexts, hooks, and pages; i18n configured (`frontend/src/i18n`) |
| Real-time | Socket.IO | For notifications / live features |
| File processing | Puppeteer, sharp | PDF generation and image processing |
| Storage | AWS S3 (SDK), Cloudinary | File uploads/document hosting |
| Email | SendGrid | For notifications and reports |
| Testing | Jest, Supertest, Postman/Newman | Unit, e2e, and integration testing in CI |

## Key features

- Authentication & Authorization: JWT tokens, `auth` module, protected routes.
- Users: listing, stats, roles (teacher/student), profile.
- Quizzes: create/manage quizzes, questions, submissions, grading, statistics.
- Exercises: create/manage exercises, student submissions, file attachments.
- Documents: upload and serve document library (PDFs, presentations, etc.).
- IELTS modules: Reading and Writing tests, teacher review workflows, AI/human scoring structure for writing.
- PDF generation: endpoints to render exercise/quiz PDFs (uses Puppeteer).
- Uploads: S3/Cloudinary integration, file metadata management.

## Project layout

- `backend/` - NestJS application
	- `src/main.ts` - app bootstrap, Swagger, global pipes, middleware
	- `src/app.module.ts` - module composition (Auth, Users, Quiz, Exercise, Document, IELTS, PDF)
	- `prisma/schema.prisma` - DB schema and domain models
	- `scripts/` - helper scripts (seed, drop-db)
	- `Dockerfile` - container image for backend
- `frontend/` - React + Vite app
	- `src/` - App, pages, components, contexts, hooks
	- `vite.config.ts` - Vite configuration (if present)
- `integration-test/` - Production-safe API integration tests
	- `postman_collection.json` - Postman collection (Newman runnable)
	- `postman_environment.json` - Postman environment variables
- `load-test/k6/` - Performance and load testing
	- `load-test.js` - k6 load test script
- `.github/workflows/` - GitHub Actions CI/CD
 	- `performance-security.yml` - Performance and security checks (k6, ZAP)
	- `cicd_prd.yml` - Production CI/CD pipeline (build, integration test, push, deploy)


## Developer local quickstart

Prerequisites: Node.js (>=18), pnpm/npm, Docker (for simulating production), PostgreSQL (or a remote DB), and `npx`.

Backend (from `backend/`):

```powershell
cd backend
npm install
# build
npm run build
# run dev
npm run start:dev
```

Frontend (from `frontend/`):

```powershell
cd frontend
npm install
npm run dev
```

Database & Prisma:

```powershell
cd backend
# run migrations from fresh
npm run migrate:fresh
# or push (non-migration) schema
npm run migrate
# seed test data
npm run seed
```

API docs (after backend started):
- Swagger UI: `http://localhost:3000/api/docs`

Environment variables (important)
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET`, `JWT_EXPIRES_IN` - auth config
- `AWS_S3_*`, `CLOUDINARY_*` - file storage
- `SENDGRID_API_KEY` - email
- `PORT` - server port

See `.github/workflows/deploy.yml` for an example `test.env` assembled during CI (read-only production DB usage for tests).

## Testing

- **End-to-end / production-safe API tests**: Postman collection in `integration-test/postman_collection.json`.

- **Load & performance testing**: k6 scripts in `load-test/load-test.js`.

- **CI uses GitHub Actions** to build a Docker image, run it (with a read-only production DB URL supplied via secrets), wait for health to pass, then run Newman tests. Failing assertions cause the job to fail and upload `newman-results.json` as an artifact.

## CI/CD pipeline

The CI/CD pipeline consists of two GitHub Actions workflows that run sequentially:

### 1. Performance and Security Scan (`.github/workflows/performance-security.yml`)
Runs performance and security tests before deployment:

1. Checkout repository.
2. Build Docker image for the backend using `backend/Dockerfile` (tag: `tutorize-backend:perf`).
3. Start a test container exposing the API on `localhost:3000`.
4. Wait and poll the `/api/v1/health` endpoint until ready.
5. Run k6 load tests with configurable VUs and duration, output JSON results.
6. Upload k6 results as artifacts.
7. Run OWASP ZAP baseline security scan using GitHub Action.
8. Upload ZAP security report as artifacts (JSON, HTML, Markdown, ZIP).
9. Stop test container.

**Triggers**: Manual dispatch or push to `master`.

### 2. Production CI/CD (`.github/workflows/deploy.yml`)
The main deployment pipeline that runs after performance-security scan completes successfully:

1. Checkout repository.
2. Build Docker image for the backend using `backend/Dockerfile` (tag: `tutorize-backend:test`).
3. Prepare a `test.env` file in the runner with important production-like environment variables (in CI this pulls values from GitHub Secrets such as `PROD_DATABASE_URL`, `JWT_SECRET`, `TEST_USER_*`). The workflow intentionally uses `READ_ONLY_MODE=true` for safety when pointing at production DB.
4. Start a test container exposing the API on `localhost:3001`.
5. Wait and poll the `/api/v1/health` endpoint until ready (with retry loop).
6. Install Newman and run the Postman collection from `integration-test/` against the running container. The workflow exports `newman-results.json` and uploads it as an artifact.
7. If tests pass, build and push the Docker image to Docker Hub, then SSH to EC2 and deploy (pull image, run migrations, start container).

**Triggers**: Completion of performance-security workflow (sequential execution).

### Workflow Sequence

```
Push to master
    ↓
Performance and Security Scan
(k6 load tests + ZAP security scan)
    ↓
If scan succeeds
    ↓
Production CI/CD
(integration tests + build + deploy)
```

## License

Copyright (c) 2025 An Nguyen. All Rights Reserved.

---

