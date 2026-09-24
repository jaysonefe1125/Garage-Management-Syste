import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getIronSession, type SessionOptions } from "iron-session";

export type Role = "ADMIN" | "FRONT_DESK" | "TECHNICIAN";

export interface SessionData {
  userId?: number;
  username?: string;
  role?: Role;
  displayName?: string;
}

export const sessionCookieName = "garage_session";

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: sessionCookieName,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
  },
};

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }
  return session as Required<SessionData>;
}

export function assertRole(session: SessionData, roles: Role[]) {
  if (!session.role || !roles.includes(session.role)) {
    throw new Error("Forbidden: insufficient permissions for this action");
  }
}
