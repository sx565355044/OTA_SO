import {
  User, InsertUser, OtaAccount, InsertOtaAccount, Activity, InsertActivity,
  Strategy, InsertStrategy, ApiKey, InsertApiKey, Setting, InsertSetting,
  StrategyParameter, InsertStrategyParameter, StrategyTemplate, InsertStrategyTemplate,
  users, otaAccounts, activities, strategies, apiKeys, settings, 
  strategyParameters, strategyTemplates
} from '../shared/schema';
import { db } from './db';
import { eq, and, not, isNull } from 'drizzle-orm';
import { IStorage } from './storage';
import session from 'express-session';
import { Sequelize } from 'sequelize';
import SequelizeStore from 'connect-session-sequelize';

// 解析数据库连接字符串
// 格式: mysql://username:password@hostname:port/database
const dbUrl = new URL(process.env.DATABASE_URL || '');
const host = dbUrl.hostname;
const port = Number(dbUrl.port) || 3306;
const user = dbUrl.username;
const password = dbUrl.password;
const database = dbUrl.pathname.substring(1); // 移除开头的斜杠

// 创建 MySQL 连接
const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: 'mysql',
  dialectOptions: {
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : undefined
  }
});

// 创建会话存储
const SessionStore = SequelizeStore(session.Store);

export class MySQLStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    // 创建会话存储实例
    this.sessionStore = new SessionStore({
      db: sequelize,
      tableName: 'session', // 默认会话表名
    });
  }

  // 用户相关方法
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const result = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result[0];
  }

  // OTA账户相关方法
  async getOtaAccount(id: number): Promise<OtaAccount | undefined> {
    const result = await db.select().from(otaAccounts).where(eq(otaAccounts.id, id));
    return result[0];
  }

  async getOtaAccountsByUserId(userId: number): Promise<OtaAccount[]> {
    return db.select().from(otaAccounts).where(eq(otaAccounts.user_id, userId));
  }

  async createOtaAccount(account: InsertOtaAccount): Promise<OtaAccount> {
    const result = await db.insert(otaAccounts).values(account).returning();
    return result[0];
  }

  async updateOtaAccount(id: number, account: Partial<OtaAccount>): Promise<OtaAccount> {
    const result = await db.update(otaAccounts).set(account).where(eq(otaAccounts.id, id)).returning();
    return result[0];
  }

  async deleteOtaAccount(id: number): Promise<void> {
    await db.delete(otaAccounts).where(eq(otaAccounts.id, id));
  }

  // 活动相关方法
  async getActivity(id: number): Promise<Activity | undefined> {
    const result = await db.select().from(activities).where(eq(activities.id, id));
    return result[0];
  }

  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return db.select().from(activities).where(eq(activities.user_id, userId));
  }

  async getActivitiesByPlatform(platformId: number): Promise<Activity[]> {
    return db.select().from(activities).where(eq(activities.platform_id, platformId));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const result = await db.insert(activities).values(activity).returning();
    return result[0];
  }

  async updateActivity(id: number, activity: Partial<Activity>): Promise<Activity> {
    const result = await db.update(activities).set(activity).where(eq(activities.id, id)).returning();
    return result[0];
  }

  async deleteActivity(id: number): Promise<void> {
    await db.delete(activities).where(eq(activities.id, id));
  }

  // 策略相关方法
  async getStrategy(id: number): Promise<Strategy | undefined> {
    const result = await db.select().from(strategies).where(eq(strategies.id, id));
    return result[0];
  }

  async getStrategiesByUserId(userId: number): Promise<Strategy[]> {
    return db.select().from(strategies).where(eq(strategies.user_id, userId));
  }

  async getAppliedStrategiesByUserId(userId: number): Promise<Strategy[]> {
    return db.select().from(strategies).where(and(eq(strategies.user_id, userId), not(isNull(strategies.applied_at))));
  }

  async getRecentAppliedStrategies(limit: number): Promise<Strategy[]> {
    const result = await db.select().from(strategies).where(not(isNull(strategies.applied_at)));
    return result.sort((a, b) => {
      if (!a.applied_at || !b.applied_at) return 0;
      return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
    }).slice(0, limit);
  }

  async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
    const result = await db.insert(strategies).values(strategy).returning();
    return result[0];
  }

  async updateStrategy(id: number, strategy: Partial<Strategy>): Promise<Strategy> {
    const result = await db.update(strategies).set(strategy).where(eq(strategies.id, id)).returning();
    return result[0];
  }

  async deleteStrategy(id: number): Promise<void> {
    await db.delete(strategies).where(eq(strategies.id, id));
  }

  // API密钥相关方法
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    const result = await db.select().from(apiKeys).where(eq(apiKeys.id, id));
    return result[0];
  }

  async getApiKeyByUserIdAndService(userId: number, service: string): Promise<ApiKey | undefined> {
    const result = await db.select().from(apiKeys).where(and(eq(apiKeys.user_id, userId), eq(apiKeys.service, service)));
    return result[0];
  }

  async getApiKeysByUserId(userId: number): Promise<ApiKey[]> {
    return db.select().from(apiKeys).where(eq(apiKeys.user_id, userId));
  }

  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const result = await db.insert(apiKeys).values(apiKey).returning();
    return result[0];
  }

  async updateApiKey(id: number, apiKey: Partial<ApiKey>): Promise<ApiKey> {
    const result = await db.update(apiKeys).set(apiKey).where(eq(apiKeys.id, id)).returning();
    return result[0];
  }

  async deleteApiKey(id: number): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  // 设置相关方法
  async getSetting(id: number): Promise<Setting | undefined> {
    const result = await db.select().from(settings).where(eq(settings.id, id));
    return result[0];
  }

  async getSettingByUserId(userId: number): Promise<Setting | undefined> {
    const result = await db.select().from(settings).where(eq(settings.user_id, userId));
    return result[0];
  }

  async createSetting(setting: InsertSetting): Promise<Setting> {
    const result = await db.insert(settings).values(setting).returning();
    return result[0];
  }

  async updateSetting(id: number, setting: Partial<Setting>): Promise<Setting> {
    const result = await db.update(settings).set(setting).where(eq(settings.id, id)).returning();
    return result[0];
  }

  // 策略参数相关方法
  async getStrategyParameter(id: number): Promise<StrategyParameter | undefined> {
    const result = await db.select().from(strategyParameters).where(eq(strategyParameters.id, id));
    return result[0];
  }

  async getAllStrategyParameters(): Promise<StrategyParameter[]> {
    return db.select().from(strategyParameters);
  }

  async createStrategyParameter(param: InsertStrategyParameter): Promise<StrategyParameter> {
    const result = await db.insert(strategyParameters).values(param).returning();
    return result[0];
  }

  async updateStrategyParameter(id: number, param: Partial<StrategyParameter>): Promise<StrategyParameter> {
    const result = await db.update(strategyParameters).set(param).where(eq(strategyParameters.id, id)).returning();
    return result[0];
  }

  async deleteStrategyParameter(id: number): Promise<void> {
    await db.delete(strategyParameters).where(eq(strategyParameters.id, id));
  }

  // 策略模板相关方法
  async getStrategyTemplate(id: number): Promise<StrategyTemplate | undefined> {
    const result = await db.select().from(strategyTemplates).where(eq(strategyTemplates.id, id));
    return result[0];
  }

  async getAllStrategyTemplates(): Promise<StrategyTemplate[]> {
    return db.select().from(strategyTemplates);
  }

  async createStrategyTemplate(template: InsertStrategyTemplate): Promise<StrategyTemplate> {
    const result = await db.insert(strategyTemplates).values(template).returning();
    return result[0];
  }

  async updateStrategyTemplate(id: number, template: Partial<StrategyTemplate>): Promise<StrategyTemplate> {
    const result = await db.update(strategyTemplates).set(template).where(eq(strategyTemplates.id, id)).returning();
    return result[0];
  }

  async deleteStrategyTemplate(id: number): Promise<void> {
    await db.delete(strategyTemplates).where(eq(strategyTemplates.id, id));
  }
} 
