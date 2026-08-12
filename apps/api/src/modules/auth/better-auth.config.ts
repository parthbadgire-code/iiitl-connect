import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { DatabaseService } from '../database/database.service';

// ─── Axios roster for auto-linking ────────────────────────────────────────────
const AXIOS_ROSTER: Record<string, { name: string; role: 'COORDINATOR' | 'SENIOR_MEMBER' }[]> = {
  'axios-foss': [
    { name: 'Shivansh Jain', role: 'COORDINATOR' },
    { name: 'Kinshuk', role: 'COORDINATOR' },
    { name: 'Aryan Singh', role: 'SENIOR_MEMBER' },
    { name: 'Naman Khandelwal', role: 'SENIOR_MEMBER' },
    { name: 'Merin Theres Jose', role: 'SENIOR_MEMBER' },
    { name: 'Anirudh Singh Rajora', role: 'SENIOR_MEMBER' },
    { name: 'Venella', role: 'SENIOR_MEMBER' },
  ],
  'axios-cp': [
    { name: 'Avinash Singh', role: 'COORDINATOR' },
    { name: 'Ayush Verma', role: 'COORDINATOR' },
    { name: 'Shreyansh Jain', role: 'SENIOR_MEMBER' },
    { name: 'Parth Vijay', role: 'SENIOR_MEMBER' },
    { name: 'Parteek Babbal', role: 'SENIOR_MEMBER' },
    { name: 'Md Anas Ali Usmani', role: 'SENIOR_MEMBER' },
    { name: 'Surendra', role: 'SENIOR_MEMBER' },
    { name: 'Aditya Chandak', role: 'SENIOR_MEMBER' },
    { name: 'Vansh Tomar', role: 'SENIOR_MEMBER' },
  ],
  'axios-ml': [
    { name: 'Vennela', role: 'COORDINATOR' },
    { name: 'Nischal Chandel', role: 'COORDINATOR' },
    { name: 'Rushil Dhingra', role: 'SENIOR_MEMBER' },
    { name: 'Arushi', role: 'SENIOR_MEMBER' },
    { name: 'Ravi Kumar', role: 'SENIOR_MEMBER' },
    { name: 'Sanjana', role: 'SENIOR_MEMBER' },
  ],
  'axios-infosec': [
    { name: 'Varun Baisane', role: 'COORDINATOR' },
    { name: 'Aaryan Dadu', role: 'COORDINATOR' },
    { name: 'Anirudh Singh Rajora', role: 'SENIOR_MEMBER' },
    { name: 'Jay Parashar', role: 'SENIOR_MEMBER' },
    { name: 'Soumaditya Masanta', role: 'SENIOR_MEMBER' },
    { name: 'Dhanush Annam', role: 'SENIOR_MEMBER' },
  ],
  'axios-web': [
    { name: 'Divyanshu Singh', role: 'COORDINATOR' },
    { name: 'Naman Khandelwal', role: 'COORDINATOR' },
    { name: 'Vedant Kulkarni', role: 'SENIOR_MEMBER' },
    { name: 'Vaidik Saxena', role: 'SENIOR_MEMBER' },
    { name: 'Arham Kachhara', role: 'SENIOR_MEMBER' },
    { name: 'Shivansh Jain', role: 'SENIOR_MEMBER' },
    { name: 'Shreyansh Patil', role: 'SENIOR_MEMBER' },
  ],
  'axios-web3': [
    { name: 'Sumanth', role: 'COORDINATOR' },
    { name: 'Rohan', role: 'COORDINATOR' },
    { name: 'Janmesh Shewale', role: 'SENIOR_MEMBER' },
    { name: 'Kaustubh Goge', role: 'SENIOR_MEMBER' },
    { name: 'Ishaan Bansal', role: 'SENIOR_MEMBER' },
  ],
  'axios-design': [
    { name: 'Manas Srivastava', role: 'COORDINATOR' },
    { name: 'Md Mozammil Ali', role: 'COORDINATOR' },
    { name: 'Diya Anna Varghese', role: 'SENIOR_MEMBER' },
    { name: 'Diksha Narayan', role: 'SENIOR_MEMBER' },
    { name: 'Khushi Singh', role: 'SENIOR_MEMBER' },
    { name: 'Hansika Reddy', role: 'SENIOR_MEMBER' },
  ],
  'axios-app': [
    { name: 'Sandesh Raj', role: 'COORDINATOR' },
    { name: 'Naman Gulati', role: 'COORDINATOR' },
    { name: 'Krishan', role: 'SENIOR_MEMBER' },
    { name: 'Insha', role: 'SENIOR_MEMBER' },
    { name: 'Prabnoor', role: 'SENIOR_MEMBER' },
    { name: 'Md Anas Ali Usmani', role: 'SENIOR_MEMBER' },
  ],
};

const ROLE_MAP = {
  COORDINATOR: 'COORDINATOR' as const,
  SENIOR_MEMBER: 'SENIOR_MEMBER' as const,
};

/**
 * Fuzzy name match: normalise both strings (lowercase, collapse spaces)
 * and check if the roster name is fully contained in the user name or vice-versa.
 * Also handles single-word (first-name-only) roster entries like "Kinshuk".
 */
function nameMatches(userName: string, rosterName: string): boolean {
  const normalise = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
  const u = normalise(userName);
  const r = normalise(rosterName);
  if (u === r) return true;
  if (u.includes(r) || r.includes(u)) return true;
  if (!r.includes(' ') && u.startsWith(r)) return true;
  return false;
}

export const createBetterAuth = (prisma: DatabaseService) => {
  return betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3001/auth',
    database: prismaAdapter(prisma, {
      provider: 'postgresql',
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      },
    },
    trustedOrigins: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL,
    ].filter(Boolean) as string[],
    advanced: {
      crossSubDomainCookies: { enabled: false },
      defaultCookieAttributes: {
        sameSite: 'none',
        secure: true,
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!user.email.endsWith('@iiitl.ac.in')) {
              throw new Error('Access Denied: Only @iiitl.ac.in emails are allowed to join CampusOS.');
            }
            return { data: user };
          },
          after: async (user) => {
            // Auto-link Axios members on first sign-in based on name match
            if (!user.name) return;
            try {
              const matches: { slug: string; role: 'COORDINATOR' | 'SENIOR_MEMBER' }[] = [];

              for (const [slug, members] of Object.entries(AXIOS_ROSTER)) {
                for (const member of members) {
                  if (nameMatches(user.name, member.name)) {
                    matches.push({ slug, role: member.role });
                  }
                }
              }

              if (matches.length === 0) return;

              // Fetch matching clubs from DB
              const clubs = await prisma.club.findMany({
                where: { slug: { in: matches.map(m => m.slug) } },
                select: { id: true, slug: true },
              });

              // Upsert ClubMember records — non-fatal if any fail
              for (const match of matches) {
                const club = clubs.find(c => c.slug === match.slug);
                if (!club) continue;
                await prisma.clubMember.upsert({
                  where: { userId_clubId: { userId: user.id, clubId: club.id } },
                  update: { role: ROLE_MAP[match.role] },
                  create: {
                    userId: user.id,
                    clubId: club.id,
                    role: ROLE_MAP[match.role],
                  },
                });
              }

              console.log(
                `[Axios Auto-Link] Linked "${user.name}" to: ${matches.map(m => `${m.slug}(${m.role})`).join(', ')}`
              );
            } catch (err) {
              // Non-fatal — never block login
              console.error('[Axios Auto-Link] Error:', err);
            }
          },
        },
        update: {
          before: async (user) => {
            if (user.email && !user.email.endsWith('@iiitl.ac.in')) {
              throw new Error('Access Denied: Only @iiitl.ac.in emails are allowed.');
            }
            return { data: user };
          }
        }
      }
    }
  });
};
