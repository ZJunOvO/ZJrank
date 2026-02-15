# 🚀 快速部署指南

## 立即部署到 Vercel

### 方法 1: 使用 Vercel CLI (推荐 - 最简单)

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署(首次部署)
vercel

# 4. 生产环境部署
vercel --prod
```

**优点**: 
- ✅ 自动上传服务账号密钥文件(即使在 `.gitignore` 中)
- ✅ 无需手动配置环境变量
- ✅ 一键部署

---

### 方法 2: 通过 GitHub + Vercel Dashboard

#### 步骤 1: 推送代码到 GitHub

```bash
git add .
git commit -m "feat: add Vercel Serverless Functions proxy for Firebase"
git push origin main
```

#### 步骤 2: 在 Vercel Dashboard 中导入项目

1. 访问 [vercel.com](https://vercel.com)
2. 点击 "Add New Project"
3. 选择你的 GitHub 仓库 `ZJrank`
4. 点击 "Import"

#### 步骤 3: 配置环境变量(可选但推荐)

为了安全起见,可以使用环境变量存储服务账号密钥:

1. 在本地生成 Base64 编码的密钥:

**Windows PowerShell:**
```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json"))
```

**Linux/Mac:**
```bash
base64 -w 0 zjrank-fb024-firebase-adminsdk-fbsvc-fe5b8bca5f.json
```

2. 在 Vercel 项目设置中:
   - Settings → Environment Variables
   - 添加变量名: `FIREBASE_SERVICE_ACCOUNT_BASE64`
   - 粘贴 Base64 编码的内容
   - 保存

3. 重新部署项目

#### 步骤 4: 绑定自定义域名(可选)

1. Settings → Domains
2. 添加你的域名(例如: `zjrank.yourdomain.com`)
3. 按照提示配置 DNS 记录

---

## 部署后验证

### 测试 API 端点

部署成功后,在浏览器中访问:

```
https://你的域名.vercel.app/api/collections
```

应该返回 JSON 格式的收藏集列表(可能为空数组):

```json
{
  "success": true,
  "data": []
}
```

### 测试前端应用

访问:

```
https://你的域名.vercel.app
```

应该看到 ZJrank 应用首页。

---

## 常见问题

### Q1: 部署后 API 返回 500 错误

**可能原因**: 服务账号密钥文件未找到

**解决方案**:
1. 确认使用 Vercel CLI 部署(会自动上传文件)
2. 或者配置环境变量 `FIREBASE_SERVICE_ACCOUNT_BASE64`

### Q2: 国内访问速度慢

**解决方案**: 绑定自定义域名并使用国内 CDN

### Q3: 数据不同步

**可能原因**: 轮询机制需要时间(默认 5 秒)

**解决方案**: 
- 在 `utils/api.ts` 中调整 `pollInterval` 参数
- 或者手动刷新页面

---

## 本地开发测试

### 测试 Vercel Functions

```bash
# 安装依赖
npm install

# 启动 Vercel 本地开发环境
vercel dev
```

访问 `http://localhost:3000` 测试应用。

### 测试 API 端点

```bash
# 获取收藏集
curl http://localhost:3000/api/collections

# 创建收藏集
curl -X POST http://localhost:3000/api/collections \
  -H "Content-Type: application/json" \
  -d '{"collection":{"title":"测试","template":"classic","coverImage":"","items":[]}}'
```

---

## 下一步

- [ ] 绑定自定义域名
- [ ] 配置 PWA (在手机上添加到主屏幕)
- [ ] 测试国内访问速度
- [ ] 根据需要调整轮询频率

详细文档请查看: [`VERCEL_DEPLOYMENT.md`](VERCEL_DEPLOYMENT.md)
