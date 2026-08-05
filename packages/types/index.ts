import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string(),
  role: z.enum(['GUEST', 'STUDENT', 'CLUB_ADMIN', 'FACULTY', 'SUPER_ADMIN']),
});

export type User = z.infer<typeof UserSchema>;
