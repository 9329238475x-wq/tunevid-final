import { Pool } from "pg";

function normalizeDatabaseUrl(raw: string): string {
  // Backend may use SQLAlchemy-style URL.
  return raw.replace("postgresql+asyncpg://", "postgresql://");
}

declare global {
  // eslint-disable-next-line no-var
  var __tunevid_pg_pool__: Pool | undefined;
}

export function getDb(): Pool {
  if (global.__tunevid_pg_pool__) {
    return global.__tunevid_pg_pool__;
  }

  const rawUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
  if (!rawUrl) {
    throw new Error("DATABASE_URL (or POSTGRES_URL) is not set.");
  }

  const pool = new Pool({
    connectionString: normalizeDatabaseUrl(rawUrl),
    max: 10,
    ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
  });

  global.__tunevid_pg_pool__ = pool;
  return pool;
}
