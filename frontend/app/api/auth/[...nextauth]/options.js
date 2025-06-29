import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { connectDB } from "@/lib/db/db";
import User from "@/lib/db/models/user.model";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        // username: { label: "Username", type: "text" },
        email: { label: "email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        await connectDB();
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error("Please fill all fields correctly.");
          }

          const user = await User.findOne({
            email: credentials?.email,
          });
          if (!user) {
            throw new Error("No user found with the given credentials.");
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error("Password is incorrect.");
          }
        } catch (error) {
          throw new Error(error);
        }
      },
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.email = token.email;
        session.user.userName = token.userName;
        session.user.FirstName = token.FirstName;
        session.user.LastName = token.LastName;
        session.user.aboutUser = token.aboutUser;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.userName = user.userName;
        token.email = user.email;
        token.FirstName = user.FirstName;
        token.LastName = user.LastName;
        token.aboutUser = user.aboutUser;
      }
      return token;
    },
  },
  pages: {
    signIn: "/sign-in",
    signUp: "/sign-up",
    // error: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
