import { drizzle } from 'drizzle-orm/mysql';
import mysql from 'mysql/promise';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 创建 MySQL 连接池
const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
});

// 初始化 Drizzle ORM
export const db = drizzle(pool);
