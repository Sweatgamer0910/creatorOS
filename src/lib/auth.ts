import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      scope: [
        "https://www.googleapis.com/auth/youtube.readonly",
        "https://www.googleapis.com/auth/yt-analytics.readonly",
      ],
      accessType: "offline",
      prompt: "consent",
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await prisma.workspace.create({
            data: {
              name: `${user.name}'s Workspace`,
              ownerId: user.id,
            },
          });
        },
      },
    },
  },
});
