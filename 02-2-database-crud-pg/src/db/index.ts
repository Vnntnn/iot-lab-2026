import { drizzle } from "drizzle-orm/vercel-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({
  connectionString: databaseUrl,
  max: 1,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
});

export const db = drizzle({ client: pool });
