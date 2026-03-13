# @homeblog/ui

HomeBlog 内部 UI 组件库，用于沉淀页面级组件与基础控件。

## 安装

在 workspace 中引用：

```json
"@homeblog/ui": "file:../../packages/ui"
```

## 使用

客户端组件请从 `@homeblog/ui/client` 引用：

```tsx
import { TimeCard, QuoteCard, ThemeToggle } from '@homeblog/ui/client';
import '@homeblog/ui/styles.css';
```

服务端可使用基础组件：

```tsx
import { Button, Card, Input } from '@homeblog/ui';
```

## 组件

- Button / Card
- Input / Textarea / Select
- QuoteCard / TimeCard / ThemeToggle / VisitTracker
- ConfigEditor / TopbarActions

## 构建

```bash
npm run build -w packages/ui
```
