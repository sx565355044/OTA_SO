import { drizzle } from 'drizzle-orm/mysql';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 解析数据库连接字符串
// 格式: mysql://username:password@hostname:port/database
const dbUrl = new URL(process.env.DATABASE_URL || '');
const host = dbUrl.hostname;
const port = Number(dbUrl.port) || 3306;
const user = dbUrl.username;
const password = dbUrl.password;
const database = dbUrl.pathname.substring(1); // 移除开头的斜杠

// 创建 MySQL 连接池
const pool = mysql.createPool({
  host,
  port,
  user,
  password,
  database,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// 初始化 Drizzle ORM
export const db = drizzle(pool);
