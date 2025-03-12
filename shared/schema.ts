import { mysqlTable, text, serial, int, boolean, timestamp, json, float } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("manager"),
  hotel: text("hotel"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  hotel: true,
});

// OTA platform accounts
export const otaAccounts = mysqlTable("ota_accounts", {
  id: serial("id").primaryKey(),
  user_id: int("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  short_name: text("short_name"),
  url: text("url").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  account_type: text("account_type"),
  status: text("status").default("active"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertOtaAccountSchema = createInsertSchema(otaAccounts).pick({
  user_id: true,
  name: true,
  short_name: true,
  url: true,
  username: true,
  password: true,
  account_type: true,
  status: true,
});

// Promotional activities from OTA platforms
export const activities = mysqlTable("activities", {
  id: serial("id").primaryKey(),
  platform_id: int("platform_id").notNull().references(() => otaAccounts.id),
  user_id: int("user_id").references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  start_date: timestamp("start_date"),
  end_date: timestamp("end_date"),
  discount: text("discount"),
  commission_rate: text("commission_rate"),
  room_types: json("room_types").$type<string[]>(),
  minimum_stay: int("minimum_stay"),
  max_booking_window: int("max_booking_window"),
  status: text("status").default("active"),
  tag: text("tag"),
  participation_status: text("participation_status").default("pending"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertActivitySchema = createInsertSchema(activities).pick({
  platform_id: true,
  user_id: true,
  name: true,
  description: true,
  start_date: true,
  end_date: true,
  discount: true,
  commission_rate: true,
  room_types: true,
  minimum_stay: true,
  max_booking_window: true,
  status: true,
  tag: true,
  participation_status: true,
});

// Strategies generated or applied
export const strategies = mysqlTable("strategies", {
  id: serial("id").primaryKey(),
  user_id: int("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  platform_id: int("platform_id").references(() => otaAccounts.id),
  activity_id: int("activity_id").references(() => activities.id),
  recommendation: text("recommendation"),
  reasoning: text("reasoning"),
  expected_outcome: text("expected_outcome"),
  parameters_used: json("parameters_used").$type<Record<string, number>>(),
  status: text("status").default("draft"),
  applied_at: timestamp("applied_at"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertStrategySchema = createInsertSchema(strategies).pick({
  user_id: true,
  name: true,
  description: true,
  platform_id: true,
  activity_id: true,
  recommendation: true,
  reasoning: true,
  expected_outcome: true,
  parameters_used: true,
  status: true,
  applied_at: true,
});

// API keys for external services
export const apiKeys = mysqlTable("api_keys", {
  id: serial("id").primaryKey(),
  user_id: int("user_id").notNull().references(() => users.id),
  service: text("service").notNull(),
  encrypted_key: text("encrypted_key").notNull(),
  model: text("model"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).pick({
  user_id: true,
  service: true,
  encrypted_key: true,
  model: true,
});

// User settings
export const settings = mysqlTable("settings", {
  id: serial("id").primaryKey(),
  user_id: int("user_id").notNull().references(() => users.id).unique(),
  notifications_enabled: boolean("notifications_enabled").default(true),
  auto_refresh_interval: int("auto_refresh_interval").default(30),
  default_strategy_preference: text("default_strategy_preference").default("balanced"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).pick({
  user_id: true,
  notifications_enabled: true,
  auto_refresh_interval: true,
  default_strategy_preference: true,
});

// Strategy parameters
export const strategyParameters = mysqlTable("strategy_parameters", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  param_key: text("param_key").notNull().unique(),
  value: float("value").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertStrategyParameterSchema = createInsertSchema(strategyParameters).pick({
  name: true,
  description: true,
  param_key: true,
  value: true,
});

// Strategy templates
export const strategyTemplates = mysqlTable("strategy_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  template_text: text("template_text").notNull(),
  parameters: json("parameters").$type<string[]>(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const insertStrategyTemplateSchema = createInsertSchema(strategyTemplates).pick({
  name: true,
  description: true,
  template_text: true,
  parameters: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type OtaAccount = typeof otaAccounts.$inferSelect;
export type InsertOtaAccount = z.infer<typeof insertOtaAccountSchema>;

export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = z.infer<typeof insertStrategySchema>;

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = z.infer<typeof insertSettingsSchema>;

export type StrategyParameter = typeof strategyParameters.$inferSelect;
export type InsertStrategyParameter = z.infer<typeof insertStrategyParameterSchema>;

export type StrategyTemplate = typeof strategyTemplates.$inferSelect;
export type InsertStrategyTemplate = z.infer<typeof insertStrategyTemplateSchema>;
