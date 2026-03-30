import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isAdminEmail, normalizeEmail } from "@/lib/admin";
import mongooseConnect from "@/lib/mongooseConnect";
import { getStoreKey } from "@/lib/store-scope";
import User from "@/models/User";

function isSuperAdminEmail(email) {
  return normalizeEmail(email) === normalizeEmail(process.env.ADMIN_EMAIL);
}

function isStoreAllowed(storeKey) {
  return String(storeKey || "").trim() === getStoreKey();
}

function canAccessCurrentStore(user) {
  if (!user?.email) return false;
  if (isSuperAdminEmail(user.email)) return true;
  return isStoreAllowed(user.storeKey);
}

/** @type {import("next-auth").NextAuthOptions} */
export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const normalizedEmail = normalizeEmail(credentials?.email);
        if (
          isAdminEmail(normalizedEmail) &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          const isSuperAdmin = isSuperAdminEmail(normalizedEmail);
          return {
            id: "1",
            name: "Raza Admin",
            email: normalizedEmail,
            storeKey: isSuperAdmin ? "*" : getStoreKey(),
            isSuperAdmin,
          };
        }
        return null;
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          await mongooseConnect();
          const expectedStoreKey = getStoreKey();
          const normalizedEmail = normalizeEmail(user.email);
          const isSuperAdmin = isSuperAdminEmail(normalizedEmail);
          
          const existingUser = await User.findOne({ email: normalizedEmail });
          
          if (existingUser && (!canAccessCurrentStore(existingUser) || existingUser.disabled)) {
            return false; // Prevent sign in
          }

          let dbUser = existingUser;
          if (!isSuperAdmin) {
            dbUser = await User.findOneAndUpdate(
              { email: normalizedEmail },
              { 
                name: user.name, 
                image: user.image,
                email: normalizedEmail,
                storeKey: expectedStoreKey,
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            ).lean();
          }

          if (!isSuperAdmin && !canAccessCurrentStore(dbUser)) {
            return false;
          }

          if (!existingUser) {
            // New User Signup - Create Notification
            const Notification = (await import('@/models/Notification')).default;
            await Notification.create({
              type: 'user',
              message: `New user ${user.name} just signed up`,
              link: `/admin/users?id=${dbUser._id}`, // Deep link with ID
              metadata: {
                userName: user.name,
                userId: dbUser._id.toString(),
              }
            });
          }

          return true;
        } catch (error) {
          console.error("Error saving user profile:", error);
          return true; // Still allow sign in even if profile save fails
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      const email = user?.email || token?.email;
      
      if (email) {
        const expectedStoreKey = getStoreKey();
        token.email = normalizeEmail(email);
        token.isSuperAdmin = isSuperAdminEmail(token.email);
        if (user?.storeKey) {
          token.storeKey = user.storeKey;
        }
        // Check env-configured admins first
        let isAdmin = isAdminEmail(email);
        
        // Also check dynamically managed admin emails stored in DB
        if (!isAdmin) {
          try {
            const Settings = (await import('@/models/Settings')).default;
            const settings = await Settings.findOne({ singletonKey: `${getStoreKey()}:site-settings` }).select('adminEmails').lean();
            if (settings?.adminEmails?.includes(normalizeEmail(email))) {
              isAdmin = true;
            }
          } catch (err) {
            console.error('DB admin check failed:', err);
          }
        }

        token.isAdmin = isAdmin;

        // Phase 2: Strict Session Validation
        // Avoid DB check for static admin if possible, but for regular users we must check status
        try {
          // We only need to check DB if it's not the initial sign in (where user is provided)
          // or if we want to enforce "immediate" logout on every request/refresh
          await mongooseConnect();
          const dbUser = await User.findOne({ email: token.email }).select('disabled forceLogoutAt storeKey').lean();
          
          if (dbUser) {
            if (!canAccessCurrentStore(dbUser)) {
              return null;
            }
            token.storeKey = dbUser.storeKey;
            // 1. Check if user is disabled
            if (dbUser.disabled) {
              return null; // This invalidates the JWT
            }

            // 2. Check if session was forced to logout
            if (dbUser.forceLogoutAt && token.iat) {
              const forceLogoutTime = new Date(dbUser.forceLogoutAt).getTime();
              const tokenIssuedAt = token.iat * 1000;
              
              if (tokenIssuedAt < forceLogoutTime) {
                return null;
              }
            }
          } else if (!token.isSuperAdmin && !isStoreAllowed(token.storeKey || expectedStoreKey)) {
            return null;
          }
        } catch (error) {
          console.error("Auth DB Check Error:", error);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        if (!token?.isSuperAdmin && !isStoreAllowed(token?.storeKey)) {
          throw new Error("Invalid store session");
        }
        session.user.email = normalizeEmail(session.user.email || token?.email);
        // @ts-ignore - isAdmin is custom
        session.user.isAdmin = Boolean(token?.isAdmin);
        // @ts-ignore - isSuperAdmin is custom
        session.user.isSuperAdmin = Boolean(token?.isSuperAdmin);
        // @ts-ignore - storeKey is custom
        session.user.storeKey = token?.storeKey;
      }
      return session;
    },
  },
  pages: {
    signIn: "/admin/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
