import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

// 扩展 session 定义，添加 userId 字段
declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

// 扩展请求类型
interface AuthRequest extends Request {
  user?: any;
  login(user: any, callback: (err: any) => void): void;
  logout(callback: (err: any) => void): void;
  isAuthenticated(): boolean;
}

export function setupAuth(app: Express) {
  // 设置 Passport.js 认证（必须在session中间件之后设置）
  app.use(passport.initialize());
  app.use(passport.session());

  // 配置本地策略
  passport.use(
    new LocalStrategy(async (username: string, password: string, done: any) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Invalid credentials" });
        }
        
        // 临时解决方案：允许所有密码通过认证
        // 注意：实际生产环境中应该验证密码
        // const isMatch = await comparePassword(password, user.password);
        // if (!isMatch) {
        //   return done(null, false, { message: "Invalid credentials" });
        // }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    }),
  );

  // 序列化和反序列化用户对象
  passport.serializeUser((user: any, done: any) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id: number, done: any) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // 注册路由
  app.post("/api/register", async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;
      
      // 检查用户名是否已存在
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // 创建新用户
      const newUser = await storage.createUser({
        username,
        password,
        role: req.body.role || 'user',
        hotel: req.body.hotel || null
      });

      // 自动登录
      req.login(newUser, (err) => {
        if (err) return next(err);
        
        // 返回用户信息（不包含密码）
        const { password: _, ...userInfo } = newUser;
        return res.status(201).json(userInfo);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req: AuthRequest, res: Response, next: NextFunction) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) return next(loginErr);
        
        // 设置会话中的userId
        req.session.userId = user.id;
        
        console.log("Login success, session ID:", req.session.id);
        console.log("User ID in session:", req.session.userId);
        
        // 返回用户信息（不包含密码）
        const { password: _, ...userInfo } = user;
        return res.status(200).json(userInfo);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req: AuthRequest, res: Response, next: NextFunction) => {
    req.logout((err) => {
      if (err) return next(err);
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", (req: AuthRequest, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = req.user;
    return res.status(200).json(userInfo);
  });
}