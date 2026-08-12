<div align="center">
  <h1>IIITL Connect</h1>
  <p><strong>The definitive Campus OS for the Indian Institute of Information Technology, Lucknow (IIITL)</strong></p>
  <br />
  
  <p>
    <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
    <img src="https://img.shields.io/badge/Turborepo-EF4444?style=for-the-badge&logo=turborepo&logoColor=white" alt="Turborepo" />
  </p>
</div>

<hr />

## 🚀 Overview

IIITL Connect is designed to unify and elevate the student experience by bridging the gap between academics, technical societies, networking, and placements. It serves as a centralized digital hub, enforcing strict access controls to ensure a safe, exclusive environment for students, alumni, and faculty.

## ✨ Comprehensive Feature Suite

### 💻 Axios (Technical Society)
**Axios** is the official technical society of IIITL, driving innovation across various technical domains. The platform includes a dedicated Axios Hub:
- **Dedicated Wings**: Specialized divisions including Competitive Programming (CP), Web Development, FOSS, Web3, InfoSec, App Dev, Design, and Machine Learning (ML).
- **Leadership Tracking**: View Overall Coordinators and Wing Executives.
- **Integrated Events**: Track all technical events and hackathons hosted by each specific wing.

### 🎭 Campus Clubs & Societies
| Feature | Description |
| :--- | :--- |
| **Club Directory** | Explore official non-technical clubs and student organizations. |
| **Member Rosters** | View current club members, leads, and portfolios. |
| **Club Resources** | Access specific assets or materials shared by the club. |

### 🎓 Placements & Career Hub
| Feature | Description |
| :--- | :--- |
| **Interview Experiences** | Read and share in-depth interview experiences, filterable by company, role, and difficulty. |
| **OA Question Bank** | A collaborative database of Online Assessment (OA) coding questions tagged by company, difficulty, and topics. |
| **Resume Reviews** | Submit resumes for peer review. Eligible seniors can provide detailed feedback and rate resumes (1-10 scale), with full edit/delete capabilities. |
| **Off-Campus Tracker** | Track and share external job openings, hackathons, and internships with automated deadline tracking. |

### 📅 Campus Events
- **Centralized Calendar**: A dedicated space for discovering all upcoming campus events, technical hackathons, and cultural fests.
- **Role-Based Access**: Authorized users can create, manage, and promote new events.

### 💬 Anonymous Chat (Confessions)
- **Secure Textboard**: A fully anonymous space for open campus discussions and confessions.
- **Random Identities**: Auto-generated pseudo-anonymous identities (e.g., *Anonymous Tiger*) to maintain privacy while allowing threaded conversations.
- **Reactions & Replies**: Upvote/downvote support and nested threaded replies.

### 🤝 Connections (Networking)
| Feature | Description |
| :--- | :--- |
| **Student Profiles** | Detailed public profiles showcasing enrollment year, branch, GitHub, and LinkedIn links. |
| **Connection Matching** | A sleek swipe interface to discover and connect with peers and alumni based on shared interests. |
| **Direct Messaging** | Securely chat directly with your mutual connections. |
| **Trust & Safety** | Robust block and report functionality to maintain a healthy community. |

### 🏪 Marketplace
- **Marketplace & Lost/Found**: A dedicated space to buy, sell, or trade items (books, electronics) and post Lost & Found notices. Includes integrated messaging for listings.

### 📚 Academics & Resources
- **Resource Library**: A structured repository for sharing and downloading study materials, lecture notes, and past year papers, organized by semester and course.
- **Collaborative Notes**: Wiki-style notes with full revision history tracking.

---

## 🏗 Architecture & Tech Stack

IIITL Connect utilizes a highly scalable, serverless cloud architecture tailored to modern development standards, managed within a **Turborepo** monorepo workspace.

### Frontend (`apps/web`)
- **Framework**: Next.js 15 (App Router), React 19
- **Styling**: Tailwind CSS with a custom vibrant, premium dark-mode aesthetic featuring heavy glassmorphism, micro-animations, bespoke scrollbars, and rich pastel gradients.

### Backend Engine (`apps/api`)
- **Framework**: NestJS
- **Design Pattern**: Strict Clean Architecture (Modules, Controllers, Services, Repositories).
- **Security**: Custom AuthGuards and Decorators for route protection.

### Database & Infrastructure
- **Database (`packages/database`)**: Neon Serverless Postgres, managed via Prisma ORM with automated connection pooling.
- **Object Storage**: Cloudflare R2 (for avatars, resumes, event posters, and marketplace images).
- **Authentication**: Better Auth with strict Google OAuth enforcement (`hd: "iiitl.ac.in"`).

---

## 💻 Local Development Setup

To run IIITL Connect locally, ensure you have `Node.js (v20+)`, `pnpm`, and `PostgreSQL` installed.

1. **Clone the repository**
   ```bash
   git clone https://github.com/parthbadgire-code/iiitl-connect.git
   cd iiitl-connect
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Variables**
   Create `.env` files in both `apps/web` and `apps/api` (refer to `.env.example` if available) and ensure you have the required keys for Neon Postgres, Better Auth, Google OAuth, and Cloudflare R2.

4. **Database Setup**
   Push the Prisma schema to your local database:
   ```bash
   pnpm --filter database db:push
   ```

5. **Start the Development Servers**
   Start both the Next.js web application and the NestJS API engine simultaneously using Turborepo:
   ```bash
   pnpm dev
   ```
   - **Web App**: `http://localhost:3000`
   - **API Engine**: `http://localhost:3001`

<br />
<div align="center">
  <sub>Developed with ❤️ by Parth for the IIITL community.</sub>
</div>
