import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createAppClient, viemConnector } from "@farcaster/auth-client";
import { NextApiRequest, NextApiResponse } from "next";

const handler = (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, {
    providers: [
      CredentialsProvider({
        name: "Sign in with Farcaster",
        credentials: {
          message: {
            label: "Message",
            type: "text",
            placeholder: "0x0",
          },
          signature: {
            label: "Signature",
            type: "text",
            placeholder: "0x0",
          },
          // In a production app with a server, these should be fetched from
          // your Farcaster data indexer rather than have them accepted as part
          // of credentials.
          name: {
            label: "Name",
            type: "text",
            placeholder: "0x0",
          },
          displayName: {
            label: "DisplayName",
            type: "text",
            placeholder: "0x0",
          },
          pfp: {
            label: "Pfp",
            type: "text",
            placeholder: "0x0",
          },
          nonce: {
            label: "Nonce",
            type: "text",
            placeholder: "0",
          },
          bio: {
            label: "Bio",
            type: "text",
            placeholder: "0",
          },
        },
        async authorize(credentials) {
          const appClient = createAppClient({
            ethereum: viemConnector(),
          });

          const verifyResponse = await appClient.verifySignInMessage({
            message: credentials?.message as string,
            signature: credentials?.signature as `0x${string}`,
            domain: "localhost",
            nonce: credentials?.nonce as string,
          });
          const { success, fid, error } = verifyResponse;

          if (!success) {
            return null;
          }

          return {
            id: fid.toString(),
            name: credentials?.name,
            displayName: credentials?.displayName,
            image: credentials?.pfp,
            bio: credentials?.bio,
          };
        },
      }),
    ],
    callbacks: {
      async session({ session, token }) {
        session.user = {
          ...session.user,
          ...(token.user as {
            id: string;
            bio?: string;
            name?: string;
            displayName?: string;
            email?: string;
            image?: string;
          }),
        };

        return session;
      },
      async jwt({ token, user, trigger, session }) {
        if (user) {
          token.user = user;
        }
        return token;
      },
    },
  });

export { handler as GET, handler as POST };
