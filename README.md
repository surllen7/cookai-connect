# CookAI Connect

一款基于 AI 的智能食谱推荐移动端 Web 应用。用户选择手边的食材，AI 实时生成个性化食谱，配合社区分享与用户账户体系，打造完整的烹饪助手体验。

---

## 技术栈

| 分类 | 技术 |
|------|------|
| 前端框架 | React 19 + TypeScript 5.8 |
| 构建工具 | Vite 6 |
| 样式 | Tailwind CSS 4 |
| 路由 | React Router DOM 7 |
| 图标 | Lucide React |
| 后端服务 | Supabase（Auth + 数据库） |
| AI 模型 | DeepSeek Chat API（流式输出） |

---

## 主要功能

### 食材选择
- 按肉类、蔬菜、调料三类分类浏览
- 支持自定义添加食材
- 6 种以上主料时自动启用 AI 优选模式

### AI 食谱生成（三种模式）
- **推荐模式**（≤1 种食材）：给出 2-3 个食谱方向 + 补购清单
- **生成模式**（2-5 种食材）：生成一份最优食谱
- **丰盛模式**（≥6 种食材）：AI 自动挑选最佳搭配，生成一份食谱

食谱通过 DeepSeek API 流式输出，实时渲染。

### 食谱展示
- 中英文菜名、烹饪时长、难度、份量
- 带 emoji 的食材清单 + 用量说明
- 分步骤烹饪指引（带时间轴可视化）
- AI 烹饪小贴士
- 登录后可收藏到个人主页

### 用户系统
- 邮箱 OTP 注册，邮箱/用户名登录
- 修改密码、一键重置默认密码
- 个人主页管理已收藏食谱

### 社区（开发中）
- Pinterest 瀑布流布局展示用户帖子
- 发现页 / 关注页双 Tab
- 发帖入口 UI 已就绪

---

## 项目结构

```
src/
├── pages/        # 路由页面（HomePage、RecipePage、ProfilePage 等）
├── components/   # 可复用组件（CategorySection、PostCard、BottomNav 等）
├── context/      # AuthContext 全局认证状态
├── hooks/        # useAuth、useSavedRecipes
├── lib/          # recipeApi.ts（DeepSeek 集成）、supabase.ts
├── types/        # TypeScript 类型定义
└── constants/    # 食材与社区 Mock 数据
```

---

## 本地运行

**前置依赖：** Node.js 18+

1. 安装依赖：
   ```bash
   npm install
   ```

2. 创建 `.env.local` 并填写以下环境变量：
   ```env
   VITE_DEEPSEEK_KEY=your_deepseek_api_key
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. 启动开发服务器（默认端口 3000）：
   ```bash
   npm run dev
   ```

---

## 数据库结构（Supabase）

| 表名 | 说明 |
|------|------|
| `auth.users` | Supabase 托管的用户认证表 |
| `profiles` | 用户资料（id、username、email） |
| 收藏食谱 | 以 JSON 列存储在 profiles 或独立表中 |

---

## UI 设计说明

- 移动端优先，最大宽度 430px，模拟手机容器
- 主色调绿色 `#84B741`，渐变 CTA 按钮带光效动画
- 底部导航栏 Tab 切换
- Toast 通知 + Modal 弹窗交互
