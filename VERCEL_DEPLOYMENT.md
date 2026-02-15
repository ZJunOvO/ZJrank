# Vercel 部署指南

## 部署前准备

### 1. 上传服务账号密钥文件

由于 Firebase 服务账号密钥文件 `zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json` 已被 `.gitignore` 排除(安全考虑),需要在 Vercel 项目中手动上传:

**方法 1: 通过 Vercel CLI 部署时包含文件**

```bash
# 确保服务账号密钥文件存在于项目根目录
vercel --prod
```

部署时,Vercel 会上传项目中的所有文件(包括被 `.gitignore` 排除的文件)。

**方法 2: 使用 Vercel 环境变量(推荐)**

1. 将服务账号密钥内容转换为 Base64:

```bash
# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json"))

# Linux/Mac
base64 zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json
```

2. 在 Vercel Dashboard 中设置环境变量:
   - 进入项目设置 → Environment Variables
   - 添加变量: `FIREBASE_SERVICE_ACCOUNT_BASE64`
   - 粘贴 Base64 编码的内容

3. 修改 API 文件以支持环境变量(已在代码中实现)

**方法 3: 直接在 Vercel 部署后上传文件**

1. 使用 Vercel CLI 连接到项目:
```bash
vercel link
```

2. 部署项目:
```bash
vercel --prod
```

注意: 由于 API 路由在 `api/` 目录中直接使用 `require('../zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json')`,最简单的方法是在首次部署时确保文件存在。

### 2. 验证部署

部署完成后,访问以下 URL 测试 API:

- `https://your-domain.vercel.app/api/collections` - 应返回收藏集列表
- `https://your-domain.vercel.app/api/profile` - 应返回用户资料

## 本地开发测试

### 安装依赖

```bash
npm install
```

### 本地运行 Vercel Functions

```bash
# 安装 Vercel CLI(如果尚未安装)
npm i -g vercel

# 在项目根目录运行
vercel dev
```

这会启动本地开发服务器,Vercel Functions 会在 `http://localhost:3000` 上运行。

### 测试 API 端点

```bash
# 获取收藏集
curl http://localhost:3000/api/collections

# 获取用户资料
curl http://localhost:3000/api/profile

# 创建新收藏集
curl -X POST http://localhost:3000/api/collections \
  -H "Content-Type: application/json" \
  -d '{"collection":{"title":"测试","template":"classic","items":[]}}'
```

## 架构说明

### Vercel Serverless Functions 代理架构

```
国内用户浏览器
    ↓ HTTPS
Vercel Edge Network (国内可访问)
    ↓
Vercel Serverless Functions (api/collections.ts, api/profile.ts)
    ↓ Firebase Admin SDK
Firebase Firestore (海外)
```

### 工作原理

1. **客户端请求**: 前端通过 `utils/api.ts` 发送 HTTP 请求到 `/api/*`
2. **Vercel 路由**: Vercel 将请求路由到对应的 Serverless Function
3. **Firebase Admin SDK**: Function 使用服务账号密钥访问 Firestore
4. **返回数据**: Function 将 Firestore 数据返回给客户端

### 实时更新机制

由于使用 HTTP API 替代 Firebase 实时监听器,实现了轮询机制:

- 默认每 5 秒轮询一次 (`utils/api.ts` 中的 `subscribeToCollections`)
- 仅在数据变化时触发 UI 更新
- 可通过调整 `pollInterval` 参数修改轮询频率

## 常见问题

### Q: 为什么不直接在客户端访问 Firebase?

A: Firebase Firestore 在中国大陆被防火墙阻止,即使使用 CDN 也无法访问。通过 Vercel Functions 作为代理,利用 Vercel 的全球 CDN 网络(包括国内节点)来访问 Firebase。

### Q: 实时性会受到影响吗?

A: 是的。原生 Firebase 实时监听器延迟通常在 100-500ms,而轮询机制延迟为 `pollInterval` 设置值(默认 5 秒)。对于双人使用的私人应用,这个延迟是可接受的。

### Q: 可以使用其他实时推送方案吗?

A: 可以考虑:
- **Pusher / Ably**: 提供 WebSocket 实时推送(需付费)
- **Server-Sent Events (SSE)**: Vercel Functions 支持,但有超时限制
- **轮询优化**: 使用 SWR 或 React Query 的智能缓存和重新验证

### Q: 服务账号密钥安全吗?

A: 服务账号密钥只存在于 Vercel 服务器端(Serverless Functions),不会暴露给客户端。确保:
- 密钥文件已添加到 `.gitignore`
- 不要将密钥提交到公开的 Git 仓库
- 定期在 Firebase Console 中轮换密钥

## 性能优化建议

1. **调整轮询频率**: 根据实际使用频率调整 `pollInterval`
2. **使用 SWR**: 在 `App.tsx` 中替换为 `useSWR` hook,获得更好的缓存和重新验证
3. **启用 Vercel Edge Caching**: 为 API 响应添加适当的缓存头
4. **压缩图片**: 确保上传的图片经过适当压缩(已在 `utils/api.ts` 中实现)

## 后续改进方向

1. **迁移到国内云服务**: 考虑迁移到腾讯云 CloudBase 或阿里云 Serverless
2. **添加 Service Worker**: 实现离线支持和后台同步
3. **WebSocket 实时推送**: 集成 Pusher 或 Ably 实现真正的实时同步
4. **PWA 推送通知**: 实现 Push API 通知用户更新
