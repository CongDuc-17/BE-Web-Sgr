import dotenv from "dotenv";
import pkg from "pg";
dotenv.config();
const { Pool } = pkg;
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5434,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const connectionDB = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ PostgreSQL connected successfully");
    client.release(); // trả connection về pool
  } catch (err: any) {
    console.error("❌ PostgreSQL connection error:", err.message);
  }
};

export { pool, connectionDB };
