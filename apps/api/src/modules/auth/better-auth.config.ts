import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { DatabaseService } from '../database/database.service';

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
        authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?hd=iiitl.ac.in',
      },
    },
    trustedOrigins: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:3003', process.env.FRONTEND_URL].filter(Boolean) as string[],
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            if (!user.email.endsWith('@iiitl.ac.in')) {
              throw new Error('Access Denied: Only @iiitl.ac.in emails are allowed to join CampusOS.');
            }
            return { data: user };
          }
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
