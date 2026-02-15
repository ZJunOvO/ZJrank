# API 500 错误诊断与修复方案

## 问题分析

当前 API 返回 500 错误的**根本原因**:

```
GET https://rank.zjun.xyz/api/collections 500 (Internal Server Error)
```

### 核心问题

查看 `api/collections.ts` 和 `api/profile.ts` 代码第 15-18 行:

```typescript
} else {
  // 本地开发或部署时使用文件
  const serviceAccount = require('../zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json');
  credential = admin.credential.cert(serviceAccount);
}
```

**问题所在**: 
- 该文件在 `.gitignore` 中被排除
- Vercel 部署时根本没有这个文件
- 当环境变量读取失败或未设置时,会尝试 require 不存在的文件
- 导致 500 错误

## 修复方案

### 方案 1: 简单粗暴 - 移除 fallback 逻辑

直接要求必须使用环境变量,如果没有就抛出明确错误:

```typescript
if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable is not set');
}

const serviceAccountJson = Buffer.from(
  process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
  'base64'
).toString('utf-8');

const serviceAccount = JSON.parse(serviceAccountJson);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

### 方案 2: 添加诊断端点

创建 `api/test-env.ts` 来检查环境变量是否正确配置:

```typescript
// 检查项目:
// 1. 环境变量是否存在
// 2. Base64 解码是否成功
// 3. JSON 解析是否成功
```

## 实施步骤

1. **创建诊断端点** `api/test-env.ts`
   - 访问 `https://rank.zjun.xyz/api/test-env` 检查环境变量状态

2. **修复 `api/collections.ts`**
   - 移除 require 本地文件的 fallback
   - 添加更详细的错误信息
   - 改进错误日志

3. **修复 `api/profile.ts`**
   - 同样的修复

4. **推送到 GitHub**
   - 触发 Vercel 自动部署

5. **验证修复**
   - 先访问诊断端点确认环境变量正常
   - 再测试实际 API

## 可能的环境变量问题

如果诊断端点显示环境变量有问题,可能原因:

1. **Base64 编码错误**
   - 重新编码服务账号 JSON 文件

2. **环境变量未生效**
   - Vercel 需要重新部署才能生效
   - 确认在正确的环境(Production)设置

3. **JSON 格式问题**
   - 服务账号 JSON 文件本身有问题

## 下一步行动

切换到 Code 模式执行以下操作:

- [ ] 创建 `api/test-env.ts` 诊断端点
- [ ] 修复 `api/collections.ts` 移除 fallback
- [ ] 修复 `api/profile.ts` 移除 fallback  
- [ ] 推送到 GitHub
- [ ] 指导用户访问诊断端点
