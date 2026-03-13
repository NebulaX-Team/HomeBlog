# @homeblog/rich-text-renderer

用于 Markdown/MDX 的渲染器，内置代码高亮、KaTeX、Mermaid 与 Callout。

## 安装

在应用中引入样式：

```ts
import '@homeblog/rich-text-renderer/styles.css';
```

## 使用

```tsx
import { compileMDX, renderMDX } from '@homeblog/rich-text-renderer';

const compiled = await compileMDX({
  input: mdxSource,
  enableMermaid: true,
  enableMath: true
});

const content = await renderMDX(compiled, {
  components: {
    // 在此覆写组件
  }
});

return <article>{content}</article>;
```

## Callout

```md
:::note
这是提示。
:::

:::warning
注意风险。
:::
```

## Mermaid

```md
````mermaid
flowchart TD
  A --> B
````
```

## KaTeX

KaTeX 样式已包含在 `styles.css` 中，无需额外引入。

## 选项

- `languages`：自定义代码语言白名单
- `highlighterTheme`：shiki 主题名（默认 `github-light`）
- `enableMermaid` / `enableMath`
- `remarkPlugins` / `rehypePlugins`

## 说明

- Mermaid 仅在客户端加载。
- 默认不启用原始 HTML，避免安全风险。
