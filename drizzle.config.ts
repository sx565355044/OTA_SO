import { defineConfig } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

// 解析数据库连接字符串
// 格式: mysql://username:password@hostname:port/database
const dbUrl = new URL(process.env.DATABASE_URL);
const host = dbUrl.hostname;
const port = Number(dbUrl.port) || 3306;
const user = dbUrl.username;
const password = dbUrl.password;
const database = dbUrl.pathname.substring(1); // 移除开头的斜杠

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "mysql",
  dbCredentials: {
    host,
    port,
    user,
    password,
    database,
    // 如果需要SSL
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  },
});
