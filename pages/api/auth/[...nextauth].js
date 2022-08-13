import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions = {
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const authResponse = await fetch(
          "http://localhost:4000/api/v1/auth/login",
          {
            method: "POST",
            body: JSON.stringify(credentials),
            headers: { "Content-Type": "application/json" },
          }
        );
        const authData = await authResponse.json();
        if (!authResponse.ok || !authData) return null;

        const userResponse = await fetch(
          "http://localhost:4000/api/v1/auth/whoami",
          {
            headers: {
              Authorization: authData.accessToken,
            },
          }
        );
        const user = await userResponse.json();
        if (!userResponse.ok || !user) return null;

        return {
          accessToken: authData.accessToken,
          ...user,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user = token.user;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.user = user;
      }
      return token;
    },
  },
};

export default NextAuth(authOptions);
