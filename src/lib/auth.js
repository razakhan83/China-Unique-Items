import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { isAdminEmail, normalizeEmail } from "@/lib/admin";
import mongooseConnect from "@/lib/mongooseConnect";
import { getStoreKey } from "@/lib/store-scope";
import User from "@/models/User";

// ─── Helper: Super-Admin check ──────────────────────────────────────────────
function isSuperAdminEmail(email) {
  return normalizeEmail(email) === normalizeEmail(process.env.ADMIN_EMAIL);
}

// ─── Helper: Strict store-key match (for customers) ────────────────────────
function isStoreAllowed(storeKey) {
  return String(storeKey || "").trim() === getStoreKey();
}

// ─── Helper: Check if email is a Store-Admin for the CURRENT store ─────────
// Queries the settings collection for the current store's adminEmails array.
async function isStoreAdmin(email) {
  try {
    await mongooseConnect();
    const Settings = (await import("@/models/Settings")).default;
    const settings = await Settings.findOne({
      singletonKey: `${getStoreKey()}:site-settings`,
    })
      .select("adminEmails")
      .lean();
    if (
      settings?.adminEmails
        ?.map((e) => normalizeEmail(e))
        .includes(normalizeEmail(email))
    ) {
      return true;
    }
  } catch (err) {
    console.error("Store-admin DB check failed:", err);
  }
  return false;
}

// ─── Helper: Determine the admin tier for a given email ────────────────────
// Returns: "super-admin" | "store-admin" | "env-admin" | false
async function getAdminTier(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  // Tier 1 — Super-Admin (env ADMIN_EMAIL)
  if (isSuperAdminEmail(normalized)) return "super-admin";

  // Tier 2 — Env-configured admin (ADMIN_EMAIL / ADMIN_EMAILS)
  if (isAdminEmail(normalized)) return "env-admin";

  // Tier 3 — Store-Admin (email in current store's settings.adminEmails)
  if (await isStoreAdmin(normalized)) return "store-admin";

  return false;
}

// ─── Tiered access: can this user access the current store? ────────────────
// Super-Admin & Store-Admin bypass storeKey checks; customers must match.
async function canAccessCurrentStore(user) {
  if (!user?.email) return false;
  const tier = await getAdminTier(user.email);
  if (tier) return true; // Any admin tier has access
  // Customer — strict storeKey match
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
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const normalizedEmail = normalizeEmail(credentials?.email);
        const tier = await getAdminTier(normalizedEmail);

        if (tier && credentials?.password === process.env.ADMIN_PASSWORD) {
          return {
            id: "1",
            name: "Admin",
            email: normalizedEmail,
            storeKey: tier === "super-admin" ? "*" : getStoreKey(),
            isSuperAdmin: tier === "super-admin",
          };
        }
        return null;
      },
    }),
  ],

  callbacks: {
    // ── signIn: gate Google OAuth users ────────────────────────────────
    async signIn({ user, account }) {
      if (account.provider === "google") {
        try {
          await mongooseConnect();
          const expectedStoreKey = getStoreKey();
          const normalizedEmail = normalizeEmail(user.email);
          const tier = await getAdminTier(normalizedEmail);

          const existingUser = await User.findOne({
            email: normalizedEmail,
          }).lean();

          // Block disabled users
          if (existingUser?.disabled) return false;

          // ── Customer with wrong storeKey → block ───────────────────
          if (existingUser && !tier && !isStoreAllowed(existingUser.storeKey)) {
            return false;
          }

          // ── Upsert user record ─────────────────────────────────────
          // Super-admins: don't overwrite their storeKey
          // Store/Env admins: set storeKey to current store
          // Customers: set storeKey to current store
          if (tier !== "super-admin") {
            await User.findOneAndUpdate(
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

          // ── New-user notification ──────────────────────────────────
          if (!existingUser) {
            const newUser = await User.findOne({
              email: normalizedEmail,
            }).lean();
            const Notification = (await import("@/models/Notification"))
              .default;
            await Notification.create({
              type: "user",
              message: `New user ${user.name} just signed up`,
              link: `/admin/users?id=${newUser?._id}`,
              metadata: {
                userName: user.name,
                userId: newUser?._id?.toString(),
              },
            });
          }

          return true;
        } catch (error) {
          console.error("Error saving user profile:", error);
          return true; // Still allow sign-in even if profile save fails
        }
      }
      return true;
    },

    // ── jwt: enrich token with admin tier & validate on every request ──
    async jwt({ token, user }) {
      const email = user?.email || token?.email;

      if (email) {
        const expectedStoreKey = getStoreKey();
        token.email = normalizeEmail(email);

        // Determine admin tier
        const tier = await getAdminTier(token.email);
        token.isSuperAdmin = tier === "super-admin";
        token.isAdmin = Boolean(tier);

        // Carry storeKey from initial sign-in
        if (user?.storeKey) {
          token.storeKey = user.storeKey;
        }

        // ── Validate against DB on every token refresh ──────────────
        try {
          await mongooseConnect();
          const dbUser = await User.findOne({ email: token.email })
            .select("disabled forceLogoutAt storeKey")
            .lean();

          if (dbUser) {
            // Disabled → invalidate
            if (dbUser.disabled) return null;

            // Forced logout → invalidate if token is older
            if (dbUser.forceLogoutAt && token.iat) {
              const forceLogoutTime = new Date(
                dbUser.forceLogoutAt
              ).getTime();
              const tokenIssuedAt = token.iat * 1000;
              if (tokenIssuedAt < forceLogoutTime) return null;
            }

            // For super-admin keep "*", otherwise use current store key
            if (!token.isSuperAdmin) {
              token.storeKey = tier
                ? expectedStoreKey // Admin accessing this store
                : dbUser.storeKey; // Customer's own storeKey
            }

            // Customer with mismatched storeKey → invalidate
            if (!tier && !isStoreAllowed(dbUser.storeKey)) {
              return null;
            }
          } else if (!tier) {
            // No DB user and not an admin → block
            // (super-admin may not have a user record for every store)
            if (!isStoreAllowed(token.storeKey || expectedStoreKey)) {
              return null;
            }
          }
        } catch (error) {
          console.error("Auth DB Check Error:", error);
        }
      }

      return token;
    },

    // ── session: expose tier info to client ────────────────────────────
    async session({ session, token }) {
      if (session?.user) {
        // Customers without valid storeKey → reject session
        if (!token?.isSuperAdmin && !token?.isAdmin && !isStoreAllowed(token?.storeKey)) {
          throw new Error("Invalid store session");
        }

        session.user.email = normalizeEmail(
          session.user.email || token?.email
        );
        session.user.isAdmin = Boolean(token?.isAdmin);
        session.user.isSuperAdmin = Boolean(token?.isSuperAdmin);
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
