import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";

type RegisterPayload = {
  name?: string;
  email?: string;
  password?: string;
};

function makeReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let value = "TV-";
  for (let i = 0; i < 8; i += 1) {
    value += chars[Math.floor(Math.random() * chars.length)];
  }
  return value;
}

async function createUniqueReferralCode(): Promise<string> {
  const db = getDb();
  for (let i = 0; i < 6; i += 1) {
    const candidate = makeReferralCode();
    const exists = await db.query("SELECT 1 FROM users WHERE referral_code = $1 LIMIT 1", [candidate]);
    if (exists.rowCount === 0) return candidate;
  }
  return `TV-${Date.now().toString(36).toUpperCase()}`.slice(0, 11);
}

export async function POST(request: Request) {
  try {
    const db = getDb();
    const body = (await request.json()) as RegisterPayload;
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!name || name.length < 2) {
      return NextResponse.json({ error: "Name must be at least 2 characters." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await db.query("SELECT 1 FROM users WHERE email = $1 LIMIT 1", [email]);
    if (existing.rowCount) {
      return NextResponse.json({ error: "Email already registered." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const referralCode = await createUniqueReferralCode();

    const inserted = await db.query(
      `
        INSERT INTO users (email, name, password_hash, plan_type, referral_code)
        VALUES ($1, $2, $3, 'free', $4)
        RETURNING id::text, email, name
      `,
      [email, name, passwordHash, referralCode]
    );

    return NextResponse.json(
      {
        user: inserted.rows[0],
        message: "Account created successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register endpoint error:", error);
    return NextResponse.json({ error: "Unable to create account right now." }, { status: 500 });
  }
}
