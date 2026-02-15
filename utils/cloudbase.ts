import cloudbase from '@cloudbase/js-sdk';

const ENV_ID = 'zjun-5gbmb6tq61f3235e';

// 初始化 CloudBase 应用
export const app = cloudbase.init({
  env: ENV_ID
});

// 获取数据库实例
export const db = app.database();

// 获取 Auth 实例
// 使用 any 绕过类型检查，因为 SDK 类型定义可能不完整
export const auth = app.auth({
  persistence: 'local' 
}) as any;

// 匿名登录函数
export const signInAnonymously = async () => {
  const loginState = await auth.getLoginState();
  if (loginState) {
    return loginState;
  }

  try {
    await auth.anonymousAuthProvider().signIn();
    return await auth.getLoginState();
  } catch (error) {
    console.error('Anonymous login failed:', error);
    throw error;
  }
};

// 确保已登录
export const ensureAuth = async () => {
  const loginState = await auth.getLoginState();
  if (!loginState) {
    await signInAnonymously();
  }
};
