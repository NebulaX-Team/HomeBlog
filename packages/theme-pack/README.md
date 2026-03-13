# @homeblog/theme-pack

HomeBlog 默认主题包，包含主题变量与 tokens。

## 文件说明

- `theme.json`：主题配置
- `tokens.css`：基础 token
- `theme.css`：主题样式

## 使用

在 `site.config.ts` 中设置：

```ts
export const siteConfig = {
  activeTheme: '@homeblog/theme-pack'
};
```

加载由脚本 `scripts/load-theme.mjs` 处理。
