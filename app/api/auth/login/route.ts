import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const username = typeof body?.username === "string" ? body.username.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!username || !password) {
    return NextResponse.json(
      { error: "Username and password are required." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user || !user.active) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

  const passwordValid = await bcrypt.compare(password, user.passwordHash);
  if (!passwordValid) {
    return NextResponse.json(
      { error: "Invalid username or password." },
      { status: 401 }
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.role = user.role as "ADMIN" | "FRONT_DESK" | "TECHNICIAN";
  session.displayName = user.displayName;
  await session.save();

  return NextResponse.json({ ok: true });
}
