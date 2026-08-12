# Contributing to IIITL Connect

First off, thank you for considering contributing to IIITL Connect! This platform relies on the contributions of open-source developers from our campus.

## Turborepo Architecture

This project is a monorepo managed by [Turborepo](https://turbo.build/repo/docs) and utilizes `pnpm` as its package manager.

### Apps and Packages

- `apps/web`: The Next.js 15 web application.
- `apps/api`: The NestJS API.
- `packages/ui`: Shared UI components using Tailwind CSS and shadcn/ui.
- `packages/config`: Shared `eslint` and `prettier` configurations.
- `packages/database`: Prisma schema and database utility exports.
- `packages/types`: Shared Zod validation types.

## Local Setup

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd iiitl-connect
   ```

2. **Install Dependencies:**
   Make sure you have `pnpm` installed (`npm install -g pnpm`), then run:
   ```bash
   pnpm install
   ```

3. **Database Configuration:**
   - Ask a Web Wing maintainer for the development database credentials or setup your own local Neon Postgres instance.
   - Copy `.env.example` to `.env` in `apps/api` and `packages/database`.
   - Run `pnpm prisma generate` in `packages/database`.

4. **Start Development Server:**
   ```bash
   pnpm run dev
   ```

## Commit Guidelines
We use `husky` and `lint-staged` to ensure code formatting (Prettier) and linting (ESLint) are enforced on every commit. Make sure your code is cleanly formatted before pushing!

Happy coding! 🚀
