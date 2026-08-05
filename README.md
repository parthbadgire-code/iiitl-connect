# IIITL Connect

Welcome to **IIITL Connect**, the exclusive, serverless community platform for the Indian Institute of Information Technology, Lucknow (IIITL).

## Architecture Overview

IIITL Connect utilizes a highly scalable, serverless cloud architecture tailored to modern development standards, managed within a Turborepo monorepo.

### Tech Stack
- **Web App (`apps/web`)**: Next.js 15 (App Router, React 19)
- **API Engine (`apps/api`)**: NestJS (Strict Clean Architecture)
- **Database (`packages/database`)**: Neon Postgres, managed via Prisma ORM (with connection pooling)
- **Caching & KV Storage**: Upstash Redis
- **Object Storage**: Cloudflare R2
- **Authentication**: Better Auth with strict Google OAuth enforcement (`hd: "iiitl.ac.in"`)

### Serverless Split (Next.js + NestJS)
We employ a clear separation of concerns by splitting the frontend (Next.js) and the backend API (NestJS). 
- **Next.js** handles the user interface, routing, and SSR/SSG.
- **NestJS** enforces strict Clean Architecture principles (Modules, Controllers, Services, Repositories) for scalable and robust business logic processing, serving as the core API endpoint.

## Exclusive Campus Nature
This platform is built exclusively for the IIITL community. It enforces authentication strictly to users logging in with a valid `@iiitl.ac.in` Google Workspace account. Guest access is heavily restricted, and role-based access control (Guest, Student, Club Admin, Faculty, Super Admin) dictates platform capabilities.

---
Maintained with ❤️ by the IIITL Web Wing.
