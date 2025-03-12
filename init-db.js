require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

// 密码加密
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function initializeData() {
  // 解析数据库连接字符串
  // 格式: mysql://username:password@hostname:port/database
  const dbUrl = new URL(process.env.DATABASE_URL);
  const host = dbUrl.hostname;
  const port = Number(dbUrl.port) || 3306;
  const user = dbUrl.username;
  const password = dbUrl.password;
  const database = dbUrl.pathname.substring(1); // 移除开头的斜杠

  // 创建数据库连接
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });

  try {
    console.log('开始初始化基础数据...');
    
    // 检查用户表是否存在数据
    const [userRows] = await connection.execute('SELECT COUNT(*) as count FROM users');
    if (parseInt(userRows[0].count) === 0) {
      console.log('初始化用户数据...');
      // 创建默认用户
      const adminPassword = await hashPassword('admin');
      await connection.execute(
        'INSERT INTO users (username, password, role, hotel) VALUES (?, ?, ?, ?)',
        ['admin', adminPassword, 'admin', '星星酒店集团']
      );
      
      await connection.execute(
        'INSERT INTO users (username, password, role, hotel) VALUES (?, ?, ?, ?)',
        ['总经理', adminPassword, 'manager', '星星酒店北京分店']
      );
      
      await connection.execute(
        'INSERT INTO users (username, password, role, hotel) VALUES (?, ?, ?, ?)',
        ['snorkeler', adminPassword, 'user', '星星酒店上海分店']
      );
      
      console.log('用户数据初始化完成');
    } else {
      console.log('用户数据已存在，跳过初始化');
    }
    
    // 检查OTA账户表是否存在数据
    const [accountRows] = await connection.execute('SELECT COUNT(*) as count FROM ota_accounts');
    if (parseInt(accountRows[0].count) === 0) {
      console.log('初始化OTA账户数据...');
      // 创建默认OTA账户
      await connection.execute(
        'INSERT INTO ota_accounts (name, short_name, url, username, password, user_id, account_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['携程', 'Ctrip', 'https://hotels.ctrip.com', 'starhotel_admin', 'ctripP@ssw0rd', 1, 'business', 'active']
      );
      
      await connection.execute(
        'INSERT INTO ota_accounts (name, short_name, url, username, password, user_id, account_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['美团', 'Meituan', 'https://hotel.meituan.com', 'starhotel_meituan', 'meituanP@ss123', 1, 'standard', 'active']
      );
      
      await connection.execute(
        'INSERT INTO ota_accounts (name, short_name, url, username, password, user_id, account_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        ['飞猪', 'Fliggy', 'https://hotel.fliggy.com', 'starhotel_fliggy', 'fliggyP@ss456', 1, 'premium', 'active']
      );
      
      console.log('OTA账户数据初始化完成');
    } else {
      console.log('OTA账户数据已存在，跳过初始化');
    }

    // 检查促销活动表是否存在数据
    const [activityRows] = await connection.execute('SELECT COUNT(*) as count FROM activities');
    if (parseInt(activityRows[0].count) === 0) {
      console.log('初始化促销活动数据...');
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(now);
      nextMonth.setDate(nextMonth.getDate() + 30);
      
      // 创建默认促销活动
      await connection.execute(
        'INSERT INTO activities (name, description, platform_id, start_date, end_date, discount, commission_rate, room_types, minimum_stay, max_booking_window, status, tag, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['暑期特惠', '暑期家庭出游特别折扣', 1, now, nextMonth, '8.5折', '8%', JSON.stringify(['标准双人间', '豪华家庭房']), 2, 90, 'active', '热门', 1]
      );
      
      await connection.execute(
        'INSERT INTO activities (name, description, platform_id, start_date, end_date, discount, commission_rate, room_types, minimum_stay, max_booking_window, status, tag, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['周末闪购', '限时48小时特惠房价', 2, tomorrow, nextWeek, '75折', '10%', JSON.stringify(['商务单人间', '豪华双人间']), 1, 30, 'upcoming', '限时', 1]
      );
      
      await connection.execute(
        'INSERT INTO activities (name, description, platform_id, start_date, end_date, discount, commission_rate, room_types, minimum_stay, max_booking_window, status, tag, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        ['预付立减', '提前预付享受额外折扣', 3, now, nextMonth, '8.8折', '7.5%', JSON.stringify(['所有房型']), 1, 180, 'active', '推荐', 1]
      );
      
      console.log('促销活动数据初始化完成');
    } else {
      console.log('促销活动数据已存在，跳过初始化');
    }
    
    // 检查策略参数表是否存在数据
    const [paramRows] = await connection.execute('SELECT COUNT(*) as count FROM strategy_parameters');
    if (parseInt(paramRows[0].count) === 0) {
      console.log('初始化策略参数数据...');
      // 创建默认策略参数
      await connection.execute(
        'INSERT INTO strategy_parameters (name, description, param_key, value) VALUES (?, ?, ?, ?)',
        ['关注远期预定', '重视提前预订和长期收益', 'future_booking_weight', 7]
      );
      
      await connection.execute(
        'INSERT INTO strategy_parameters (name, description, param_key, value) VALUES (?, ?, ?, ?)',
        ['关注成本最小', '优化佣金成本和运营支出', 'cost_optimization_weight', 6]
      );
      
      await connection.execute(
        'INSERT INTO strategy_parameters (name, description, param_key, value) VALUES (?, ?, ?, ?)',
        ['关注展示最优', '最大化在平台上的展示和排名', 'visibility_optimization_weight', 8]
      );
      
      await connection.execute(
        'INSERT INTO strategy_parameters (name, description, param_key, value) VALUES (?, ?, ?, ?)',
        ['关注当日OCC', '优先考虑提高当前入住率', 'daily_occupancy_weight', 5]
      );
      
      await connection.execute(
        'INSERT INTO strategy_parameters (name, description, param_key, value) VALUES (?, ?, ?, ?)',
        ['平衡长短期收益', '在长期战略和短期收益之间取得平衡', 'long_short_balance_weight', 6]
      );
      
      console.log('策略参数数据初始化完成');
    } else {
      console.log('策略参数数据已存在，跳过初始化');
    }
    
    // 检查用户设置表是否存在数据
    const [settingsRows] = await connection.execute('SELECT COUNT(*) as count FROM settings');
    if (parseInt(settingsRows[0].count) === 0) {
      console.log('初始化用户设置数据...');
      // 创建默认用户设置
      await connection.execute(
        'INSERT INTO settings (user_id, notifications_enabled, auto_refresh_interval, default_strategy_preference) VALUES (?, ?, ?, ?)',
        [1, true, 15, 'balanced']
      );
      
      console.log('用户设置数据初始化完成');
    } else {
      console.log('用户设置数据已存在，跳过初始化');
    }
    
    // 检查API密钥表是否存在数据
    const [apiKeyRows] = await connection.execute('SELECT COUNT(*) as count FROM api_keys');
    if (parseInt(apiKeyRows[0].count) === 0) {
      console.log('初始化API密钥数据...');
      // 创建示例API密钥
      await connection.execute(
        'INSERT INTO api_keys (user_id, service, encrypted_key, model) VALUES (?, ?, ?, ?)',
        [1, 'deepseek', '7f4e8d2a1b5c6f3e9d7a8b4c2e1d5f6a', 'deepseek-chat-v1']
      );
      
      console.log('API密钥数据初始化完成');
    } else {
      console.log('API密钥数据已存在，跳过初始化');
    }
    
    console.log('所有基础数据初始化完成！');
    
  } catch (error) {
    console.error('初始化数据失败:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// 执行初始化
initializeData();
