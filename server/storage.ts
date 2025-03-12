import {
  User,
  InsertUser,
  OtaAccount,
  InsertOtaAccount,
  Activity,
  InsertActivity,
  Strategy,
  InsertStrategy,
  ApiKey,
  InsertApiKey,
  Setting,
  InsertSetting,
  StrategyParameter,
  InsertStrategyParameter,
  StrategyTemplate,
  InsertStrategyTemplate,
} from "@shared/schema";

import session from 'express-session';
import createMemoryStore from "memorystore";
import { MySQLStorage } from './storage-mysql';

const MemoryStore = createMemoryStore(session);

// Interface for storage methods
export interface IStorage {
  // Session store for express-session
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<User>): Promise<User>;
  
  // OTA Account methods
  getOtaAccount(id: number): Promise<OtaAccount | undefined>;
  getOtaAccountsByUserId(userId: number): Promise<OtaAccount[]>;
  createOtaAccount(account: InsertOtaAccount): Promise<OtaAccount>;
  updateOtaAccount(id: number, account: Partial<OtaAccount>): Promise<OtaAccount>;
  deleteOtaAccount(id: number): Promise<void>;
  
  // Activity methods
  getActivity(id: number): Promise<Activity | undefined>;
  getActivitiesByUserId(userId: number): Promise<Activity[]>;
  getActivitiesByPlatform(platformId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  updateActivity(id: number, activity: Partial<Activity>): Promise<Activity>;
  deleteActivity(id: number): Promise<void>;
  
  // Strategy methods
  getStrategy(id: number): Promise<Strategy | undefined>;
  getStrategiesByUserId(userId: number): Promise<Strategy[]>;
  getAppliedStrategiesByUserId(userId: number): Promise<Strategy[]>;
  getRecentAppliedStrategies(limit: number): Promise<Strategy[]>;
  createStrategy(strategy: InsertStrategy): Promise<Strategy>;
  updateStrategy(id: number, strategy: Partial<Strategy>): Promise<Strategy>;
  deleteStrategy(id: number): Promise<void>;
  
  // API Key methods
  getApiKey(id: number): Promise<ApiKey | undefined>;
  getApiKeyByUserIdAndService(userId: number, service: string): Promise<ApiKey | undefined>;
  getApiKeysByUserId(userId: number): Promise<ApiKey[]>;
  createApiKey(apiKey: InsertApiKey): Promise<ApiKey>;
  updateApiKey(id: number, apiKey: Partial<ApiKey>): Promise<ApiKey>;
  deleteApiKey(id: number): Promise<void>;
  
  // Settings methods
  getSetting(id: number): Promise<Setting | undefined>;
  getSettingByUserId(userId: number): Promise<Setting | undefined>;
  createSetting(setting: InsertSetting): Promise<Setting>;
  updateSetting(id: number, setting: Partial<Setting>): Promise<Setting>;
  
  // Strategy Parameter methods
  getStrategyParameter(id: number): Promise<StrategyParameter | undefined>;
  getAllStrategyParameters(): Promise<StrategyParameter[]>;
  createStrategyParameter(param: InsertStrategyParameter): Promise<StrategyParameter>;
  updateStrategyParameter(id: number, param: Partial<StrategyParameter>): Promise<StrategyParameter>;
  deleteStrategyParameter(id: number): Promise<void>;
  
  // Strategy Template methods
  getStrategyTemplate(id: number): Promise<StrategyTemplate | undefined>;
  getAllStrategyTemplates(): Promise<StrategyTemplate[]>;
  createStrategyTemplate(template: InsertStrategyTemplate): Promise<StrategyTemplate>;
  updateStrategyTemplate(id: number, template: Partial<StrategyTemplate>): Promise<StrategyTemplate>;
  deleteStrategyTemplate(id: number): Promise<void>;
}

// 使用MySQL存储
export const storage: IStorage = new MySQLStorage();

// 内存存储实现（仅用于开发环境）
export class MemoryStorage implements IStorage {
  sessionStore: session.Store;
  private users: User[] = [];
  private otaAccounts: OtaAccount[] = [];
  private activities: Activity[] = [];
  private strategies: Strategy[] = [];
  private apiKeys: ApiKey[] = [];
  private settings: Setting[] = [];
  private strategyParameters: StrategyParameter[] = [];
  private strategyTemplates: StrategyTemplate[] = [];
  
  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 清理过期会话的时间间隔（毫秒）
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      id: this.users.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }
  
  async updateUser(id: number, user: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users[index] = {
      ...this.users[index],
      ...user,
      updated_at: new Date()
    };
    
    return this.users[index];
  }
  
  // OTA Account methods
  async getOtaAccount(id: number): Promise<OtaAccount | undefined> {
    return this.otaAccounts.find(account => account.id === id);
  }
  
  async getOtaAccountsByUserId(userId: number): Promise<OtaAccount[]> {
    return this.otaAccounts.filter(account => account.user_id === userId);
  }
  
  async createOtaAccount(account: InsertOtaAccount): Promise<OtaAccount> {
    const newAccount: OtaAccount = {
      ...account,
      id: this.otaAccounts.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.otaAccounts.push(newAccount);
    return newAccount;
  }
  
  async updateOtaAccount(id: number, account: Partial<OtaAccount>): Promise<OtaAccount> {
    const index = this.otaAccounts.findIndex(a => a.id === id);
    if (index === -1) throw new Error('OTA Account not found');
    
    this.otaAccounts[index] = {
      ...this.otaAccounts[index],
      ...account,
      updated_at: new Date()
    };
    
    return this.otaAccounts[index];
  }
  
  async deleteOtaAccount(id: number): Promise<void> {
    const index = this.otaAccounts.findIndex(a => a.id === id);
    if (index !== -1) {
      this.otaAccounts.splice(index, 1);
    }
  }
  
  // Activity methods
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.find(activity => activity.id === id);
  }
  
  async getActivitiesByUserId(userId: number): Promise<Activity[]> {
    return this.activities.filter(activity => activity.user_id === userId);
  }
  
  async getActivitiesByPlatform(platformId: number): Promise<Activity[]> {
    return this.activities.filter(activity => activity.platform_id === platformId);
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const newActivity: Activity = {
      ...activity,
      id: this.activities.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.activities.push(newActivity);
    return newActivity;
  }
  
  async updateActivity(id: number, activity: Partial<Activity>): Promise<Activity> {
    const index = this.activities.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Activity not found');
    
    this.activities[index] = {
      ...this.activities[index],
      ...activity,
      updated_at: new Date()
    };
    
    return this.activities[index];
  }
  
  async deleteActivity(id: number): Promise<void> {
    const index = this.activities.findIndex(a => a.id === id);
    if (index !== -1) {
      this.activities.splice(index, 1);
    }
  }
  
  // Strategy methods
  async getStrategy(id: number): Promise<Strategy | undefined> {
    return this.strategies.find(strategy => strategy.id === id);
  }
  
  async getStrategiesByUserId(userId: number): Promise<Strategy[]> {
    return this.strategies.filter(strategy => strategy.user_id === userId);
  }
  
  async getAppliedStrategiesByUserId(userId: number): Promise<Strategy[]> {
    return this.strategies.filter(strategy => strategy.user_id === userId && strategy.applied_at !== undefined);
  }
  
  async getRecentAppliedStrategies(limit: number): Promise<Strategy[]> {
    return this.strategies.filter(strategy => strategy.applied_at !== undefined)
      .sort((a, b) => {
        if (!a.applied_at || !b.applied_at) return 0;
        return new Date(b.applied_at).getTime() - new Date(a.applied_at).getTime();
      })
      .slice(0, limit);
  }
  
  async createStrategy(strategy: InsertStrategy): Promise<Strategy> {
    const newStrategy: Strategy = {
      ...strategy,
      id: this.strategies.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.strategies.push(newStrategy);
    return newStrategy;
  }
  
  async updateStrategy(id: number, strategy: Partial<Strategy>): Promise<Strategy> {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Strategy not found');
    
    this.strategies[index] = {
      ...this.strategies[index],
      ...strategy,
      updated_at: new Date()
    };
    
    return this.strategies[index];
  }
  
  async deleteStrategy(id: number): Promise<void> {
    const index = this.strategies.findIndex(s => s.id === id);
    if (index !== -1) {
      this.strategies.splice(index, 1);
    }
  }
  
  // API Key methods
  async getApiKey(id: number): Promise<ApiKey | undefined> {
    return this.apiKeys.find(key => key.id === id);
  }
  
  async getApiKeyByUserIdAndService(userId: number, service: string): Promise<ApiKey | undefined> {
    return this.apiKeys.find(key => key.user_id === userId && key.service === service);
  }
  
  async getApiKeysByUserId(userId: number): Promise<ApiKey[]> {
    return this.apiKeys.filter(key => key.user_id === userId);
  }
  
  async createApiKey(apiKey: InsertApiKey): Promise<ApiKey> {
    const newApiKey: ApiKey = {
      ...apiKey,
      id: this.apiKeys.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.apiKeys.push(newApiKey);
    return newApiKey;
  }
  
  async updateApiKey(id: number, apiKey: Partial<ApiKey>): Promise<ApiKey> {
    const index = this.apiKeys.findIndex(k => k.id === id);
    if (index === -1) throw new Error('API Key not found');
    
    this.apiKeys[index] = {
      ...this.apiKeys[index],
      ...apiKey,
      updated_at: new Date()
    };
    
    return this.apiKeys[index];
  }
  
  async deleteApiKey(id: number): Promise<void> {
    const index = this.apiKeys.findIndex(k => k.id === id);
    if (index !== -1) {
      this.apiKeys.splice(index, 1);
    }
  }
  
  // Settings methods
  async getSetting(id: number): Promise<Setting | undefined> {
    return this.settings.find(setting => setting.id === id);
  }
  
  async getSettingByUserId(userId: number): Promise<Setting | undefined> {
    return this.settings.find(setting => setting.user_id === userId);
  }
  
  async createSetting(setting: InsertSetting): Promise<Setting> {
    const newSetting: Setting = {
      ...setting,
      id: this.settings.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.settings.push(newSetting);
    return newSetting;
  }
  
  async updateSetting(id: number, setting: Partial<Setting>): Promise<Setting> {
    const index = this.settings.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Setting not found');
    
    this.settings[index] = {
      ...this.settings[index],
      ...setting,
      updated_at: new Date()
    };
    
    return this.settings[index];
  }
  
  // Strategy Parameter methods
  async getStrategyParameter(id: number): Promise<StrategyParameter | undefined> {
    return this.strategyParameters.find(param => param.id === id);
  }
  
  async getAllStrategyParameters(): Promise<StrategyParameter[]> {
    return this.strategyParameters;
  }
  
  async createStrategyParameter(param: InsertStrategyParameter): Promise<StrategyParameter> {
    const newParam: StrategyParameter = {
      ...param,
      id: this.strategyParameters.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.strategyParameters.push(newParam);
    return newParam;
  }
  
  async updateStrategyParameter(id: number, param: Partial<StrategyParameter>): Promise<StrategyParameter> {
    const index = this.strategyParameters.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Strategy Parameter not found');
    
    this.strategyParameters[index] = {
      ...this.strategyParameters[index],
      ...param,
      updated_at: new Date()
    };
    
    return this.strategyParameters[index];
  }
  
  async deleteStrategyParameter(id: number): Promise<void> {
    const index = this.strategyParameters.findIndex(p => p.id === id);
    if (index !== -1) {
      this.strategyParameters.splice(index, 1);
    }
  }
  
  // Strategy Template methods
  async getStrategyTemplate(id: number): Promise<StrategyTemplate | undefined> {
    return this.strategyTemplates.find(template => template.id === id);
  }
  
  async getAllStrategyTemplates(): Promise<StrategyTemplate[]> {
    return this.strategyTemplates;
  }
  
  async createStrategyTemplate(template: InsertStrategyTemplate): Promise<StrategyTemplate> {
    const newTemplate: StrategyTemplate = {
      ...template,
      id: this.strategyTemplates.length + 1,
      created_at: new Date(),
      updated_at: new Date()
    };
    this.strategyTemplates.push(newTemplate);
    return newTemplate;
  }
  
  async updateStrategyTemplate(id: number, template: Partial<StrategyTemplate>): Promise<StrategyTemplate> {
    const index = this.strategyTemplates.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Strategy Template not found');
    
    this.strategyTemplates[index] = {
      ...this.strategyTemplates[index],
      ...template,
      updated_at: new Date()
    };
    
    return this.strategyTemplates[index];
  }
  
  async deleteStrategyTemplate(id: number): Promise<void> {
    const index = this.strategyTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
      this.strategyTemplates.splice(index, 1);
    }
  }
}
