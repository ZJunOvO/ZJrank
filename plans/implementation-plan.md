# ZJrank 实施计划

**项目定位：** 情侣私人使用的清单管理应用  
**核心目标：** 部署到Vercel，国内可访问  
**技术方案：** Vite构建 + Base64图片存储 + 无用户系统

---

## 📋 任务清单（按优先级）

### 🔥 优先级 P0：部署必需项（核心）

#### 任务1：创建Vercel部署配置
**文件：** `vercel.json`
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

#### 任务2：本地化CDN依赖（解决国内访问）
**目标：** 移除所有国外CDN，改为npm安装

**2.1 安装Tailwind CSS**
```bash
npm install -D tailwindcss@3 postcss autoprefixer
```

**2.2 创建配置文件**
- `tailwind.config.js` - 将index.html中的配置迁移过来
- `postcss.config.js` - PostCSS配置
- `src/index.css` - Tailwind入口文件

**2.3 下载Google Fonts**
- Libre Caslon Text
- Noto Serif SC
- Noto Sans SC
- Inter

**2.4 修改index.html**
- 移除CDN script标签
- 移除Google Fonts链接
- 移除Import Map（改用Vite构建）
- 添加本地字体引用

#### 任务3：清理无用文件
**删除：**
- `utils/db.ts` - 空文件，未使用
- `metadata.json` - 用途不明
- `.env.local` 中的 `GEMINI_API_KEY` - 未使用

---

### ⭐ 优先级 P1：代码优化（重要）

#### 任务4：统一项目命名为ZJrank
**修改文件：**
- `package.json` - name字段
- `index.html` - title标签
- `README.md` - 已完成 ✅
- Firebase collection名称建议保持不变（避免数据迁移）

#### 任务5：代码组织优化
**拆分 `CreateCollection.tsx`（485行）**

**子组件清单：**
1. `ItemList.tsx` - 物品列表展示
2. `ItemEditor.tsx` - 物品编辑表单
3. `SortableItem.tsx` - 可拖拽的列表项（已有，可独立）
4. `CoverImageUploader.tsx` - 封面图上传组件
5. `PreviewPanel.tsx` - 预览面板

**预期结果：**
- `CreateCollection.tsx` 缩减到约150行
- 每个子组件100行以内
- 提高可维护性

#### 任务6：更新README
**补充内容：**
- 强调项目名为ZJrank
- 说明使用Vite构建（不是ESM直接运行）
- 添加Base64存储说明和限制
- 添加国内访问说明
- 简化安全警告（私人使用无需过度担心）

---

### 🎨 优先级 P2：改进优化（可选）

#### 任务7：添加基础Firestore安全规则
**目标：** 防止恶意爬虫，但不影响你们使用

**规则建议：**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // 允许读取，限制写入频率
      allow read: if true;
      allow write: if request.time > resource.data.lastWrite + duration.value(1, 's');
    }
  }
}
```

#### 任务8：优化图片上传体验
**改进：**
- 添加上传进度提示
- 图片过大时警告（超过600KB）
- 失败重试机制

#### 任务9：性能优化
**优化点：**
- 图片懒加载
- 首屏加载优化
- 添加loading状态

---

## 🗂️ 文件创建清单

### 必须创建：

1. **`vercel.json`** - Vercel部署配置
2. **`tailwind.config.js`** - Tailwind配置
3. **`postcss.config.js`** - PostCSS配置
4. **`src/index.css`** - 样式入口文件
5. **`public/fonts/`** - 字体文件目录

### 组件拆分（可选但推荐）：

6. **`components/create/ItemList.tsx`**
7. **`components/create/ItemEditor.tsx`**
8. **`components/create/CoverImageUploader.tsx`**
9. **`components/create/PreviewPanel.tsx`**

---

## 📦 需要安装的依赖

```bash
# 开发依赖
npm install -D tailwindcss@3 postcss autoprefixer

# 生产依赖（已有，无需额外安装）
# - react, react-dom, framer-motion, firebase
```

---

## 🔄 实施顺序

### 阶段1：准备部署（30分钟）
1. 创建 `vercel.json`
2. 清理无用文件
3. 测试本地构建

### 阶段2：本地化依赖（60分钟）
1. 安装Tailwind CSS
2. 创建配置文件
3. 下载字体文件
4. 修改 `index.html`
5. 测试样式是否正常

### 阶段3：代码优化（90分钟）
1. 统一项目命名
2. 拆分 `CreateCollection.tsx`
3. 更新README

### 阶段4：部署测试（30分钟）
1. 部署到Vercel
2. 国内网络测试
3. 功能完整性测试

**总计：** 约3-3.5小时

---

## ✅ 验收标准

### 部署成功标准：
- [ ] Vercel部署无错误
- [ ] 页面正常显示
- [ ] 所有样式加载正常
- [ ] 字体显示正确

### 国内访问标准：
- [ ] 关闭VPN后能正常访问
- [ ] 首屏加载时间 < 3秒
- [ ] 图片能正常上传和显示
- [ ] Firestore数据能正常读写

### 功能完整性：
- [ ] 创建/编辑/删除榜单
- [ ] 图片上传和压缩
- [ ] 拖拽排序
- [ ] 实时数据同步
- [ ] 头像修改

---

## 🚀 部署流程

### 1. 本地测试
```bash
npm run build
npm run preview
```

### 2. 连接Vercel
```bash
# 安装Vercel CLI（可选）
npm i -g vercel

# 登录
vercel login

# 部署
vercel
```

### 3. 配置环境变量
在Vercel后台配置（如果需要）：
- 当前项目无需环境变量（Firebase配置硬编码）

### 4. 域名配置
- 使用Vercel提供的 `.vercel.app` 域名
- 或绑定自定义域名

---

## 📝 代码拆分示例

### CreateCollection.tsx 拆分方案

**主组件（CreateCollection.tsx）：**
```typescript
// 约150行
- 状态管理
- 页面布局
- 子组件协调
```

**子组件1：ItemList.tsx**
```typescript
// 约80行
- 列表渲染
- 拖拽容器
- 空状态展示
```

**子组件2：ItemEditor.tsx**
```typescript
// 约120行
- 编辑表单
- 图片上传
- 表单验证
```

**子组件3：CoverImageUploader.tsx**
```typescript
// 约60行
- 封面上传UI
- 图片预览
- 文件处理
```

---

## 🎯 关键注意事项

### ⚠️ 重要提醒：

1. **保留Firebase硬编码**
   - 私人使用，无需环境变量
   - 简化部署流程

2. **不实现用户系统**
   - 两人共用，无需认证
   - 降低复杂度

3. **Base64存储限制**
   - 图片压缩到600KB以内
   - 当前代码已做优化 ✅

4. **Firestore费用**
   - 免费额度完全够用
   - 无需担心成本

5. **国内访问**
   - Firestore可访问
   - 建议移动网络测试
   - 部分地区可能稍慢

---

## 📞 问题排查

### 如果部署失败：
1. 检查 `vercel.json` 是否正确
2. 运行 `npm run build` 查看构建错误
3. 检查 `dist` 目录是否生成

### 如果样式丢失：
1. 确认Tailwind配置正确
2. 检查 `index.css` 是否被引入
3. 查看浏览器控制台CSS错误

### 如果字体不显示：
1. 确认字体文件已下载
2. 检查字体路径是否正确
3. 查看Network面板字体加载状态

### 如果Firestore连接失败：
1. 检查Firebase配置是否正确
2. 确认Firestore数据库已创建
3. 查看浏览器控制台错误信息

---

**准备开始实施？确认后我将切换到Code模式执行任务。**
