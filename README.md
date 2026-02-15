# ZJrank (Muse Collections)

**ZJrank** 是一款高端、具有杂志质感的清单管理与种草应用。它允许用户以极具视觉冲击力的方式（经典清单或杂志专栏）整理心愿单、礼物清单或探店指南。

项目主打极致的 **UI/UX 体验**，采用了"老钱风"（Old Money）的视觉美学，并实现了原生 App 级别的 **共享元素转场动画 (Shared Element Transitions)**。

> 🌟 **私人项目**：专为情侣私人使用设计，支持实时数据同步。

## ✨ 核心特性

*   **高端视觉风格**：采用 `Libre Caslon Text` 和 `Noto Serif SC` 衬线字体，配合噪点纹理背景、暖色调（#ded5b6）和磨砂玻璃特效，营造复古而优雅的氛围。
*   **流畅的交互动画**：
    *   **共享元素转场**：点击首页卡片时，封面图和标题会无缝“飞”入详情页，提供连续的视觉体验。
    *   **页面过渡**：页面切换带有平滑的淡入淡出和位移效果。
    *   **微交互**：按钮点击、列表加载均带有细腻的反馈动画。
*   **多模板展示**：
    *   **Classic (经典清单)**：适合礼物单、购物清单。支持图片自适应比例展示（Smart Image Adaptation），无论长图还是宽图都能完美呈现。
    *   **Editorial (杂志专栏)**：适合深度评测、美食探店。拥有巨大的 Hero Image 封面，强调 Top 3 排名的视觉权重。
*   **沉浸式体验**：去除了原生浏览器样式的干扰，全屏应用设计，底部悬浮导航栏。

## 🛠 技术栈与版本

本项目采用 **React 18** + **TypeScript** + **Vite** 开发，使用 **Firebase** 作为后端服务。

| 库 / 工具 | 版本 | 说明 |
| :--- | :--- | :--- |
| **React** | `18.3.1` | 核心 UI 库 |
| **ReactDOM** | `18.3.1` | DOM 渲染 |
| **Framer Motion** | `11.3.2` | 负责所有转场、共享元素和手势动画 |
| **Firebase** | `12.9.0` | 数据库 (Firestore) + 图片存储 |
| **Vite** | `6.2.0` | 构建工具和开发服务器 |
| **TypeScript** | `5.8.2` | 类型系统 |
| **Tailwind CSS** | `3.x` | 原子化 CSS 框架 |

## 📂 项目结构

```
/
├── index.html              # 入口文件
├── index.tsx               # React 挂载点
├── App.tsx                 # 主路由控制器 (处理页面状态)
├── types.ts                # TypeScript 类型定义
├── constants.ts            # 常量和图片资源
├── components/
│   ├── BottomNav.tsx       # 底部悬浮导航栏
│   ├── Feed.tsx            # 首页信息流
│   ├── Profile.tsx         # 个人中心
│   ├── DetailClassic.tsx   # 详情页 - 经典模板
│   ├── DetailEditorial.tsx # 详情页 - 杂志模板
│   ├── CreateCollection.tsx# 创建/编辑页
│   └── TemplateModal.tsx   # 模板选择弹窗
├── utils/
│   └── firebase.ts         # Firebase 数据库操作
└── plans/
    └── zjrank-improvement-plan.md  # 项目改进计划
```

## ✅ 已实现功能

1.  **数据持久化**
    *   [x] Firebase Firestore 实时数据同步
    *   [x] 图片压缩并转Base64存储
    *   [x] 用户头像云端保存

2.  **浏览体验**
    *   [x] 瀑布流/列表式卡片展示
    *   [x] 顶部标题栏吸顶效果
    *   [x] 搜索栏 UI（仅视觉）

3.  **详情展示**
    *   [x] **共享元素动画**：从列表到详情的无缝转场
    *   [x] **Classic 模板**：智能图片自适应容器
    *   [x] **Editorial 模板**：杂志封面级头部设计

4.  **创建与编辑**
    *   [x] 模板选择弹窗
    *   [x] 完整的创建/编辑表单
    *   [x] 图片上传和压缩
    *   [x] 拖拽排序功能
    *   [x] 实时预览

5.  **个人中心**
    *   [x] 用户头像自定义
    *   [x] 数据统计展示
    *   [x] 榜单网格视图

## 🚧 已知问题与待优化

**部署相关：**
*   ✅ 已添加 Vercel 部署配置（`vercel.json`）
*   ✅ 已本地化所有 CDN 资源（Tailwind, Fonts），确保国内无障碍访问
*   ⚠️ Firebase API密钥硬编码在代码中（私人使用便捷性权衡）
*   ⚠️ 缺少 Firestore 安全规则配置

**功能缺失：**
*   ❌ 搜索功能未实现
*   ❌ 用户认证系统
*   ❌ 数据导出/备份功能
*   ❌ 浏览器路由支持

**详细改进计划请查看：** [`plans/zjrank-improvement-plan.md`](plans/zjrank-improvement-plan.md)

## 🎨 设计细节

*   **色彩系统**：
    *   Primary: `#ded5b6` (羊皮纸色)
    *   Background: `#f7f7f6` (米白)
    *   Dark: `#1d1b15` (炭黑)
*   **纹理**：全局覆盖了一层 SVG Noise (噪点) 滤镜，配合 `mix-blend-multiply` 混合模式，模拟纸张质感。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 环境变量配置

创建 `.env.local` 文件并配置 Firebase：

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 部署到 Vercel

本项目已配置好 Vercel 部署文件。

1. Fork 本仓库或推送到你的 GitHub。
2. 在 Vercel 中 Import Project。
3. 保持默认配置即可（已在 `vercel.json` 中配置了 SPA 路由重写）。
4. 点击 Deploy。

**注意：** 为了确保国内访问速度，我们已经移除了所有国外 CDN 依赖，字体和样式文件均打包在项目中。

## 🔐 安全提醒

**当前项目存在以下安全隐患（私人使用前必须解决）：**

1. ❌ Firebase API密钥暴露在代码中
2. ❌ Firestore数据库无访问控制（任何人都能读写）
3. ❌ 没有用户认证系统

**建议措施：**
- 将Firebase配置移到环境变量
- 在Firebase Console配置Firestore安全规则
- 添加简单的密码保护或Firebase Authentication

详细解决方案请查看改进计划文档。

---

*Built with ❤️ for strict aesthetic standards.*
