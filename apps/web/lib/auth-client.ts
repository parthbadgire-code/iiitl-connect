import { createAuthClient } from "better-auth/react";

const getBaseURL = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  
  if (typeof window === "undefined" && url.startsWith("/")) {
    url = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}${url}` : `http://localhost:3000${url}`;
  }
  
  return `${url}/auth`;
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});

export const { signIn, signOut, useSession } = authClient;
