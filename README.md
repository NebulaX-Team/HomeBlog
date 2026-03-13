# HomeBlog

HomeBlog 是一个个人主页 + 博客的单仓项目，包含前台站点、控制台配置页面，以及可复用的内部组件库。

## 结构

- `apps/web`：Next.js 站点
- `packages/ui`：HomeBlog 内部 UI 组件库
- `packages/rich-text-renderer`：Markdown/MDX 渲染器
- `packages/theme-pack`：主题包与 tokens
- `site.config.ts`：站点配置（控制台保存会写入这里）

## 本地运行

```bash
npm install
npm run dev
```

默认访问：
- `/` 主页
- `/blog` 博客
- `/console` 控制台

## 构建

```bash
npm run build
```

## Vercel 部署

建议以仓库根目录作为 Root Directory，并设置：

- Install Command: `npm install`
- Build Command: `npm run build -w apps/web`
- Output Directory: `apps/web/.next`
- Node 版本：使用 `.nvmrc` 中的版本

如果需要在 Vercel UI 中配置 Root Directory 到 `apps/web`，则：
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: `.next`

## 说明

- 站点配置写在 `site.config.ts`。
- 控制台保存会通过 `/api/site-config` 写入 `site.config.ts`。
- UI 组件和样式在 `packages/ui`，全局样式在 `apps/web/app/globals.css`。
