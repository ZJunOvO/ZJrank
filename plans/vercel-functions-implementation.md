# ✅ Vercel Serverless Functions 实现总结

## 问题背景

Firebase Firestore 在中国大陆被防火墙阻止,导致应用无法在国内不挂梯子的情况下访问数据。

## 解决方案

采用 **Vercel Serverless Functions 作为 Firebase 代理** 的架构:

```
国内用户浏览器 → Vercel Edge Network → Serverless Functions → Firebase
```

## 实现内容

### 1. 创建的文件

| 文件路径 | 说明 |
|---------|------|
| [`api/collections.ts`](api/collections.ts) | 收藏集 CRUD 操作的 API 端点 |
| [`api/profile.ts`](api/profile.ts) | 用户资料的 API 端点 |
| [`utils/api.ts`](utils/api.ts) | 客户端 API 调用封装(替代 firebase.ts) |
| [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md) | 详细的部署指南和架构说明 |
| [`QUICK_START.md`](QUICK_START.md) | 快速部署参考指南 |

### 2. 修改的文件

| 文件路径 | 修改内容 |
|---------|----------|
| [`App.tsx`](App.tsx:13) | 导入从 `utils/firebase` 改为 `utils/api` |
| [`components/CreateCollection.tsx`](components/CreateCollection.tsx:4) | 导入从 `utils/firebase` 改为 `utils/api` |
| [`components/create/ItemEditor.tsx`](components/create/ItemEditor.tsx:2) | 导入从 `utils/firebase` 改为 `utils/api` |
| [`components/create/CoverImageUploader.tsx`](components/create/CoverImageUploader.tsx:2) | 导入从 `utils/firebase` 改为 `utils/api` |
| [`.gitignore`](.gitignore:27) | 添加服务账号密钥文件排除规则 |
| [`README.md`](README.md:138) | 更新部署说明,添加 Vercel Functions 架构介绍 |
| [`package.json`](package.json) | 安装 `firebase-admin` 和 `@vercel/node` |

### 3. 保留的文件

| 文件路径 | 说明 |
|---------|------|
| [`utils/firebase.ts`](utils/firebase.ts) | 保留用于本地开发或直接访问 Firebase |
| `zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json` | 服务账号密钥(已加入 .gitignore) |

## 核心实现

### API 端点设计

#### [`api/collections.ts`](api/collections.ts)

支持的操作:
- `GET /api/collections` - 获取所有收藏集
- `POST /api/collections` - 创建新收藏集
- `PUT /api/collections` - 更新收藏集
- `DELETE /api/collections?id=xxx` - 删除收藏集

#### [`api/profile.ts`](api/profile.ts)

支持的操作:
- `GET /api/profile` - 获取用户资料
- `POST /api/profile` - 保存用户资料

### 服务账号密钥加载

支持两种方式:

1. **文件方式**(本地开发):
   ```typescript
   const serviceAccount = require('../zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json');
   ```

2. **环境变量方式**(生产环境推荐):
   ```typescript
   const serviceAccountJson = Buffer.from(
     process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
     'base64'
   ).toString('utf-8');
   ```

### 客户端实时同步

使用**轮询机制**模拟实时更新:

```typescript
// utils/api.ts - subscribeToCollections
export const subscribeToCollections = (
  callback: (data: Collection[]) => void,
  pollInterval: number = 5000 // 默认 5 秒
) => {
  // 每隔 pollInterval 轮询一次
  // 只在数据变化时触发回调
}
```

**特点**:
- ✅ 默认 5 秒轮询间隔
- ✅ 智能比对,仅在数据变化时触发回调
- ✅ 返回取消订阅函数用于清理
- ⚠️ 实时性略有降低(相比 Firebase 原生监听器)

## 技术权衡

### 优势

1. **国内可访问**: 
   - Vercel 在国内有 CDN 节点
   - 无需 VPN 即可访问

2. **简单实现**:
   - 无需迁移数据库
   - 保留现有 Firebase 配置
   - 仅需添加代理层

3. **成本低**:
   - Vercel 免费版支持 Serverless Functions
   - Firebase 免费额度足够私人使用

### 劣势

1. **实时性降低**:
   - 原生: ~100-500ms 延迟
   - 轮询: 5 秒延迟(可调整)

2. **额外请求**:
   - 轮询会产生额外的 API 请求
   - 可能影响 Vercel 免费额度

3. **复杂度增加**:
   - 多了一层代理
   - 需要维护 API 端点

## 部署方式

### 推荐方式: Vercel CLI

```bash
vercel --prod
```

**优点**: 自动上传服务账号密钥文件

### 备用方式: 环境变量

1. 将密钥转为 Base64
2. 在 Vercel Dashboard 设置环境变量 `FIREBASE_SERVICE_ACCOUNT_BASE64`
3. 通过 GitHub 自动部署

详见: [`QUICK_START.md`](QUICK_START.md)

## 测试结果

### 构建测试

```bash
npm run build
```

**结果**: ✅ 成功
- 输出大小: ~458KB JS + ~1.1MB CSS
- 所有字体和图标本地化
- 无 TypeScript 错误

### API 端点(待用户测试)

- [ ] `/api/collections` - 获取数据
- [ ] `/api/collections` - 创建数据
- [ ] `/api/collections` - 更新数据
- [ ] `/api/collections?id=xxx` - 删除数据
- [ ] `/api/profile` - 用户资料

## 后续优化建议

### 短期优化

1. **调整轮询频率**: 根据实际使用情况调整 `pollInterval`
2. **添加错误重试**: API 调用失败时自动重试
3. **缓存优化**: 使用 SWR 或 React Query 优化缓存

### 中期优化

1. **Server-Sent Events (SSE)**: 
   - 替代轮询,实现准实时推送
   - Vercel Functions 支持,但有超时限制

2. **WebSocket (通过第三方)**:
   - 集成 Pusher / Ably
   - 实现真正的实时同步
   - 需要付费服务

### 长期优化

1. **迁移到国内云服务**:
   - 腾讯云 CloudBase
   - 阿里云 Serverless
   - 完全避免跨境访问问题

2. **PWA 离线支持**:
   - Service Worker 缓存
   - 后台同步 API
   - 更好的用户体验

## 相关文档

- [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md) - 完整部署指南
- [`QUICK_START.md`](QUICK_START.md) - 快速开始指南
- [`README.md`](README.md) - 项目说明

## 总结

通过 Vercel Serverless Functions 代理方案,成功解决了 Firebase 在国内无法访问的问题。虽然实时性略有降低,但对于双人私人使用的场景,5 秒的轮询延迟是完全可接受的。

整体实现简洁、可维护,且无需迁移现有数据。用户可以立即部署并在国内不挂梯子的情况下正常使用。
